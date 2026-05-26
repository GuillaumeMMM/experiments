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

    return { texture, width: img.width, height: img.height };
}

(async function () {
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl2");

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
        await loadShaderSource("./shaders/shader.vert")
    );

    const fragmentShader = compileShader(
        gl.FRAGMENT_SHADER,
        await loadShaderSource("./shaders/shader.frag")
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const positions = new Float32Array([
        // x, y, u, v
        -1, -1, 0, 0,
        1, -1, 1, 0,
        -1, 1, 0, 1,
        -1, 1, 0, 1,
        1, -1, 1, 0,
        1, 1, 1, 1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Attribute locations
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

    const uvLoc = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);

    const { texture, width, height } = await createTexture(gl, "./moi.png");

    const uImageLoc = gl.getUniformLocation(program, "u_image");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uImageResolutionLoc = gl.getUniformLocation(program, "u_imageResolution");
    const uImagePosLoc = gl.getUniformLocation(program, "u_imagePosition");

    gl.uniform2f(uImageResolutionLoc, width, height);

    let start = performance.now();
    function render() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uImageLoc, 0);

        let now = performance.now();
        gl.uniform1f(uTimeLoc, (now - start) * 0.0001);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    render();

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform2f(uImageResolutionLoc, canvas.height * (width / height), canvas.height);
        gl.uniform2f(uImagePosLoc, (canvas.width / 2) - width * (width / height), 0);
        gl.uniform2f(uMouseLoc, 0, 0);
    }
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener('mousemove', e => {
        gl.uniform2f(uMouseLoc, e.clientX, e.clientY);
    })
    resizeCanvas();
})();