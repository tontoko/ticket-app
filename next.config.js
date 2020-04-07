const path = require('path')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
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
}