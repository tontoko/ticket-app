const path = require('path')
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withMDX({
  cssModule: true,
  distDir: "../.next",
  webpack: (config) => {
    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: ["ja"],
      })
    );
    return config;
  },
});