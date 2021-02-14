const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );
const ESLintPlugin = require( "eslint-webpack-plugin" );
const isEnv = ( env ) => {
    return (process.env.NODE_ENV === env);
};



module.exports = [
    {
        mode: "none",


        devtool: "source-map",


        plugins: [
            new ESLintPlugin({
                emitError: true,
                emitWarning: false,
                failOnError: true,
                quiet: true,
                context: path.resolve( __dirname, "source" ),
                exclude: [
                    "node_modules",
                ],
            }),
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
                    // test: /source\/.*\.js$/i,
                    // exclude: /node_modules/,
                    test: /source\/.*\.js$|node_modules\/[properjs-|konami-|paramalama].*/i,
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
                                    outputStyle: (isEnv( "sandbox" ) ? "uncompressed" : "compressed"),
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
    }
];
