import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react/dist';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: [
      '.web.tsx', '.tsx', '.web.ts', '.ts',
      '.web.jsx', '.jsx', '.web.js', '.js', '.json'
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      resolveExtensions: [
        '.web.js', '.web.jsx', '.js', '.jsx', '.ts', '.tsx', '.json'
      ]
    }
  }
});
