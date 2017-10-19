const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.base.config')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(common, {
  entry: './src/entry-client',
  plugins: [
    // Important: this splits the webpack runtime into a leading chunk
    // so that async chunks can be injected right after it.
    // this also enables better caching for your app/vendor code.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
    // Generates the client manifest file used by the renderer
    new VueSSRClientPlugin(),
    // Bundle only some locales for the moment package
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),    
  ],
})
