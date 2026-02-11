import data from './scripts/data.js';
import { buildChart } from './scripts/chart.js';
import { buildDataNavigator } from './scripts/dn.js';

const container = document.getElementById('chart');
buildChart(container, data);
buildDataNavigator(container, data);