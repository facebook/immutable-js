const { createSyncFn } = require('synckit');
const typescript = require('typescript');

const TYPESCRIPT_OPTIONS = {
  noEmitOnError: true,
  target: typescript.ScriptTarget.ES2015,
  module: typescript.ModuleKind.CommonJS,
  strictNullChecks: true,
  sourceMap: true,
  inlineSourceMap: true,
};

function transpileTypeScript(src, path) {
  return typescript.transpile(src, TYPESCRIPT_OPTIONS, path, []);
}

module.exports = {
  process(src, path) {
    if (path.endsWith('__tests__/MultiRequire.js')) {
      // exit early for multi-require as we explicitly want to have several instances
      return src;
    }

    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return transpileTypeScript(src, path);
    }

    // Need to make this sync by calling `synckit.createSyncFn`
    // while https://github.com/facebook/jest/issues/9504 is not resolved for `cjs`
    return createSyncFn(require.resolve('./transpile-javascript'))(src, path);
  },

  getCacheKey() {
    // ignore cache, as there is a conflict between rollup compile and jest preprocessor.
    return Date.now().toString();
  },
};
