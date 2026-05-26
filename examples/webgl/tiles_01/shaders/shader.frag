#version 300 es
precision highp float;

out vec4 outColor;

uniform float u_time;
uniform vec2 u_mouse;
uniform sampler2D u_image;
uniform vec2 u_imageResolution;
uniform vec2 u_imagePosition;

const float PI = 3.141592653589;

void main() {
    float tileSize = 1. + sin(u_time) + 15. * distance(u_mouse, u_imagePosition + u_imageResolution / 2.) / u_imageResolution.x;

    vec2 pixelated_uv = gl_FragCoord.xy - mod(gl_FragCoord.xy, tileSize);
    vec2 uv = (pixelated_uv - u_imagePosition) / u_imageResolution;
    vec4 image = texture(u_image, uv);

    outColor = image;
}