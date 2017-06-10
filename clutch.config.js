const path = require( "path" );
const root = path.resolve( __dirname );
const config = {
    // Homepage UID
    homepage: "home",
    // Page Not Found — 404
    notfound: "404",
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
        // Prismic
        access: "https://clutch.cdn.prismic.io/api",
        adapter: "prismic",
        // Contentful
        // space: "",
        // access: "",
        // adapter: "contentful"
    },
    // Deployment config ( AWS etc... )
    deploy: {
        cdnURL: "",
    },
    // Templating config
    template: {
        module: "ejs",
        dir: path.join( root, "template" ),
        layout: path.join( root, "template/index.html" ),
        pagesDir: path.join( root, "template", "pages" ),
        partialsDir: path.join( root, "template", "partials" ),
        staticDir: path.join( root, "static" )
    },
    // Express.js config
    express: {
        port: 8000
    },
    // Browser-sync config
    browser: {
        port: 8001
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
    }
};



// Serves assets from either CDN or App Server...
config.deploy.cdnEnabled = (!config.env.sandbox && config.deploy.cdnURL);
config.static.js = config.deploy.cdnEnabled ? `${config.deploy.cdnURL}${config.static.endJS}` : config.static.endJS;
config.static.css = config.deploy.cdnEnabled ? `${config.deploy.cdnURL}${config.static.endCSS}` : config.static.endCSS;



module.exports = config;
