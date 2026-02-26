export function createStructure(data) {
    const structure = {
        nodes: {},
        edges: {},
        navigationRules: {
            left: { key: "ArrowLeft", direction: "source" },
            right: { key: "ArrowRight", direction: "target" },
            exit: { key: "Escape", direction: "target" }
        }
    }

    //  Create edges and nodes from the data
    let edges = []
    data.forEach((shop, i, self) => {
        const elementEdges = []

        if (i < self.length - 1) {
            elementEdges.push({ source: self[i][0], target: self[i + 1][0], navigationRules: ["left", "right"] })
        }

        if (i > 0) {
            elementEdges.push({ source: self[i - 1][0], target: self[i][0], navigationRules: ["left", "right"] })
        }

        edges = edges.concat(elementEdges)

        structure.nodes[shop[0]] = { id: shop[0], renderId: shop[0], data: { name: shop[0], value: shop[1] }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: { label: `${shop[1]} euros spent at ${shop[0]}` } }
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })

    return structure;
}