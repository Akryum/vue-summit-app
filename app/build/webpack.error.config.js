const merge = require('webpack-merge')
const common = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(common, {
  entry: './src/entry-error',
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
  },
  // Skip webpack processing on node_modules
  externals: nodeExternals({
    // Force css files imported from no_modules
    // to be processed by webpack
    whitelist: /\.css$/,
  }),
  plugins: [
    // Generates the server bundle file
    new VueSSRServerPlugin({
      filename: 'vue-ssr-error-bundle.json',
    }),
  ],
})

// Force disable extract CSS
const rules = module.exports.module.rules
const vueRule = rules.find(rule => rule.loader === 'vue-loader')
vueRule.options.extractCSS = false
