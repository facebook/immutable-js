import path from 'path';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import stripBanner from 'rollup-plugin-strip-banner';

import copyright from './copyright';

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

export default {
  input: path.join(SRC_DIR, 'Immutable.js'),
  output: {
    banner: copyright,
    name: 'Immutable',
    file: path.join(DIST_DIR, 'immutable.es.js'),
    format: 'es',
    sourcemap: false,
  },
  plugins: [commonjs(), json(), stripBanner(), buble()],
};
