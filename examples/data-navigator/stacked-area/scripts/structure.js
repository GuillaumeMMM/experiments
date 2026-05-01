import dataNavigator from "data-navigator";

export function createStructure(data) {
    const structure = dataNavigator.structure({
        data: data.flatMap(d => d.products.map(p => ({ ...p, date: d.date, id: `${d.date}-${p.name}` }))),
        idKey: 'id',
        renderIdKey: 'id',
        dimensions: {
            values: [
                {
                    dimensionKey: 'name',
                    type: 'categorical',
                    behavior: {
                        extents: 'circular',
                    }
                }
            ]
        },
        genericEdges: [
            {
                edgeId: 'any-exit',
                edge: {
                    source: (_d, c) => c,
                    target: () => '',
                    navigationRules: ['exit']
                }
            }
        ]
    })

    return structure;
}