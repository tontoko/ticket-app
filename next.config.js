const path = require('path')
const withCSS = require('@zeit/next-css')

module.exports = withCSS({
    distDir: 'build',
    webpack: config => {
        config.resolve.alias['@'] = path.resolve(__dirname);
        return config;
    }
})