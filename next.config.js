const path = require('path')
const withCSS = require('@zeit/next-css')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withCSS({
    cssModule: true,
    distDir: 'build',
    webpack: config => {
        config.resolve.alias['@'] = path.resolve(__dirname)
        config.plugins.push(
            new MomentLocalesPlugin({
                localesToKeep: ['ja'],
            })
        )
        return config;
    }
})