export function createStructure(data) {
    const structure = {
        nodes: {},
        edges: {},
        navigationRules: {
            left: { key: "ArrowLeft", direction: "source" },
            right: { key: "ArrowRight", direction: "target" },
            up: { key: "ArrowUp", direction: "source" },
            down: { key: "ArrowDown", direction: "target" },
            exit: { key: "Escape", direction: "target" }
        }
    }

    function getSemanticForNode(node) {
        const linksFromNode = data.links.filter(l => l.source === node.id)
        const linksToNode = data.links.filter(l => l.target === node.id)
        const valueFrom = linksFromNode.reduce((prev, curr) => prev + curr.value, 0)
        const valueTo = linksToNode.reduce((prev, curr) => prev + curr.value, 0)
        const spentOn = linksFromNode.map(n => n.target).join(', ')
        const spentAt = linksToNode.map(n => n.source).join(', ')
        if (node.id === 'total') {
            return `${valueFrom} spend during the week at ${spentOn}`
        }
        if (node.type === 'shop') {
            return `${valueFrom} spent at ${node.name} on ${spentOn}`
        }
        return `${valueTo} spent on ${node.name} at ${spentAt}`
    }

    //  Create edges and nodes from the data
    let edges = []

    //  Add horizontal edges
    data.nodes.filter(n => n.type === 'shop').forEach((shop) => {
        const elementEdges = [
            { source: data.nodes[0].id, target: shop.id, navigationRules: ["left", "right"] },
        ]

        data.nodes.filter(d => d.type === 'product').forEach((product) => {
            elementEdges.push({ source: shop.id, target: product.id, navigationRules: ["left", "right"] })
        })

        edges = edges.concat(elementEdges)
    })

    //  Add stores vertical edges
    data.nodes.filter(n => n.type === 'shop').sort((a, b) => a.name < b.name ? 1 : -1).forEach((shop, i, self) => {
        edges.push({ source: shop.id, target: self[(i + 1) % self.length].id, navigationRules: ["up", "down"] })
    })

    //  Add products vertical edges
    data.nodes.filter(n => n.type === 'product').sort((a, b) => a.name < b.name ? 1 : -1).forEach((product, i, self) => {
        edges.push({ source: product.id, target: self[(i + 1) % self.length].id, navigationRules: ["up", "down"] })
    })

    data.nodes.forEach(n => {
        structure.nodes[n.id] = { id: n.id, renderId: n.id, data: n, edges: edges.filter(e => [e.source, e.target].includes(n.id)).map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: { label: getSemanticForNode(n) } }
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })

    return structure;
}