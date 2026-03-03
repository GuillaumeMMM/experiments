import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";

export function buildChart(container, data) {
    // Declare the chart dimensions and margins
    const maxWidth = window.innerWidth - 2 * 16 - 2 * 24 - 2 * 20;
    const width = Math.min(700, maxWidth);
    const height = 400;
    const marginTop = 20;
    const marginRight = 15;
    const marginBottom = 20;
    const marginLeft = 15;
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    const colors = {
        Apple: '#69c920',
        Banana: '#ffe600',
        Fig: '#59a0f8'
    }

    const defaultColor = '#a3a3a3'

    // Create the SVG container
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    const graph = {
        nodes: data.nodes.map(({ name, id, type }) => ({ name, id, type })),
        links: data.links.map(d => Object.assign({}, d))
    };

    const sankey = d3Sankey()
        .nodeWidth(30)
        .nodePadding(20)
        .nodeSort((a, b) => a.name < b.name ? 1 : -1)
        .nodeId(d => d.id)
        .extent([[0, 0], [innerWidth, innerHeight]]);

    sankey(graph);

    chart.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankeyLinkHorizontal())
        .attr('fill', 'none')
        .style("stroke", d => colors[d.target.id] || d3.color(defaultColor).brighter(0.3))
        .style("stroke-width", d => d.width);

    const node = chart.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr('data-dn-focus-id', d => d.id)
        .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
        .on('activatedatapoint', function (e, d) {
            this.classList.add('active')
        })
        .on('deactivatedatapoint', function () {
            this.classList.remove('active')
        })
        .on('mouseenter', function () {
            this.dispatchEvent(new CustomEvent('activatedatapoint'))
        }).on('mouseout', function () {
            this.dispatchEvent(new CustomEvent('deactivatedatapoint'))
        });

    node.append("rect")
        .attr("height", function (d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", d => colors[d.id] || defaultColor)
        .style("stroke", d => d3.color(colors[d.id] || defaultColor).darker(0.8))
        .attr('stroke-width', '1px');

    node.append("text")
        .attr("y", function (d) { return (d.y1 - d.y0) / 2; })
        .attr("x", sankey.nodeWidth() / 2)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", 'middle')
        .attr('class', 'node-value')
        .text(d => d.value);

    const labelToNodeGap = 10;

    const texts = node
        .append("text")
        .attr('class', 'node-label')
        .attr("x", d => d.x0 <= (0.25 * innerWidth) ? sankey.nodeWidth() + labelToNodeGap : - sankey.nodeWidth() + labelToNodeGap)
        .attr("y", function (d) { return (d.y1 - d.y0) / 2; })
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", d => d.x0 <= (0.25 * innerWidth) ? "start" : 'end')
        .attr("transform", null)
        .text(function (d) { return d.name; })


    //  Draw the focus ring that will move around along with the data-navigator navigation
    svg.append('path').attr('class', 'focus-ring').attr('id', 'focus-ring').attr('opacity', 0);

    // Append the SVG element to the container
    container.append(svg.node());

    texts.each(function () {
        const bbox = this.getBBox();
        const padding = { x: 5, y: 2 };
        d3.select(this.parentNode).insert("rect", "text")
            .attr("x", bbox.x - padding.x)
            .attr("y", bbox.y - padding.y)
            .attr("width", bbox.width + padding.x * 2)
            .attr("height", bbox.height + padding.y * 2)
            .attr("fill", "white")
            .attr("rx", 3);
    });
}