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

    //  Create edges and nodes from the data
    const edges = [
        { source: 'IE', target: 'SE', navigationRules: ["left", "right"] },
        { source: 'IE', target: 'FR', navigationRules: ["up", "down"] },
        { source: 'FR', target: 'ES', navigationRules: ["up", "down"] },
        { source: 'FR', target: 'DE', navigationRules: ["left", "right"] },
        { source: 'DE', target: 'PL', navigationRules: ["left", "right"] },
        { source: 'DE', target: 'AT', navigationRules: ["up", "down"] },
        { source: 'SE', target: 'DE', navigationRules: ["up", "down"] },
        { source: 'SE', target: 'FI', navigationRules: ["left", "right"] },
        { source: 'FI', target: 'LV', navigationRules: ["up", "down"] },
        { source: 'LV', target: 'PL', navigationRules: ["up", "down"] },
        { source: 'PL', target: 'RO', navigationRules: ["up", "down"] },
        { source: 'RO', target: 'GR', navigationRules: ["up", "down"] },
        { source: 'HR', target: 'GR', navigationRules: ["left", "right"] },
        { source: 'HR', target: 'RO', navigationRules: ["left", "right"] },
        { source: 'AT', target: 'HR', navigationRules: ["up", "down"] },
        { source: 'HR', target: 'GR', navigationRules: ["up", "down"] },
        { source: 'FR', target: 'HR', navigationRules: ["left", "right"] },
        { source: 'FR', target: 'AT', navigationRules: ["left", "right"] },
        { source: 'ES', target: 'FR', navigationRules: ["left", "right"] },
    ]
    Object.entries(data).forEach(([key, country]) => {
        structure.nodes[country.id] = { id: country.id, renderId: country.id, data: { ...country }, edges: edges.filter(e => [e.source, e.target].includes(country.id)).map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: { label: `The most popular grocery store in ${country.name} is ${country.store}` } }
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })
    return structure;
}