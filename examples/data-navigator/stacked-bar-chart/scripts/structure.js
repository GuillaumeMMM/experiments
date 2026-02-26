export function createStructure(data) {
    //  Format the data
    const stores = data.reduce((prev, curr) => {
        prev[curr.store] = (prev[curr.store] || []).concat(curr)
        return prev
    }, {})

    const fruits = data.reduce((prev, curr) => {
        prev[curr.name] = { min: Math.min((prev[curr.name]?.min || Infinity), curr.price), max: Math.max((prev[curr.name]?.max || 0), curr.price) }
        return prev
    }, new Map)

    const structure = {
        nodes: {},
        edges: {},
        navigationRules: {
            left: { key: "ArrowLeft", direction: "source" },
            right: { key: "ArrowRight", direction: "target" },
            up: { key: "ArrowUp", direction: "source" },
            down: { key: "ArrowDown", direction: "target" },
            enter: { key: "Enter", direction: "target" },
            backspace: { key: "Backspace", direction: "target" },
            exit: { key: "Escape", direction: "target" }
        }
    }

    let edges = []
    //  Add top level nodes and edges
    Object.entries(fruits).forEach(([fruit, data], i, self) => {
        const elementEdges = []

        //  Move in-between 
        if (i < self.length - 1) {
            elementEdges.push({ source: fruit, target: self[i + 1][0], navigationRules: ["down", "up", "left", "right"] })
        }

        if (i > 0) {
            elementEdges.push({ source: self[i - 1][0], target: fruit, navigationRules: ["up", "down", "left", "right"] })
        }

        elementEdges.push({ source: fruit, target: `${Object.keys(stores)[0]}_${fruit}`, navigationRules: ["enter"] })

        structure.nodes[fruit] = {
            id: fruit, renderId: fruit, data: { type: 'level1', name: fruit, min: data.min, max: data.max, focusRingDataAttribute: 'data-dn-focus-group-id' }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: {
                label: `between ${1} and ${3} euros spent on ${fruit} across all stores`
            }
        }

        edges = edges.concat(elementEdges)
    })

    //  Add 2nd level nodes and edges
    Object.entries(stores).forEach(([store, products], i, self) => {
        products.forEach((p, j) => {
            const elementEdges = []

            if (j < products.length - 1) {
                elementEdges.push({ source: `${store}_${products[j].name}`, target: `${store}_${products[j + 1].name}`, navigationRules: ["up", "down"] })
            }

            if (j > 0) {
                elementEdges.push({ source: `${store}_${products[j - 1].name}`, target: `${store}_${products[j].name}`, navigationRules: ["down", "up"] })
            }

            if (i < self.length - 1) {
                elementEdges.push({ source: `${self[i][0]}_${p.name}`, target: `${self[i + 1][0]}_${p.name}`, navigationRules: ["left", "right"] })
            }

            if (i > 0) {
                elementEdges.push({ source: `${self[i - 1][0]}_${p.name}`, target: `${self[i][0]}_${p.name}`, navigationRules: ["right", "left"] })
            }

            elementEdges.push({ source: `${store}_${p.name}`, target: p.name, navigationRules: ["backspace"] })

            structure.nodes[`${store}_${p.name}`] = {
                id: `${store}_${p.name}`, renderId: `${store}_${p.name}`, data: { type: 'level2', product: p.name, fruit: store, value: p.price }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]),
                semantics: {
                    label: `${p.price} euros spent on ${p.name} at ${store}`
                }
            }

            edges = edges.concat(elementEdges)
        })
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })

    return structure;
}
