import geoData from '../assets/europe.json';
import data from '../assets/countries.json';
import { buildChart } from './scripts/chart.js';
import { buildDataNavigator } from './scripts/dn.js';

const container = document.getElementById('chart');
buildChart(container, geoData, data);
buildDataNavigator(container, data);