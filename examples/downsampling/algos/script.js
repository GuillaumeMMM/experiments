import * as d3 from "d3";
import json from './assets/pageviews-2015-07-01-2026-10-01.json';
import { largestTriangleThreeBuckets } from "./lttb";

const dataset = Object.entries(json).map(([date, value]) => ({ date: d3.utcParse("%Y-%m-%d")(date), value }))
    .sort((a, b) => a.date - b.date)

let x;
let y;

function renderTimeseries(container, data) {
    container.querySelector('svg')?.remove();
    const { width, height } = container.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    y = d3.scaleLinear()
        .domain([0, 14000]).nice()
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40, "~s").tickSizeOuter(0));

    svg.append("path").attr("class", "line")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke-width", 0.8)
        .attr("d", d3.line().x(d => x(d.date)).y(d => y(d.value)));

    return svg.node();
}

Array.from(document.querySelectorAll('.chart')).forEach(el => {
    renderTimeseries(el, dataset);
})


//  DOWNSAMPLING
//  DECIMATION
const downsampling1Input = document.getElementById('algo1-factor');
const downsampling1InputValue = document.getElementById('algo1-factor-value');

downsampling1Input.addEventListener('input', e => {
    renderTimeseries(document.getElementById('chart-1'), decimation(dataset, Number(e.target.value)));
    downsampling1InputValue.textContent = e.target.value
})

function decimation(data, decimationInterval) {
    const downsampled = [];
    for (let i = 0; i < data.length; i += (decimationInterval + 1)) {
        downsampled.push(data[i]);
    }
    return downsampled;
}

//  BUCKET AGGREGATION
const downsampling2Input = document.getElementById('algo2-bucket-width');
const downsampling2Select = document.getElementById('algo2-bucket-algo');
const downsampling2InputValue = document.getElementById('algo2-bucket-width-value');

downsampling2Input.addEventListener('input', e => {
    renderTimeseries(
        document.getElementById('chart-2'),
        bucketAggregation(dataset, Number(e.target.value), downsampling2Select.value),
    );
    downsampling2InputValue.textContent = e.target.value
})

downsampling2Select.addEventListener('input', e => {
    renderTimeseries(
        document.getElementById('chart-2'),
        bucketAggregation(dataset, Number(downsampling2Input.value), e.target.value),
    );
})

function bucketAggregation(data, bucketWidth, fn) {
    const downsampled = [];

    for (let i = 0; i < data.length; i += bucketWidth) {
        const bucket = data.slice(i, i + bucketWidth);
        let flatValue = bucket[0].value;
        if (fn === 'max') {
            flatValue = Math.max(...bucket.map(v => v.value));
        }

        if (fn === 'min') {
            flatValue = Math.min(...bucket.map(v => v.value));
        }

        if (fn === 'avg') {
            bucket.reduce((acc, v) => acc + v.value, 0) / bucket.length;
        }

        downsampled.push({ date: bucket[0].date, value: flatValue })
    }

    return downsampled;
}


//  LTTB
const lttbInput = document.getElementById('algo3-bucket-width');
const lttbInputValue = document.getElementById('algo3-bucket-width-value');

lttbInput.addEventListener('input', e => {
    renderTimeseries(document.getElementById('chart-3'), largestTriangleThreeBuckets(dataset.map(d => ({ x: x(d.date), y: y(d.value) })), Number(e.target.value)).map(d => ({ date: x.invert(d.x), value: y.invert(d.y) })));
    lttbInputValue.textContent = e.target.value
})