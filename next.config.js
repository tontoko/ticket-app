const path = require('path')
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withMDX({
  target: "serverless",
  cssModule: true,
  webpack: (config) => {
    config.node = {
      fs: 'empty'
    }
    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: ["ja"],
      })
    );
    return config;
  },
});