#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_mouse;
uniform float u_pixel_intensity;

uniform sampler2D u_image_bg;
uniform vec2 u_imagePos_bg;
uniform vec2 u_imageSize_bg;

vec4 pixelized(sampler2D tex, vec2 uv, float blurDiscFactor, float tileSize, float distanceToMouse) {
    vec2 texSize = vec2(textureSize(tex, 0));
    float aspect = texSize.x / texSize.y;
    ;
    float disc = smoothstep(50., 1000. / blurDiscFactor, distanceToMouse * (u_pixel_intensity / 10.));

    vec2 size = tileSize * vec2(aspect, 1.0);

    vec2 snapped = mix(uv, floor(uv * size) / size, disc);
    vec2 texel = snapped * texSize;

    return texelFetch(tex, ivec2(floor(texel) + 0.5), 0);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uvBg = (fragCoord - u_imagePos_bg) / u_imageSize_bg;

    float distanceToMouse = distance(u_mouse, gl_FragCoord.xy);

    vec4 pixelizedBg = pixelized(u_image_bg, uvBg, .8, 25., distanceToMouse);

    outColor = pixelizedBg;
}
