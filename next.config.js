const path = require('path')
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withMDX({
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