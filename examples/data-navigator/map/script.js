import geoData from '../assets/europe.json';
import data from '../assets/countries.json';
import { buildChart } from './scripts/chart.js';
import { createStructure } from './scripts/structure.js';
import { buildDataNavigator } from '../utils/dn.js';

const chartContainerElement = document.getElementById('chart');
buildChart(chartContainerElement, geoData, data);

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
    structure: createStructure(data)
});