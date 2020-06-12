const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );



module.exports = ( env ) => {
    return {
        mode: "none",


        devtool: "source-map",


        plugins: [
            new BrowserSyncPlugin({
                open: true,
                host: "localhost",
                port: config.browser.port,
                proxy: `http://localhost:${config.express.port}`,
                files: [
                    "template/**/*.html",
                    "template/**/*.json"
                ]
            })
        ],


        resolve: {
            modules: [root, source, nodeModules],
            mainFields: ["webpack", "browserify", "web", "clutch", "hobo", "main"]
        },


        entry: {
            "app": path.resolve( __dirname, `source/${config.theme}/js/app.js` )
        },


        output: {
            path: path.resolve( __dirname, "static/js" ),
            filename: `app.js`
        },


        module: {
            rules: [
                {
                    test: /source\/js\/.*\.js$/i,
                    exclude: /node_modules/,
                    loader: "eslint-loader",
                    enforce: "pre",
                    options: {
                        emitError: true,
                        emitWarning: false,
                        failOnError: true,
                        quiet: true,
                    },
                },
                {
                    test: /source\/js\/.*\.js$/i,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: ["@babel/preset-env"],
                            },
                        },
                    ],
                },
                {
                    test: /(hobo|hobo.build)\.js$/i,
                    use: ["expose-loader?hobo"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    exclude: /node_modules/,
                    use: [
                        "file-loader?name=../css/[name].css",
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    outputStyle: (env.sandbox ? "uncompressed" : "compressed"),
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/i,
                    exclude: /node_modules/,
                    use: [
                        "svg-inline-loader",
                    ],
                },
            ]
        }
    };
};
