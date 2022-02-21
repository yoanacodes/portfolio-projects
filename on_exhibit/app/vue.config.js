module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  // assetsDir: "src/assets",
  productionSourceMap: false,

  devServer: {
    public: "localhost:8007",
    port: 8007,
    disableHostCheck: true,
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 300,
    },
},

  publicPath: ''
}
