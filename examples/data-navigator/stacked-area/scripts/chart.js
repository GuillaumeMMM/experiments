import * as d3 from "d3";
import { getRoundedRectPath } from "../../utils/outline";

export function buildChart(container, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(640, maxWidth);
    const height = 400;
    const marginTop = 50;
    const marginRight = 30;
    const marginBottom = 100;
    const marginLeft = 30;
    const xAxisLabelsHeight = 50;
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    const categories = {
        Apple: {
            background: '#69c920CC',
            thickness: 2,
            darker: 0.5,
            angle: 45,
        },
        Banana: {
            background: '#ffe600CC',
            thickness: 2,
            darker: 0.5,
            angle: -45,
        },
        Fig: {
            background: '#59a0f8CC',
            thickness: 2,
            darker: 0.5,
            angle: 0,
        }
    }

    const keys = [...new Set(data.flatMap(d => d.products.map(p => p.name)))];

    const flatData = data.map(d => {
        const row = { date: new Date(d.date) };
        d.products.forEach(p => { row[p.name] = p.price; });
        return row;
    });

    const stack = d3.stack().keys(keys);
    const stackedData = stack(flatData);

    const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    const datesDomain = [d3.min(data, d => new Date(d.date)), d3.max(data, d => new Date(d.date))]

    // Declare the x scale
    const x = d3.scaleTime().domain(datesDomain)
        .range([0, innerWidth]);

    // Declare the y scale
    const y = d3.scaleLinear()
        .domain([0, 7])
        .range([innerHeight, 0]);

    // Create the SVG container
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    //  Patterns for the bars stripes
    const defs = svg.append('defs');
    const patterns = defs.selectAll('pattern').data(Object.entries(categories)).join('pattern').attr('id', d => `area-fill-${d[0]}`).attr('patternUnits', 'userSpaceOnUse').attr('width', 10).attr('height', 10).attr('patternTransform', d => `rotate(${d[1].angle})`)
    patterns.append('rect').attr('width', 10).attr('height', 10).attr('fill', d => categories[d[0]].background);
    patterns.append('rect').attr('x', 0).attr('y', 0).attr('width', 10).attr('height', d => categories[d[0]].thickness).attr('fill', d => d3.color(categories[d[0]].background).darker(categories[d[0]].darker))

    const chart = svg.append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Add the x-axis
    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
            d3.axisBottom(x).tickValues(data.map(d => new Date(d.date))).tickFormat(d3.timeFormat("%b %e"))
        );

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

    const productGroups = chart.append('g').selectAll('.product').data(stackedData)
        .join('g').attr('class', 'product');

    productGroups.append('path').attr('class', 'area').attr('d', area)
        .attr('data-dn-focus-id', d => `__name_${d.key}`)
        .attr('fill', d => `url(#area-fill-${d.key})`)
        .attr('stroke', d => d3.color(categories[d.key].background).darker(0.5))
        .attr('stroke-width', '3px')

    //  Draw the focus ring that will move around along with the data-navigator navigation
    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    //  Bottom legend
    const categoriesGroup = svg.append("g").attr('class', 'categories').attr('transform', `translate(10, ${height - marginBottom + xAxisLabelsHeight})`)

    const fruitGroup = categoriesGroup.selectAll('.fruit').data(Object.entries(categories)).join('g').attr('class', 'fruit').attr('transform', (d, i) => `translate(${i * 140},0)`)

    fruitGroup.append('path').attr('d', getRoundedRectPath({ x: 0, y: 0, width: 50, height: 30 }, 10, 0)).attr('fill', d => `url(#area-fill-${d[0]})`).attr('stroke', d => d3.color(categories[d[0]].background).darker(0.5)).attr('stroke-width', '3px')

    fruitGroup.append('text').attr('class', 'fruit-label').attr('x', '58px').attr('alignment-baseline', 'central').attr('y', '15px').text(d => d[0])

    // Append the SVG element to the container
    container.append(svg.node());
}