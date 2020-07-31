const withPWA = require("next-pwa");
const runtimeCaching = require('next-pwa/cache')
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withPWA(
  withMDX({
    cssModule: true,
    pwa: {
      dest: 'public',
      runtimeCaching,
    },
    webpack: (config) => {
      config.plugins.push(
        new MomentLocalesPlugin({
          localesToKeep: ["ja"],
        })
      );
      return config;
    },
  })
);