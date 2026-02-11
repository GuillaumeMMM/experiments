import dataNavigator from "data-navigator";
import { getRoundedRectPath } from './utils';

function createStructure(data) {
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
        structure.nodes[country.id] = { id: country.id, data: { ...country }, edges: edges.filter(e => [e.source, e.target].includes(country.id)).map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }
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
    const focusRingElement = chartContainer.querySelector('#focus-ring')

    exitBlock.style.display = 'none';

    entryButton.addEventListener('click', () => {
        enter();
    })

    backToEntryButton.addEventListener('click', () => {
        enter();
    })

    exitBlock.addEventListener('focusout', (e) => {
        //  Use `focusout` and `relatedTarget` to make sure the exit block stays displayed when the button within is focused
        //  and disappeares when the focus leaves the block and its children
        if (!exitBlock.contains(e.relatedTarget)) {
            exitBlock.style.display = 'none';
        }
    })

    //  Create the data-navigator structure
    const structure = createStructure(data);
    structure.edges['any-exit'] = {
        source: (_d, c) => c,
        target: () => {
            exitBlock.style.display = 'block';
            exitBlock.focus();
            resetCurrent();
            return ""
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

        //  Element currently focused
        //  The focus ring will be moved there during this cycle
        const focusedChartElement = chartContainer.querySelector(`[data-dn-focus-id="${renderedNode.id}"]`);

        renderedNode.addEventListener('blur', () => {
            focusRingElement.style.opacity = 0;
            focusedChartElement.classList.remove('active')
        });

        renderedNode.addEventListener('focus', () => {
            if (!focusedChartElement) return
            focusedChartElement.classList.add('active')
            const focusedChartElementRect = focusedChartElement.getBoundingClientRect();
            const chartElementRect = chartContainer.getBoundingClientRect();
            const outlineOffset = 2;
            const outlineRadius = 10;

            //  Create a rounded outline around the focused rect (could also be a simple svg rect)
            focusRingElement.setAttribute('d',
                getRoundedRectPath(
                    focusedChartElementRect, outlineRadius, outlineOffset, chartElementRect
                )
            );

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
                label: `The most popular grocery store in ${node.data.name} is ${node.data.store}`
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