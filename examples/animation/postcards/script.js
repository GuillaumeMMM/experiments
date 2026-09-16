const pointsEl = document.querySelector('.points');
const containerRect = document.querySelector('.container').getBoundingClientRect();
const width = containerRect.width * 0.8;
const height = containerRect.height * 0.8;

let moveAwayIntensity = 10;
let cardsCount = 20;

function buildCards() {
    Array.from(pointsEl.querySelectorAll('.point')).forEach(el => el.remove());

    let points = [];
    let initialTranslate = [];
    let initialRotate = [];
    const postAngleIntensity = 12;


    const posiblePosInSpace = 10;
    const cardRatio = 1.41;
    const cardWidth = 5 * width / cardsCount;
    const cardHeight = cardWidth / cardRatio;


    const possiblePos = [];
    for (let i = 0; i <= Math.trunc(width / posiblePosInSpace); i++) {
        for (let j = 0; j <= Math.trunc(height / posiblePosInSpace); j++) {
            possiblePos.push([i * posiblePosInSpace - (width / 2) - (cardWidth / 2), j * posiblePosInSpace - (height / 2) - (cardHeight / 2)]);
        }
    }

    for (let i = 0; i < cardsCount; i++) {
        const randIndex = Math.trunc(possiblePos.length * Math.random());
        initialTranslate[i] = possiblePos[randIndex];
        initialRotate[i] = Math.random() * postAngleIntensity * (Math.random() > 0.5 ? 1 : -1);
        possiblePos.splice(randIndex, 1)
    }

    for (let i = 0; i < cardsCount; i++) {
        const li = document.createElement('li')
        li.classList.add('point')
        li.style.setProperty('--width', `${cardWidth}px`);
        li.style.setProperty('--height', `${cardHeight}px`);
        li.style.zIndex = i + 1;
        li.style.transform = `translate(${initialTranslate[i][0]}px, ${initialTranslate[i][1]}px) rotate(${initialRotate[i]}deg)`

        points.push(li)

        li.addEventListener('pointerenter', (e) => {
            const hoveredPoint = e.currentTarget;
            const hoverIndex = points.indexOf(hoveredPoint);

            for (const pt of points) {
                if (pt === hoveredPoint || (Number(hoveredPoint.style.zIndex) > Number(pt.style.zIndex))) {
                    continue;
                }

                const index = points.indexOf(pt)
                const translation = translateAwayDelta(initialTranslate[hoverIndex], initialTranslate[index], moveAwayIntensity)
                pt.style.transform = `translate(${initialTranslate[index][0] + translation[0]}px, ${initialTranslate[index][1] + translation[1]}px) rotate(${initialRotate[index]}deg)`
            }
        })

        li.addEventListener('pointerleave', (e) => {
            for (const pt of points) {
                if (pt === e.target) {
                    continue;
                }
                const index = points.indexOf(pt)
                pt.style.transform = `translate(${initialTranslate[index][0]}px, ${initialTranslate[index][1]}px) rotate(${initialRotate[index]}deg)`
            }
        });

        pointsEl.appendChild(li);
    }
}

const rangeMoveAwayEl = document.getElementById('move-away-intensity')
const rangeMoveAwayValueEl = document.getElementById('move-away-intensity-value')
rangeMoveAwayEl.addEventListener('input', e => {
    moveAwayIntensity = e.target.value
    buildCards()
    rangeMoveAwayValueEl.textContent = e.target.value
})

const cardsCountEl = document.getElementById('cards-count')
const cardsCountValueEl = document.getElementById('cards-count-value')
cardsCountEl.addEventListener('input', e => {
    cardsCount = e.target.value
    buildCards()
    cardsCountValueEl.textContent = e.target.value
})

buildCards();


function translateAwayDelta(anchorPoint, pointToMove, intensity) {
    const dx = pointToMove[0] - anchorPoint[0];
    const dy = pointToMove[1] - anchorPoint[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return [0, 0];

    const ux = dx / distance;
    const uy = dy / distance;

    const decayRate = 0.005;
    const falloff = 20 * intensity * Math.exp(-decayRate * distance);

    return [ux * falloff, uy * falloff];
}