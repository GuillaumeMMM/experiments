export function createStructure(data) {
    const metaPointGroups = [{
        id: '0',
        semantic: 'Low spendings (less than 5 euros each time) between january 1st and january 7th.'
    }, {
        id: '1',
        semantic: 'High spendings (above 12) between january 12th and january 20th.'
    }, {
        id: '2',
        semantic: 'Spendings progressively decrease from january 22nd (10 euros) to january 31st (4 euros)'
    }]

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

    const dateLongFormat = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric'
    });

    let edges = []

    //  Add 1st level nodes and edges
    metaPointGroups.forEach((group, i, self) => {
        const elementEdges = []

        if (i < metaPointGroups.length - 1) {
            elementEdges.push({ source: `group_${group.id}`, target: `group_${self[i + 1].id}`, navigationRules: ["left", "right"] })
        }

        if (i > 0) {
            elementEdges.push({ source: `group_${self[i - 1].id}`, target: `group_${group.id}`, navigationRules: ["right", "left"] })
        }

        elementEdges.push({ source: `group_${group.id}`, target: data.find(d => d.groupId === group.id).id, navigationRules: ["enter"] })

        structure.nodes[`group_${group.id}`] = { id: `group_${group.id}`, renderId: `group_${group.id}`, data: { type: 'level1', ...group, focusRingDataAttribute: 'data-dn-focus-group-id' }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: { label: group.semantic } }

        edges = edges.concat(elementEdges)
    })


    //  Add 2nd level nodes and edges
    data.forEach((point, i, self) => {
        const elementEdges = []

        if (i < data.length - 1) {
            elementEdges.push({ source: point.id, target: self[i + 1].id, navigationRules: ["left", "right"] })
        }

        if (i > 0) {
            elementEdges.push({ source: self[i - 1].id, target: point.id, navigationRules: ["right", "left"] })
        }

        elementEdges.push({ source: point.id, target: `group_${point.groupId}`, navigationRules: ["backspace"] })

        structure.nodes[point.id] = { id: point.id, renderId: point.id, data: { type: 'level2', ...point, customEventNameToTriggerOnFocus: 'activatedatapoint', customEventNameToTriggerOnBlur: 'deactivatedatapoint' }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]), semantics: { label: `${point.price} euros spent on ${dateLongFormat.format(new Date(point.date))}` } }

        edges = edges.concat(elementEdges)
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })

    return structure;
}