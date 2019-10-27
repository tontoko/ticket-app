const withCSS = require('@zeit/next-css')

const path = require('path')

module.exports = withCSS({
    distDir: '../functions/next'
})