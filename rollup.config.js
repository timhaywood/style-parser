import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import afterEffectsJsx from './rollup-plugin/jsx';
import pkg from './package.json';

export default {
  input: 'src/beta.ts',
  output: {
    file: pkg.main,
    format: 'cjs',
    format: 'es',
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        _npmVersion: pkg.version,
      },
    }),
    typescript(),
    afterEffectsJsx({ wrap: true }),
  ],
};
