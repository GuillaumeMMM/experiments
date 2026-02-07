import dataNavigator from "data-navigator";
import { getRoundedRectPath, getRoundedPolygonHull } from './utils';

function createStructure(data) {
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
            elementEdges.push({ source: fruit, target: self[i + 1][0], navigationRules: ["down", "up"] })
            elementEdges.push({ source: fruit, target: self[i + 1][0], navigationRules: ["left", "right"] })
        }

        if (i > 0) {
            elementEdges.push({ source: self[i - 1][0], target: fruit, navigationRules: ["up", "down"] })
            elementEdges.push({ source: self[i - 1][0], target: fruit, navigationRules: ["right", "left"] })
        }

        elementEdges.push({ source: fruit, target: `${Object.keys(stores)[0]}_${fruit}`, navigationRules: ["enter"] })

        structure.nodes[fruit] = { id: fruit, data: { type: 'level1', name: fruit, min: data.min, max: data.max }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }

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

            structure.nodes[`${store}_${p.name}`] = { id: `${store}_${p.name}`, data: { type: 'level2', product: p.name, fruit: store, value: p.price }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }

            edges = edges.concat(elementEdges)
        })
    })

    edges.forEach(edge => {
        structure.edges[`${edge.source}-${edge.target}`] = edge
    })

    return structure;
}

export function buildDataNavigator(chartContainer, data) {
    const entryButton = document.getElementById('dn-entry-button');
    const backToEntryButton = document.getElementById('dn-entry-button-back');
    const exitBlock = document.getElementById('dn-exit-block');

    //  We have a single focus ring that we'll move and redimension along with the navigation
    const focusRingElement = chartContainer.querySelector('#focus-ring')

    exitBlock.style.display = 'none';

    entryButton.addEventListener('click', () => {
        enter();
    })

    backToEntryButton.addEventListener('click', () => {
        enter();
    })

    exitBlock.addEventListener('focusout', (e) => {
        //  Use `focusout` and `relatedTarget` to make sure the exit block stays displayed when the button within it is focused
        //  and disappeares when the focus leaves the block and its children
        if (!exitBlock.contains(e.relatedTarget)) {
            exitBlock.style.display = 'none';
        }
    })

    //  Create the data-navigator structure
    const structure = createStructure(data);

    //  Add the generic exit edge
    structure.edges['any-exit'] = {
        source: (_d, c) => c,
        target: () => {
            exitBlock.style.display = 'block';
            exitBlock.focus();
            resetCurrent();
            return
        },
        navigationRules: ["exit"]
    }

    function resetCurrent() {
        previous = current;
        current = null;
        rendering.remove(previous);
    }

    const entryPoint = structure.nodes[Object.keys(structure.nodes)[0]].id;

    const input = dataNavigator.input({
        structure,
        navigationRules: structure.navigationRules,
        entryPoint
    })

    const enter = () => {
        if (current) {
            //  In case re-entering the navigation on the last visited node
            //  Only needed when exiting the navigation was not done through the any-exit edge
            resetCurrent();
        }
        const nextNode = input.enter();
        if (nextNode) {
            initiateLifecycle(nextNode);
        }
    };

    let current = null;
    let previous = null;

    function initiateLifecycle(nextNode) {
        const renderedNode = rendering.render({
            renderId: nextNode.renderId,
            datum: nextNode
        });

        //  Use a specific data-attribute to find the current focused elements
        //  We can have multiple elements, which will allow us to compute a hull around
        //  the rects in order to draw the focus contour
        const focusedChartElements = Array.from(chartContainer.querySelectorAll(`[data-dn-focus-id$="${renderedNode.id}"]`));

        renderedNode.addEventListener('blur', () => {
            focusRingElement.style.opacity = 0;
            focusedChartElements.forEach((el) => el.classList.remove('active'))
        });

        renderedNode.addEventListener('focus', () => {
            if (!focusedChartElements || focusedChartElements.length === 0) return

            focusedChartElements.forEach((el) => el.classList.add('active'))

            const focusedChartElementRects = focusedChartElements.map(el => el.getBoundingClientRect());

            const chartElementRect = chartContainer.getBoundingClientRect();
            const outlineOffset = 5;
            const outlineRadius = 15;


            focusRingElement.setAttribute('d', focusedChartElements.length > 1 ? getRoundedPolygonHull(focusedChartElementRects, outlineOffset, chartElementRect) : getRoundedRectPath(focusedChartElementRects[0], outlineRadius, outlineOffset, chartElementRect))

            focusRingElement.style.opacity = 1;
        });

        renderedNode.addEventListener('keydown', e => {
            const direction = input.keydownValidator(e);

            if (direction) {
                e.preventDefault();
                move(direction);
            }
        });

        input.focus(nextNode.renderId);

        previous = current;
        current = nextNode.id;
        rendering.remove(previous);
    };

    const chartId = "chart";

    const rendering = dataNavigator.rendering({
        elementData: structure.nodes,
        suffixId: `data-navigator-schema-${chartId}`,
        defaults: { cssClass: 'dn-mock' },
        root: {
            id: `dn-root-${chartId}`,
        }
    });

    const addRenderingProperties = nodes => {
        Object.keys(nodes).forEach(k => {
            let node = nodes[k];
            if (!node.renderId) {
                node.renderId = node.id;
            }

            node.semantics = {
                label: node.data.type === 'level1' ? `between ${1} and ${3} euros spent on ${node.data.name} across all stores` : `${node.data.value} euros spent on ${node.data.product} at ${node.data.fruit}`
            };
        });
    };
    addRenderingProperties(structure.nodes);

    const move = direction => {
        const nextNode = input.move(current, direction);
        if (nextNode) {
            initiateLifecycle(nextNode);
        }
    };

    rendering.initialize();
}