const fs = require( "fs" );
const path = require( "path" );
const files = require( "./server/core/files" );
const root = path.resolve( __dirname );
const rootConfig = files.read( path.join( root, ".clutch", "config.json" ), true );
// If we're in local sandbox then these come from .clutch/config.json as above.
// However, Netlify doesn't have the config JSON so we use environment variables.
const envVars = {
    apiAccess: rootConfig.prismic.apiAccess || process.env.PRISMIC_API_ACCESS,
    accessToken: rootConfig.prismic.accessToken || process.env.PRISMIC_API_TOKEN,
    webhookSecret: rootConfig.prismic.webhookSecret || process.env.PRISMIC_API_SECRET
};
const config = {
    // The URL of your actual site, Netlify domain: `clutch.kitajchuk.com`
    url: "https://clutch.kitajchuk.com",
    // Homepage UID
    homepage: "home",
    // Page Not Found UID — 404
    notfound: "404",
    // Page Server Error UID - 500
    notright: "500",
    // Timestamp ( Stamp of instantiation )
    timestamp: Date.now(),
    // Single page web application
    onepager: false,
    // Environments
    env: {
        sandbox: (process.env.NODE_ENV === "sandbox"),
        netlify: (process.env.NODE_ENV === "netlify")
    },
    // API CMS config ( Prismic )
    api: {
        // Prismic
        // Access is your API URL from Prismic's settings panel
        adapter: "prismic",
        access: envVars.apiAccess,
        token: envVars.accessToken,
        secret: envVars.webhookSecret
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
        js: `/js/clutch.js`,
        css: `/css/screen.css`
    },
    // Compression js config
    compression: {
        level: 9,
        threshold: 0
    },
    // Generators config ( sitemap.xml, robots.txt, static )
    generate: {
        sitemap: {
            site: false
        },
        robots: {
            site: false,
            page: false
        },
        // Useful for prismic collection forms
        // { type: collection }
        // Example:  { "casestudy": "work" }
        // Resolves "/work/:uid" from "/casestudy/:uid"
        mappings: {}
    }
};



// Local dev URL
if ( config.env.sandbox ) {
    config.url = `http://localhost:${config.browser.port}`;
}



module.exports = config;
