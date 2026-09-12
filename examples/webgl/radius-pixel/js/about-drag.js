const canvas = document.getElementById('canvas');
const sideImage = document.getElementById('side-image');
let sideImageRect = sideImage.getBoundingClientRect();
const sideImageRatio = 9 / 5;
let sideImageHeight = sideImageRect.width / sideImageRatio;

const mouse = { x: 0, y: 0 }

document.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.getElementById('intensity').addEventListener('input', (e) => {
    document.getElementById('intensity-value').textContent = e.target.value;
    gl.uniform1f(uPixelIntensity, Number(e.target.value));
})