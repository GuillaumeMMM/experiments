import data from './scripts/data.js';
import { buildChart } from './scripts/chart.js';
import { createStructure } from './scripts/structure.js';
import { buildDataNavigator } from '../utils/dn.js';

const chartContainerElement = document.getElementById('chart');
buildChart(chartContainerElement, data);

const entryButtonElement = document.getElementById('dn-entry-button');
const backToEntryButtonElement = document.getElementById('dn-entry-button-back');
const exitBlockElement = document.getElementById('dn-exit-block');
const focusRingElement = chartContainerElement.querySelector('#focus-ring');

const structure = createStructure(data)

buildDataNavigator({
    chartContainerElement,
    entryButtonElement,
    backToEntryButtonElement,
    exitBlockElement,
    focusRingElement,
    structure: structure,
    entryPointNodeId: '__name_Banana',
    semantics: (_, d) => {
        const total = Object.values(d.data.values).reduce((prev, curr) => prev + curr.price, 0)
        return { label: `${total} euros spent on ${d.data.name}` }
    }
});