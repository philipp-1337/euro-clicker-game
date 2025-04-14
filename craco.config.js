// craco.config.js
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
      // Bestehende webpack-Konfiguration
      
      // PWA-Plugin hinzufügen
      webpackConfig.plugins.push(
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          // Passe die Inhalte an, die gecacht werden sollen
          include: [/\.html$/, /\.js$/, /\.css$/, /\.png$/, /\.jpg$/, /\.svg$/],
          // Füge weitere Optionen nach Bedarf hinzu
        })
      );
      
      return webpackConfig;
    }
  }
};