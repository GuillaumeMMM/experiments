import data from '../assets/timeseries.json';
import { buildChart } from './scripts/chart.js';
import { buildDataNavigator } from './scripts/dn.js';

const container = document.getElementById('chart');
buildChart(container, data);
buildDataNavigator(container, data);