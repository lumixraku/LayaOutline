import typescript from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl'
export default {
    input: './src/Main.ts',
    watch: {
        exclude: 'node_modules/**'
    },
    plugins: [
        typescript(/*{ plugin options }*/),
        glsl({
            // By default, everything gets included
            include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: true,
            compress: false
        }),

    ],
    output: {
        file: './bin/js/bundle.js',
        format: 'iife',
        name: 'laya',
        sourcemap: true
    }
}