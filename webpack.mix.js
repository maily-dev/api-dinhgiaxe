let mix = require("laravel-mix")
let webpack = require('webpack')

// setting the public directory to public (this is where the mix-manifest.json gets created)
mix.setPublicPath("public")
// transpiling, babelling, minifying and creating the public/js/main.js out of our assets
mix.js("resources/assets/js/main.js", "public/js")
    .styles(
        ['resources/assets/css/main.css'],
        'public/css/main.css')
    .copy(
        'node_modules/notyf/notyf.min.css',
        'public/css/notyf.min.css')
    .copy(
        'node_modules/vuetify/dist/vuetify.min.css',
        'public/css/vuetify.min.css').extract(['vue', 'vuetify', 'vuex', 'axios', 'notyf'])
// .sass('resources/sass/app.scss', 'public/css')


// aliases so instead of e.g. '../../components/test' we can import files like '@/components/test'
mix.webpackConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/assets/js"),
            "@sass": path.resolve(__dirname, "resources/assets/sass")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            'window.Quill': 'quill/dist/quill.js',
            'Quill': 'quill/dist/quill.js'
        }),
    ]
})
