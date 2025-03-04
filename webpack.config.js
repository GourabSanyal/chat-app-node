const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'webworker',
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "querystring": require.resolve("querystring-es3"),
      "url": require.resolve("url/"),
      "timers": require.resolve("timers-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "vm": require.resolve("vm-browserify"),
      "assert": require.resolve("assert/"),
      "util": require.resolve("util/"),
      "fs": false,
      "net": false,
      "tls": false,
    },
  },
};