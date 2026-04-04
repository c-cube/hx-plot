import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import { register } from './hx-plot.core.js';

register(() => Promise.resolve({ vega, vegaLite }));
