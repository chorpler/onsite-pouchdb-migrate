import buble from 'rollup-plugin-buble';
import replace from 'rollup-plugin-replace';
// import typescript from 'rollup-plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import * as packageJson from '../package.json';

const external = packageJson.dependencies;

// var external = Object.keys(require('../package.json').dependencies);

export default config => {
  return {
    // input: 'src/index.ts',
    input: 'compiled/index.js',
    output: {
      format: config.format,
      file: config.dest
    },
    external: external,
    plugins: [
      resolve(),
      commonjs({
        external: [ 'crypto', 'buffer', 'stream' ],
      }),
      json(),
      typescript({
        rollupCommonJSResolveHack: true,
        clean: true,
        useTsconfigDeclarationDir: true,
      }),
      buble(),
      replace({'process.browser': JSON.stringify(!!config.browser)})
    ]
  };
};
