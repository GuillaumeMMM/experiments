import { stack, union, index, max, scaleBand, scaleLinear, axisLeft, axisBottom, color, create } from "d3";
import { getRoundedRectPath } from "../../utils/outline";

export function buildChart(container, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(640, maxWidth);
    const height = 400;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 120;
    const marginLeft = 30;
    const xAxisLabelsHeight = 80;
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    const barOutlineThickness = 4;
    const barGap = 2;
    const categories = {
        Apple: {
            background: '#69c920',
            thickness: 2,
            darker: 0.5,
            angle: 45,
        },
        Banana: {
            background: '#ffe600',
            thickness: 2,
            darker: 0.5,
            angle: -45,
        },
        Fig: {
            background: '#59a0f8',
            thickness: 0,
            darker: 0.5,
            angle: 90,
        }
    }

    //  Organize the data for easy rendering
    const series = stack()
        .keys(union(data.map(d => d.name).reverse()))
        .value(([, D], key) => D.get(key).price)(index(data, d => d.store, d => d.name))

    // Declare the x scale
    const x = scaleBand().domain(Array.from(new Set(data.map(e => e.store))))
        .range([0, innerWidth])
        .paddingOuter(0.3)
        .paddingInner(0.5);

    // Declare the y scale
    const y = scaleLinear()
        .domain([0, max(series, d => max(d, d => d[1]))])
        .range([innerHeight, 0]);

    // Create the SVG container
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height);

    //  Patterns for the bars stripes
    const defs = svg.append('defs');
    const patterns = defs.selectAll('pattern').data(Object.entries(categories)).join('pattern').attr('id', d => `bar-fill-${d[0]}`).attr('patternUnits', 'userSpaceOnUse').attr('width', 10).attr('height', 10).attr('patternTransform', d => `rotate(${d[1].angle})`)
    patterns.append('rect').attr('width', 10).attr('height', 10).attr('fill', d => categories[d[0]].background);
    patterns.append('rect').attr('x', 0).attr('y', 0).attr('width', 10).attr('height', d => categories[d[0]].thickness).attr('fill', d => color(categories[d[0]].background).darker(categories[d[0]].darker))

    const chart = svg.append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Add the x-axis
    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(axisBottom(x).tickSize(0).tickPadding(10 + barOutlineThickness)).call(g => g.select(".domain").remove());

    // Add the y-axis
    chart.append("g")
        .attr("transform", `translate(0,0)`)
        .call(
            axisLeft(y)
                .ticks(5)
                .tickValues(
                    y.ticks(5).filter(d => d !== 0)
                )
                .tickSize(-innerWidth)
                .tickPadding(10)
        )
        .call(g => g.select(".domain").remove())

    const bars = chart.append('g');

    //  Create a group for each stack
    const productGroups = bars.selectAll('.product').data(series)
        .join('g').attr('class', 'product');

    //  Create a group for each portion of the stacks
    const productBarsGroup = productGroups.selectAll('.product-bar').data(D => D.map(d => (d.key = D.key, d)))
        .join('g')
        .attr('class', 'product-bar')
        .attr('transform', d => `translate(${x(d.data[0])}, ${y(d[1])})`)
        .attr('data-dn-focus-id', d => `${d.data[0]}_${d.key}`)
        .attr('data-dn-focus-group-id', d => d.key);


    productBarsGroup.append('path').attr('class', 'bar-bg').attr('stroke-width', barOutlineThickness).attr('stroke', d => color(categories[d.key].background).darker(0.5)).attr('fill', d => `url(#bar-fill-${d.key})`)
        .attr('d', d => {
            const barWidth = x.bandwidth();
            const barHeight = y(d[0]) - y(d[1]) - barOutlineThickness - barGap;
            const barX = 0;
            const barY = 0;
            const radius = 10;
            return getRoundedRectPath({ x: barX, y: barY, width: barWidth, height: barHeight }, radius, 0);
        });

    productBarsGroup.append('text').attr('class', 'value')
        .attr('x', x.bandwidth() / 2)
        .attr('y', 20).text(d => d[1] - d[0]);

    //  Bottom legend
    const categoriesGroup = svg.append("g").attr('class', 'categories').attr('transform', `translate(10, ${height - marginBottom + xAxisLabelsHeight})`)

    const fruitGroup = categoriesGroup.selectAll('.fruit').data(Object.entries(categories)).join('g').attr('class', 'fruit').attr('transform', (d, i) => `translate(${i * 140},0)`)

    fruitGroup.append('path').attr('d', getRoundedRectPath({ x: 0, y: 0, width: 50, height: 30 }, 10, 0)).attr('fill', d => `url(#bar-fill-${d[0]})`).attr('stroke', d => color(categories[d[0]].background).darker(0.5)).attr('stroke-width', '3px')

    fruitGroup.append('text').attr('class', 'fruit-label').attr('x', '58px').attr('alignment-baseline', 'central').attr('y', '15px').text(d => d[0])

    //  Focus ring element that will be moved around when navigation with data-navigator
    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    // Append the SVG element to the container
    container.append(svg.node());
}