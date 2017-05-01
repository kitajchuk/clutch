const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const autoprefixer = require( "autoprefixer" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );
const CompressionPlugin = require( "compression-webpack-plugin" );



const config = {
    devtool: "source-map",


    plugins: [
        new BrowserSyncPlugin({
            open: true,
            host: "localhost",
            port: 8001,
            proxy: "http://localhost:8000"
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer( { browsers: ["last 2 versions"] } )]
            }
        })
    ],


    resolve: {
        modules: [root, source, nodeModules],
        mainFields: ["webpack", "browserify", "web", "hobo", "main"]
    },


    entry: {
        "app": path.resolve( __dirname, "source/js/app.js" )
    },


    output: {
        path: path.resolve( __dirname, "static/js" ),
        filename: "[name].js"
    },


    module: {
        rules: [
            { test: /source\/js\/.*\.js$/, exclude: /node_modules/, use: ["eslint-loader"], enforce: "pre" },
            { test: /source\/js\/.*\.js$/, exclude: /node_modules/, use: [{ loader: "babel-loader", options: { presets: ["es2015"] } }] },
            { test: /(hobo|hobo.build)\.js$/, use: ["expose-loader?hobo"] },
            { test: /\.(sass|scss)$/, use: ["file-loader?name=../css/[name].css", "postcss-loader", "sass-loader"] }
        ]
    }
};



module.exports = ( env ) => {
    if ( env.staging || env.production ) {
        config.plugins.push(new CompressionPlugin({
            asset: "[path]",
            algorithm: "gzip",
            test: /\.(js|css)$/,
            threshold: 0,
            minRatio: 0.8
        }));
    }

    return config;
};
