import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ['bar-chart']: resolve(__dirname, 'examples/bar-chart/index.html'),
                ['stacked-bar-chart']: resolve(__dirname, 'examples/stacked-bar-chart/index.html'),
                ['scatter-plot']: resolve(__dirname, 'examples/scatter-plot/index.html'),
                ['map']: resolve(__dirname, 'examples/map/index.html'),
            }
        }
    }
})