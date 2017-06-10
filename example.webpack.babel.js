
import HtmlPlugin from 'html-webpack-plugin'; // eslint-disable-line


export default {
  entry: './example/index.js',
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/served/`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_module/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new HtmlPlugin({
    template: `${__dirname}/example/index.html`,
  })],
  devtool: 'source-map',
  watch: true,
  devServer: {
    contentBase: 'served/',
    port: 8082,
  },
};
