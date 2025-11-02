import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/styles': path.resolve(__dirname, './src/styles')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content: string, loaderContext?: { resourcePath?: string }) => {
          // Don't inject into main.scss since it already imports these
          const resourcePath = loaderContext?.resourcePath
          if (resourcePath && resourcePath.endsWith('main.scss')) {
            return content
          }
          return `@use "@/styles/abstracts/variables" as *;\n@use "@/styles/abstracts/mixins" as *;\n${content}`
        },
        loadPaths: [path.resolve(__dirname, './src')]
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
