const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const stripBanner = require('rollup-plugin-strip-banner');
const { runAsWorker } = require('synckit');

runAsWorker(async (_src, path) => {
  // same input options as in rollup-config.js
  const inputOptions = {
    input: path,
    onwarn: () => {},
    plugins: [commonjs(), json(), stripBanner(), buble()],
  };

  const bundle = await rollup.rollup(inputOptions);

  const { output } = await bundle.generate({
    file: path,
    format: 'cjs',
    sourcemap: true,
  });

  await bundle.close();

  const { code, map } = output[0];

  if (!code) {
    throw new Error(
      'Unable to get code from rollup output in jestPreprocessor. Did rollup version changed ?'
    );
  }

  return { code, map };
});
