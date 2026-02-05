import * as d3 from "d3";
import { fullyRoundedRectPath } from './utils';

export function buildChart(container, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(640, maxWidth);
    const height = 400;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 40;
    const marginLeft = 30;
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    const barOutlineThickness = 5;

    // Declare the x scale
    const x = d3.scaleBand().domain(data.map(e => e[0]))
        .range([0, innerWidth])
        .paddingOuter(0.3)
        .paddingInner(0.5);

    // Declare the y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([innerHeight, 0]);

    // Create the SVG container
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Add the x-axis
    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10 + barOutlineThickness)).call(g => g.select(".domain").remove());

    // Add the y-axis
    chart.append("g")
        .attr("transform", `translate(0,0)`)
        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickValues(
                    y.ticks(5).filter(d => d !== 0)
                )
                .tickSize(-innerWidth)
                .tickPadding(10)
        )
        .call(g => g.select(".domain").remove())

    const bars = chart.append('g');

    //  Add one group for each bar
    const barGroups = bars.selectAll('.bar').data(data)
        .join('g').attr('class', 'bar')
        .attr('id', d => `bar-${d[0]}`)
        .attr('transform', d => `translate(${x(d[0])},${y(d[1])})`);

    barGroups.append('path').attr('class', 'bar-bg')
        .attr('d', d => {
            const barWidth = x.bandwidth();
            const barHeight = innerHeight - y(d[1]);
            const barX = 0;
            const barY = 0;
            const radius = 20;
            return fullyRoundedRectPath(barX, barY, barWidth, barHeight, radius);
        });

    barGroups.append('path').attr('class', 'bar-fr')
        .attr('d', d => {
            const barWidth = x.bandwidth() - 2 * barOutlineThickness;
            const barHeight = innerHeight - y(d[1]) - 2 * barOutlineThickness;
            const barX = barOutlineThickness;
            const barY = barOutlineThickness;
            const radius = 15;
            return fullyRoundedRectPath(barX, barY, barWidth, barHeight, radius);
        });

    barGroups.append('text').attr('class', 'value')
        .attr('x', x.bandwidth() / 2)
        .attr('y', 25).text(d => d[1]);

    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    // Append the SVG element to the container
    container.append(svg.node());
}