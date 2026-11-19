import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'YogiPLY',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'yogi-ply.esm.js' : 'yogi-ply.js')
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'yogi-ply.css';
          }
          return assetInfo.name;
        }
      }
    },
    minify: false, // We will produce both unminified and minified via post-build
    sourcemap: true
  }
});
