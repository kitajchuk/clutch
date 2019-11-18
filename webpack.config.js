const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const autoprefixer = require( "autoprefixer" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );
const CompressionPlugin = require( "compression-webpack-plugin" );
const OnBuildWebpackPlugin = require( "on-build-webpack" );
const sassFontPath = (config.aws.cdn && config.env.production) ? `${config.aws.cdn}/fonts/` : "/fonts/";



const webpackConfig = {
    mode: "none",


    devtool: "source-map",


    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer( { browsers: ["last 2 versions"] } )]
            }
        }),
        new OnBuildWebpackPlugin(() => {
            lager.cache( "Webpack build complete" );
        }),
        new BrowserSyncPlugin({
            open: true,
            host: "localhost",
            port: config.browser.port,
            proxy: `http://localhost:${config.express.port}`
        })
    ],


    resolve: {
        modules: [root, source, nodeModules],
        mainFields: ["webpack", "browserify", "web", "clutch", "hobo", "main"]
    },


    entry: {
        "clutch": path.resolve( __dirname, "source/js/properjs/clutch.js" )
    },


    output: {
        path: path.resolve( __dirname, "static/js" ),
        filename: `clutch.${process.env.NODE_ENV}.js`
    },


    module: {
        rules: [
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules|vendor/,
                use: ["eslint-loader"],
                enforce: "pre"
            },
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules|vendor/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["env"]
                        }
                    }
                ]
            },
            {
                test: /(hobo|hobo.build)\.js$/,
                use: ["expose-loader?hobo"]
            },
            {
                test: /\.(sass|scss)$/,
                exclude: /node_modules|vendor/,
                use: [
                    `file-loader?name=../css/[name].${process.env.NODE_ENV}.css`,
                    "postcss-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            outputStyle: "compressed",
                            data: '$font-path: "' + sassFontPath + '";'
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                use: [
                    "svg-inline-loader"
                ]
            }
        ]
    }
};



module.exports = ( env ) => {
    // You can enable gzip compression here for S3...
    if ( env.production && config.aws.cdn ) {
        webpackConfig.plugins.push(new CompressionPlugin({
            asset: "[path]",
            algorithm: "gzip",
            test: /\.(js|css)$/,
            threshold: 0,
            minRatio: 0.8
        }));
    }

    return webpackConfig;
};
