const path = require( "path" );
const root = path.resolve( __dirname );
const config = {
    // Homepage UID
    homepage: "home",
    // Page Not Found UID — 404
    notfound: "404",
    // Timestamp ( Stamp of instantiation )
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
        // adapter: "prismic",
        // access: "https://clutch.cdn.prismic.io/api", // This is your API URL
        // token: null // This is your optional API access token

        // Contentful
        adapter: "contentful",
        access: "355y876evbep", // This is your space ID
        token: "8520d90818ee9a87c3cc1275c617ed7254d881f6d24178a4401d9b0cb39640d3", // This is your main CDN token
        preview: "0276a23aa96144f7fdaa7108bd7ba3fe9555107673f84d6c58dc42e0f33eda4a" // This is your main Preview token
    },
    // Deployment config ( AWS etc... )
    // Would be nice to include Heroku here...?
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
        port: 8001,
        hobo: "is eq not attr filter detach remove append"
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
