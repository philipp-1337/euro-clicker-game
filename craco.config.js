// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@utils": path.resolve(__dirname, "src/utils"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@constants": path.resolve(__dirname, "src/constants")
    }
  }
};