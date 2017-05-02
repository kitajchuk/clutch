const path = require( "path" );
const config = {
    isProduction: (process.env.NODE_ENV === "production"),
    port: 8000,
    apiAccess: "https://kitajchuk-template-prismic.cdn.prismic.io/api",
    cdnBaseURL: "",
    endJS: "/js/app.js",
    endCSS: "/css/screen.css",
    timestamp: Date.now(),
    template: {
        module: "ejs",
        require: require( "ejs" ),
        dir: path.join( __dirname, "../template" ),
        layout: path.join( __dirname, "../template/index.html" ),
        pagesDir: path.join( __dirname, "../template", "pages" ),
        partialsDir: path.join( __dirname, "../template", "partials" ),
        staticDir: path.join( __dirname, "../static" )
    },
    static: {
        // One day
        maxAge: 86400000
    },
    compression: {
        level: 9,
        threshold: 0
    },
    logger: "[@kitajchuk]"
};



// Serves assets from either CDN or App Server...
config.static.js = (config.isProduction && config.cdnBaseURL) ? `${config.cdnBaseURL}${config.endJS}` : config.endJS;
config.static.css = (config.isProduction && config.cdnBaseURL) ? `${config.cdnBaseURL}${config.endCSS}` : config.endCSS;



module.exports = config;
