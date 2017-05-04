const path = require( "path" );
const config = {
    // Timestamp ( Will be time app booted )
    timestamp: Date.now(),
    // Environments
    env: {
        sandbox: (process.env.NODE_ENV === "sandbox"),
        staging: (process.env.NODE_ENV === "staging"),
        production: (process.env.NODE_ENV === "production")
    },
    // API CMS config ( Prismic, Contentful )
    api: {
        access: "https://kitajchuk-template-express.cdn.prismic.io/api"
    },
    // Deployment config ( AWS etc... )
    deploy: {
        cdnURL: "",
    },
    // Templating config
    template: {
        module: "ejs",
        require: require( "ejs" ),
        dir: path.join( __dirname, "../template" ),
        layout: path.join( __dirname, "../template/index.html" ),
        pagesDir: path.join( __dirname, "../template", "pages" ),
        partialsDir: path.join( __dirname, "../template", "partials" ),
        staticDir: path.join( __dirname, "../static" )
    },
    // Express.js config
    express: {
        port: 8000
    },
    // Static assets config
    static: {
        // One day
        maxAge: 86400000,
        endJS: "/js/app.js",
        endCSS: "/css/screen.css"
    },
    // Compression js config
    compression: {
        level: 9,
        threshold: 0
    },
    // Console log prefix
    logger: "[@kitajchuk]"
};



// Serves assets from either CDN or App Server...
config.static.js = (config.env.production && config.deploy.cdnURL) ? `${config.deploy.cdnURL}${config.static.endJS}` : config.static.endJS;
config.static.css = (config.env.production && config.deploy.cdnURL) ? `${config.deploy.cdURLL}${config.static.endCSS}` : config.static.endCSS;



module.exports = config;
