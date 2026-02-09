import dataNavigator from "data-navigator";
import { getRoundedRectPath, getRoundedPolygonHull } from './utils';

function createStructure(data) {
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

        structure.nodes[`group_${group.id}`] = { id: `group_${group.id}`, data: { type: 'level1', ...group }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }

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

        structure.nodes[point.id] = { id: point.id, data: { type: 'level2', ...point }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }

        edges = edges.concat(elementEdges)
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

    const entryPoint = 'group_0';

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
        const focusedChartElements = Array.from(chartContainer.querySelectorAll(`[data-dn-focus-id="${renderedNode.id}"], [data-dn-focus-group-id="${renderedNode.id}"]`));

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

            const dateLongFormat = new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric'
            });

            node.semantics = {
                label: node.data.type === 'level1' ? node.data.semantic : `${node.data.price} euros spent on ${dateLongFormat.format(new Date(node.data.date))}`
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