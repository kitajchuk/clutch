const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const autoprefixer = require( "autoprefixer" );
const child_process = require( "child_process" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );
const CompressionPlugin = require( "compression-webpack-plugin" );
const OnBuildWebpackPlugin = require( "on-build-webpack" );
const sassFontPath = config.deploy.cdnEnabled ? `${config.deploy.cdnURL}/fonts/` : "/fonts/";



const webpackConfig = {
    devtool: "source-map",


    plugins: [
        new BrowserSyncPlugin({
            open: true,
            host: "localhost",
            port: config.browser.port,
            proxy: `http://localhost:${config.express.port}`,
            files: [
                "template/**/*.html"
            ]
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer( { browsers: ["last 2 versions"] } )]
            }
        }),
        new OnBuildWebpackPlugin(() => {
            const prefix = config.deploy.cdnEnabled ? config.deploy.cdnURL : "";

            // Generate cache manifest
            lager.cache( "Clutch generating appcache-manifest" );
                child_process.execSync( `./node_modules/.bin/appcache-manifest -p ${prefix} -o ./static/cache.manifest --stamp --network-star ./static/**/*` );
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
        filename: "app.js"
    },


    module: {
        rules: [
            { test: /source\/js\/.*\.js$/, /*exclude: /node_modules/,*/ use: ["eslint-loader"], enforce: "pre" },
            { test: /source\/js\/.*\.js$/, /*exclude: /node_modules/,*/ use: [{ loader: "babel-loader", options: { presets: ["es2015"] } }] },
            { test: /(hobo|hobo.build)\.js$/, use: ["expose-loader?hobo"] },
            { test: /\.(sass|scss)$/, use: ["file-loader?name=../css/[name].css", "postcss-loader", {loader: "sass-loader", options: { outputStyle: "compressed", data: '$font-path: "' + sassFontPath + '";' }}] }
        ]
    }
};



module.exports = ( env ) => {
    // You can enable gzip compression here...
    // if ( env.staging || env.production ) {
    //     webpackConfig.plugins.push(new CompressionPlugin({
    //         asset: "[path]",
    //         algorithm: "gzip",
    //         test: /\.(js|css)$/,
    //         threshold: 0,
    //         minRatio: 0.8
    //     }));
    // }

    return webpackConfig;
};
