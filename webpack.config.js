module.exports = {
  entry: {
    main: './tic-tac-toe.js'
  },
  module: {
    rules : [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-react-jsx',
                {
                  pragma: 'createElement'
                }
              ]
            ]
          }
        }
      }
    ]
  },
  mode: 'development',
  optimization: {
    minimize: false
  }
}