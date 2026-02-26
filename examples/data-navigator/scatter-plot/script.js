import data from '../assets/timeseries.json';
import { buildChart } from './scripts/chart.js';
import { createStructure } from './scripts/structure.js';
import { buildDataNavigator } from '../utils/dn.js';

const chartContainerElement = document.getElementById('chart');
buildChart(chartContainerElement, data);

const entryButtonElement = document.getElementById('dn-entry-button');
const backToEntryButtonElement = document.getElementById('dn-entry-button-back');
const exitBlockElement = document.getElementById('dn-exit-block');
const focusRingElement = chartContainerElement.querySelector('#focus-ring');

buildDataNavigator({
    chartContainerElement,
    entryButtonElement,
    backToEntryButtonElement,
    exitBlockElement,
    focusRingElement,
    structure: createStructure(data),
    entryPointNodeId: 'group_0'
});