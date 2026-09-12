const rangeEl = document.getElementById('intensity');
const range2El = document.getElementById('intensity-2');
const gaussianBlurEl = document.getElementById('gaussian-blur')
const gaussianBlur2El = document.getElementById('gaussian-blur-2')
const intensityValueEL = document.getElementById('intensity-value')
const intensityValue2EL = document.getElementById('intensity-value-2')
const moveCircleEl = document.querySelector('.circle-move')

rangeEl.addEventListener('input', e => {
    gaussianBlurEl.setAttribute('stdDeviation', e.target.value)
    intensityValueEL.textContent = e.target.value
})

range2El.addEventListener('input', e => {
    gaussianBlur2El.setAttribute('stdDeviation', e.target.value)
    intensityValue2EL.textContent = e.target.value
})

function drawPoints(count, r, circleR) {
    const container = document.querySelector('.main-circle-group').parentElement;
    const containerText = document.querySelector('.texts');
    const points = getCirclePoints(count, r);
    let i = 0;

    for (const point of points) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.classList.add('circle-group');
        g.style.setProperty('--x', `${point[0]}%`);
        g.style.setProperty('--y', `${point[1]}%`);
        g.style.setProperty('--color', `${colors[i % colors.length]}`);
        g.innerHTML = `<circle cx="0" cy="0" r="${circleR}"></circle>`;
        g.addEventListener('pointerenter', (function (index) {
            return function () {
                moveCircleEl.style.setProperty('--x', `${point[0]}%`);
                moveCircleEl.style.setProperty('--y', `${point[1]}%`);
                moveCircleEl.style.setProperty('--color', `${colors[index % colors.length]}`);
            };
        })(i))

        g.addEventListener('pointerleave', backToCenter)

        container.appendChild(g)

        const gText = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gText.classList.add('text-group');
        gText.style.setProperty('--x', `${point[0]}%`);
        gText.style.setProperty('--y', `${point[1]}%`);
        gText.style.setProperty('--text-size', `${10 - circleR}px`);
        gText.innerHTML = `<text>${submenus[i % submenus.length]}</text>`

        containerText.appendChild(gText);
        i++;
    }
}

function backToCenter() {
    moveCircleEl.style.setProperty('--x', `50%`);
    moveCircleEl.style.setProperty('--y', `50%`);
    moveCircleEl.style.setProperty('--color', `#02a533`);
}

document.querySelector('.main-circle-group:has(circle').addEventListener('pointerenter', backToCenter)

function getCirclePoints(n, r) {
    const center = [50, 50];
    const points = [];

    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;

        const x = center[0] + r * Math.cos(angle);
        const y = center[1] + r * Math.sin(angle);

        points.push([x, y]);
    }

    return points;
}

const submenus = ['About', 'Blog', 'Work', 'Social', 'Projects', 'Feed', 'Reviews', 'Subscribe', 'Tech', 'Products'];
const colors = ['#6a4c93', '#565aa0', '#4267ac', '#1982c4', '#36949d', '#8ac926', '#679436', '#c7d66d']
drawPoints(8, 30, 8);