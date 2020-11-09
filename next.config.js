const withPWA = require('next-pwa')
const withMDX = require('@next/mdx')()
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')

module.exports = withPWA(
  withMDX({
    images: {
      domains: [
        'graph.facebook.com',
        'firebasestorage.googleapis.com',
        'lh3.googleusercontent.com',
        'storage.googleapis.com',
      ],
    },
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
    webpack: (config) => {
      config.plugins.push(
        new MomentLocalesPlugin({
          localesToKeep: ['ja'],
        }),
      )
      return config
    },
  }),
)
