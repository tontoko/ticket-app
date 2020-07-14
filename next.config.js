const withPWA = require("next-pwa");
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withPWA(
  withMDX({
    target: "serverless",
    cssModule: true,
    pwa: {
      dest: "public",
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