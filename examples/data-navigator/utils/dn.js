import dataNavigator from "data-navigator";
import { getRoundedPolygonHull, getRoundedRectPath } from './outline';

export function buildDataNavigator({
    chartContainerElement,
    entryButtonElement,
    backToEntryButtonElement,
    exitBlockElement,
    focusRingElement,
    structure,
    focusRingDataAttribute = 'data-dn-focus-id',
    entryPointNodeId,
}) {
    exitBlockElement.style.display = 'none';

    entryButtonElement.addEventListener('click', () => {
        enter();
    })

    backToEntryButtonElement.addEventListener('click', () => {
        enter();
    })

    exitBlockElement.addEventListener('focusout', (e) => {
        //  Use `focusout` and `relatedTarget` to make sure the exit block stays displayed when the button within is focused
        //  and disappeares when the focus leaves the block and its children
        if (!exitBlockElement.contains(e.relatedTarget)) {
            exitBlockElement.style.display = 'none';
        }
    })

    function resetCurrent() {
        previous = current;
        current = null;
        rendering.remove(previous);
    }

    const input = dataNavigator.input({
        structure,
        navigationRules: structure.navigationRules,
        entryPoint: entryPointNodeId || structure.nodes[Object.keys(structure.nodes)[0]].id
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

        //  If a different data-attribute is specified in the node itself, use that one
        const dataAttributeToConsider = nextNode.data.focusRingDataAttribute || focusRingDataAttribute;

        //  Elements currently focused
        //  The focus ring will be moved there during this cycle
        const focusedChartElements = Array.from(chartContainerElement.querySelectorAll(`[${dataAttributeToConsider}="${renderedNode.id}"]`));

        renderedNode.addEventListener('blur', () => {
            focusRingElement.style.opacity = 0;
            focusedChartElements.forEach(el => el.classList.remove('active'));
        });

        renderedNode.addEventListener('focus', () => {
            if (!focusedChartElements || focusedChartElements.length === 0) return
            focusedChartElements.forEach(el => el.classList.add('active'));
            const focusedChartElementRects = focusedChartElements.map(el => el.getBoundingClientRect());
            const chartElementRect = chartContainerElement.getBoundingClientRect();
            const outlineOffset = 10;
            const outlineRadius = 30;

            //  If there is only one element to outline, create a rounded outline around the focused rect (could also be a simple svg rect)
            //  If there are multiple elements, cretae a polygon hull around them
            focusRingElement.setAttribute('d',
                focusedChartElementRects.length === 1 ? getRoundedRectPath(
                    focusedChartElementRects[0], outlineRadius, outlineOffset, chartElementRect
                ) : getRoundedPolygonHull(focusedChartElementRects, outlineOffset, chartElementRect)
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

    const rendering = dataNavigator.rendering({
        elementData: structure.nodes,
        suffixId: "data-navigator-schema",
        root: {
            id: "dn-root",
        }
    });

    const move = direction => {
        const nextNode = input.move(current, direction);
        if (nextNode) {
            initiateLifecycle(nextNode);
        }
    };

    structure.edges['any-exit'] = {
        source: (_d, c) => c,
        navigationRules: ["exit"],
        target: () => {
            exitBlockElement.style.display = 'block';
            exitBlockElement.focus();
            resetCurrent();
            return ""
        }
    }

    rendering.initialize();
}