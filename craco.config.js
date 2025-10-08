const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Development optimizations
      if (env === 'development') {
        // Enable fast refresh
        webpackConfig.plugins.push(
          new webpack.HotModuleReplacementPlugin()
        );

        // Optimize module resolution
        webpackConfig.resolve = {
          ...webpackConfig.resolve,
          alias: {
            ...webpackConfig.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@types': path.resolve(__dirname, 'src/types'),
          },
          extensions: ['.js', '.jsx', '.json'],
        };

        // Optimize dev server
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          hot: true,
          liveReload: false,
          compress: true,
          historyApiFallback: true,
          client: {
            overlay: {
              errors: true,
              warnings: false,
            },
          },
        };

        // Optimize chunk splitting for development
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
            },
          },
        };

        // Disable source maps in development for faster builds
        webpackConfig.devtool = 'eval-cheap-module-source-map';
      }

      // Production optimizations
      if (env === 'production') {
        // Enable tree shaking
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: false,
        };

        // Optimize bundle splitting
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        };
      }

      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
