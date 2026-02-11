import { create, geoPath, color } from "d3";
import { geoGinzburg8 } from "d3-geo-projection";
import { getRoundedRectPath } from "./utils";

export async function buildChart(container, geoData, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(600, maxWidth);
    const marginBottom = 60;
    const height = 550;
    const innerHeight = height - marginBottom;

    const categories = {
        Aldi: {
            background: '#59a0f8',
            thickness: 0,
            darker: 0.5,
            angle: 90,
        },
        Auchan: {
            background: '#69c920',
            thickness: 2,
            darker: 0.5,
            angle: 45,
        },
        Carrefour: {
            background: '#ffe600',
            thickness: 2,
            darker: 0.5,
            angle: -45,
        },
    }

    const labelOffsets = { 'IE': [-30, 0], 'HR': [-40, 20], 'RO': [30, -10], 'LV': [25, -10], 'AT': [30, 0], 'GR': [50, 10] }

    // Create the SVG container
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height);

    //  Patterns for the country stripes
    const defs = svg.append('defs');
    const patterns = defs.selectAll('pattern').data(Object.entries(categories)).join('pattern').attr('id', d => `store-fill-${d[0]}`).attr('patternUnits', 'userSpaceOnUse').attr('width', 10).attr('height', 10).attr('patternTransform', d => `rotate(${d[1].angle})`)
    patterns.append('rect').attr('width', 10).attr('height', 10).attr('fill', d => categories[d[0]].background);
    patterns.append('rect').attr('x', 0).attr('y', 0).attr('width', 10).attr('height', d => categories[d[0]].thickness).attr('fill', d => color(categories[d[0]].background).darker(categories[d[0]].darker))

    const chart = svg.append("g")
        .attr("transform", `translate(0,0)`);

    let projection = geoGinzburg8().fitSize([width, innerHeight], geoData);

    chart
        .selectAll('.country')
        .data(geoData.features)
        .join('g').attr('class', 'country').attr('data-dn-focus-id', d => d.properties.ISO2).append('path')
        .attr('d', geoPath().projection(projection))
        .attr('fill', d => {
            if (!data[d.properties.ISO2]) return '#e5e5e5'
            return `url(#store-fill-${data[d.properties.ISO2].store})`
        })
        .attr('stroke', '#454545').attr('stroke-width', '0.5px')
        .on('mouseenter', function (e, d) {
            if (data[d.properties.ISO2]) {
                this.classList.add('active')
            }
        })
        .on('mouseout', function (e, d) {
            if (data[d.properties.ISO2]) {
                this.classList.remove('active')
            }
        });

    chart
        .selectAll('.country-label')
        .data(geoData.features).join('g').filter(d => data[d.properties.ISO2])
        .attr('transform', function (d) {
            const [x, y] = projection([d.properties.LON, d.properties.LAT]);
            return `translate(${x - 35 + (labelOffsets[d.properties.ISO2]?.[0] || 0)},${y - 10 + (labelOffsets[d.properties.ISO2]?.[1] || 0)})`
        })
        .attr('class', 'country-label')
        .append('foreignObject').style('pointer-events', 'none')
        .attr('width', '70px')
        .attr('height', '20px')
        .html(d => `<div class="label"><span class="label-text">${d.properties.NAME}</span></div>`)


    //  Bottom legend
    const categoriesGroup = svg.append("g").attr('class', 'categories').attr('transform', `translate(10, ${height - marginBottom + 20})`)

    const storesGroup = categoriesGroup.selectAll('.store').data(Object.entries(categories)).join('g').attr('class', 'store').attr('transform', (d, i) => `translate(${i * 120},0)`)

    storesGroup.append('path').attr('d', getRoundedRectPath({ x: 0, y: 0, width: 40, height: 25 }, 5, 0)).attr('fill', d => `url(#store-fill-${d[0]})`).attr('stroke', d => color(categories[d[0]].background).darker(0.5)).attr('stroke-width', '2px')

    storesGroup.append('text').attr('class', 'store-label').attr('x', '48px').attr('alignment-baseline', 'central').attr('y', '12px').text(d => d[0])

    //  Draw the focus ring that will move around along with the data-navigator navigation
    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    // Append the SVG element to the container
    container.append(svg.node());
}