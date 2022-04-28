const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
      createProxyMiddleware('/api', {
          target: 'http://kx.miaoguoge.xyz:9000/',
          changeOrigin: true, // needed for virtual hosted sites
          pathRewrite: {
              '^/api': ''
          }
      })
  )
};