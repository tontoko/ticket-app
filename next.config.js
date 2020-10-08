const withPWA = require("next-pwa");
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withPWA(
  withMDX({
    cssModule: true,
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === "development",
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