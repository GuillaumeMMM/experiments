let gl;
let uPixelIntensity;

async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = ""; // optional if loading from another domain
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

async function createTexture(gl, url) {
    const img = await loadImage(url);
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_2D);

    return texture;
}

(async function () {
    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("WebGL2 not supported in your browser.");
    }

    // Compile shader helper
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = compileShader(
        gl.VERTEX_SHADER,
        await loadShaderSource("js/shaders/shader.vert")
    );

    const fragmentShader = compileShader(
        gl.FRAGMENT_SHADER,
        await loadShaderSource("js/shaders/shader.frag")
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    // Fullscreen quad positions
    const positions = new Float32Array([
        -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    // Create buffer and upload data
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Bind attribute
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");

    //  Start time of bg transition on collision
    const uStartTransitionTimeLoc = gl.getUniformLocation(program, "u_time_start_trans");

    //  Initial fade transition advancement
    const uApparitionTransitionTimeLoc = gl.getUniformLocation(program, "u_time_apparition_trans");
    gl.uniform1f(uStartTransitionTimeLoc, 1);
    gl.uniform1f(uApparitionTransitionTimeLoc, 1);

    let texture_bg = await createTexture(gl, `img/bg${Math.trunc(Math.random() * 5)}.webp`);
    console.log('ici')
    uPixelIntensity = gl.getUniformLocation(program, "u_pixel_intensity");
    gl.uniform1f(uPixelIntensity, 10);

    //  Current background texture
    const uImageLoc = gl.getUniformLocation(program, "u_image_bg");

    //  Background position
    const uImagePosLoc = gl.getUniformLocation(program, "u_imagePos_bg");

    //  Background size
    const uImageSizeLoc = gl.getUniformLocation(program, "u_imageSize_bg");
    gl.uniform1i(uImageLoc, 0);

    let documentRect = document.documentElement.getBoundingClientRect();

    function render() {

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture_bg);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        updateTexturesPositions();

        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        documentRect = document.documentElement.getBoundingClientRect();
        sideImageRect = sideImage.getBoundingClientRect();
        sideImageHeight = sideImageRect.width / sideImageRatio;

        canvas.setAttribute('width', `${documentRect.width}px`);
        canvas.setAttribute('height', `${documentRect.height}px`);
        gl.viewport(0, 0, documentRect.width, documentRect.height);

        updateTexturesPositions();
    }

    function updateTexturesPositions() {
        //  Match background position and size with DOM side-image div
        gl.uniform2f(uImagePosLoc, sideImageRect.left, documentRect.height - window.scrollY - sideImageRect.y - sideImageHeight);
        gl.uniform2f(uImageSizeLoc, sideImageRect.width, sideImageHeight);

        gl.uniform2f(uMouseLoc, mouse.x, documentRect.height - mouse.y);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", resizeCanvas);

    resizeCanvas();
    render();
})();
