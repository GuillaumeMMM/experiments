import dataNavigator from "data-navigator";
import { getRoundedRectPath } from './utils';

function createStructure(data) {
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

        structure.nodes[shop[0]] = { id: shop[0], data: { name: shop[0], value: shop[1] }, edges: elementEdges.map(edge => `${edge.source}-${edge.target}`).concat(["any-exit"]) }
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
        const focusedChartElement = chartContainer.querySelector(`#bar-${renderedNode.id}`);

        renderedNode.addEventListener('blur', () => {
            focusRingElement.style.opacity = 0;
            focusedChartElement.classList.remove('active')
        });

        renderedNode.addEventListener('focus', () => {
            if (!focusedChartElement) return
            focusedChartElement.classList.add('active')
            const focusedChartElementRect = focusedChartElement.getBoundingClientRect();
            const chartElementRect = chartContainer.getBoundingClientRect();
            const outlineOffset = 10;
            const outlineRadius = 30;

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
                label: `${node.data.value} euros spent at ${node.data.name}`
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