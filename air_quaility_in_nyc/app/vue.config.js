module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  publicPath: ''
}

module.exports = {
  chainWebpack: config => {
      config
          .plugin('html')
          .tap(args => {
              args[0].title = "Air Quality NYC";
              return args;
          })
  },

  publicPath: ''
}