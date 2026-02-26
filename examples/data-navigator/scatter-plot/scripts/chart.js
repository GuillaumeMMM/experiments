import { min, max, scaleTime, scaleLinear, axisLeft, axisBottom, create, timeDay, select } from "d3";

export function buildChart(container, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(640, maxWidth);
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 40;
    const marginLeft = 40;
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    const datesDomain = [min(data, d => new Date(d.date)), max(data, d => new Date(d.date))]

    // Declare the x scale
    const x = scaleTime().domain(datesDomain)
        .range([0, innerWidth]);


    // Declare the y scale
    const y = scaleLinear()
        .domain([0, max(data, d => d.price)])
        .range([innerHeight, 0]);

    // Create the SVG container
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    const dateFormat = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    });

    // Add the x-axis
    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
            axisBottom(x)
                .tickValues(timeDay.range(datesDomain[0], datesDomain[1], 4))
                .tickSize(0).tickPadding(10)
                .tickFormat(val => dateFormat.format(val))
        ).call(g => g.select(".domain").remove());

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
                .tickPadding(15)
        )
        .call(g => g.select(".domain").remove())

    const points = chart.append('g');

    //  Create a group for each stack
    const pointGroups = points.selectAll('.point').data(data)
        .join('g').attr('class', 'point');

    //  Create a group for each portion of the stacks
    pointGroups.append('circle')
        .attr('data-dn-focus-id', d => `${d.id}`)
        .attr('data-dn-focus-group-id', d => `group_${d.groupId}`)
        .attr('cx', d => `${x(new Date(d.date))}px`).attr('cy', d => `${y(d.price)}px`)
        .on('activatedatapoint', function (e, d) {
            const currentCircleRect = this.getBoundingClientRect();
            const svgRect = svg.node().getBoundingClientRect();

            const displayTooltipLeft = x(new Date(d.date)) > width / 2;

            select('#tooltip-container')
                .attr('transform', `translate(
                    ${currentCircleRect.x - svgRect.x + currentCircleRect.width + 5 - (displayTooltipLeft ? (100 + currentCircleRect.width + 10) : 0)},
                    ${currentCircleRect.y - svgRect.y - 6}
                )`)
                .style('text-align', displayTooltipLeft ? 'right' : 'left')
                .attr('visibility', 'visible')
                .html(`<div class="tooltip">${d.price}&nbsp;€</div>`);
        })
        .on('deactivatedatapoint', function () {
            select('#tooltip-container').attr('visibility', 'hidden')
        })
        .on('mouseenter', function () {
            this.dispatchEvent(new CustomEvent('activatedatapoint'))
        }).on('mouseout', function () {
            this.dispatchEvent(new CustomEvent('deactivatedatapoint'))
        });

    //  Focus ring element that will be moved around when navigation with data-navigator
    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    svg.append('foreignObject').attr('id', 'tooltip-container').attr('visibility', 'hidden').attr('width', '100px').attr('height', '50px');

    // Append the SVG element to the container
    container.append(svg.node());
}