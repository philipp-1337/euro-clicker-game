const { GenerateSW } = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      "@utils": path.resolve(__dirname, "src/utils"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@constants": path.resolve(__dirname, "src/constants")
    },
    configure: (webpackConfig) => {
      // Nur im Production-Build das Plugin hinzufügen
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.plugins.push(
          new GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            include: [/\.html$/, /\.js$/, /\.css$/, /\.png$/, /\.jpg$/, /\.svg$/],
          })
        );
      }
      return webpackConfig;
    }
  }
};