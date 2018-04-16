const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

var plugins = [];
var rules = [
  {
    test: /\.svg$/,
    loader: 'svg-sprite-loader',
    exclude: /fonts/,
  }, {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=600000&mimetype=application/font-woff',
  }, {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=600000',
    include: /fonts/,
  }, {
    test: /\.(png|jpg)$/,
    loader: 'url-loader?limit=600000',
  }, {
    test: /\.css$/,
    use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer('last 2 versions')],
        },
      },
    ]
  }, {
    test: /\.c$/i,
    loader: 'shader-loader',
  }, {
    test: /\.json$/,
    loader: 'json-loader',
  }, {
    test: /\.html$/,
    loader: 'html-loader',
  }, {
    test: /\.glsl$/,
    loader: 'shader-loader',
  }, {
    test: /\.js$/,
    include: /node_modules(\/|\\)paraviewweb(\/|\\)/,
    loader: 'babel-loader',
    options: {
      presets: ['env', 'react'],
    },
  }, {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['env', 'react'],
    }
  }, {
    test: /\.js$/,
    include: /node_modules(\/|\\)arctic-viewer(\/|\\)/,
    loader: 'babel-loader',
    options: {
      presets: ['env', 'react'],
    }
  }, {
    test: /\.js$/,
    include: /node_modules(\/|\\)vtk.js(\/|\\)/,
    loader: 'babel-loader',
    options: {
      presets: ['env', 'react'],
    }
  }, {
    test: /\.mcss$/,
    use: [{
      loader: 'style-loader'
    }, {
      loader: 'css-loader',
      options: {
        localIdentName: '[name]-[local]_[sha512:hash:base32:5]',
        modules: true,
      },

    }, {
      loader: 'postcss-loader',
      options: {
        plugins: () => [autoprefixer({ browsers: ['last 2 versions'] })],
      },
    }]
  },
  {
    enforce: 'pre',
    test: /\.js$/,
    loader: 'eslint-loader',
    exclude: /node_modules/,
    options: { configFile: path.resolve(__dirname, '.eslintrc.js') }
  }
];

if (process.env.NODE_ENV === 'production') {
  console.log('==> Production build');
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }));
}

module.exports = {
  plugins: plugins,
  entry: './Source/tomviz-viewer.js',
  output: {
    path: path.resolve(__dirname, './Distribution'),
    filename: 'tomviz.js',
  },
  module: {
    rules: rules,
  },
  externals: {
  },
  resolve: {
    alias: {
      PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
    },
  }
};
