const fs = require( "fs" );
const path = require( "path" );
const files = require( "./server/core/files" );
const root = path.resolve( __dirname );
const rootConfig = files.read( path.join( root, ".clutch", "config.json" ), true );
// If we're in local sandbox then these come from .clutch/config.json as above.
// However, CircleCI doesn't have the config JSON so we use environment variables.
const envRegex = /^DEVELOPMENT_URL|^PRODUCTION_URL/g;
const envVars = {
    devUrl: rootConfig.clutch.urls.development.replace( envRegex, "" ) || process.env.DEVELOPMENT_URL,
    prodUrl: rootConfig.clutch.urls.production.replace( envRegex, "" ) || process.env.PRODUCTION_URL,
    apiAccess: rootConfig.prismic.apiAccess || process.env.PRISMIC_API_ACCESS,
    accessToken: rootConfig.prismic.accessToken || process.env.PRISMIC_API_TOKEN,
    webhookSecret: rootConfig.prismic.webhookSecret || process.env.PRISMIC_API_SECRET
};
const config = {
    // The URL of your actual site
    // It's OK for this to be empty here as it will be determined below...
    url: "",
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
        development: (process.env.NODE_ENV === "development"),
        production: (process.env.NODE_ENV === "production")
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
    // Deployment config ( AWS )
    aws: {
        // Turn on to use CDN ( You can just use S3 or add CloudFront if you want )
        cdn: ""
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
        port: 8000,
        portHttps: 8443
    },
    // Browser-sync config
    browser: {
        port: 8001
    },
    // Static assets config
    static: {
        // One day
        maxAge: 86400000,
        endJS: `/js/clutch.${process.env.NODE_ENV}.js`,
        endCSS: `/css/screen.${process.env.NODE_ENV}.css`,
        // Enable static site server+generator+deploy+websub
        site: true
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
    },
    // Third-party app Oauth authorizations
    authorizations: {
        token: rootConfig.clutch.authorizationsToken,
        apps: []
    },
    // letsencrypt
    letsencrypt: rootConfig.letsencrypt,
    // https
    https: false
};



// Serves assets from either CDN or App Server/Static site
if ( config.aws.cdn && config.env.production ) {
    config.static.js = `${config.aws.cdn}${config.static.endJS}`;
    config.static.css = `${config.aws.cdn}${config.static.endCSS}`;
}



// Configure URLs & HTTPS
// Local sandbox
if ( config.env.sandbox ) {
    config.url = `http://localhost:${config.browser.port}`;
    config.https = false;

// Development box
} else if ( config.env.development ) {
    config.url = envVars.devUrl;

    // NOT running clutch-static, HTTPS:TRUE & viable path to letsencrypt certs
    if ( !config.static.site && config.https && rootConfig.letsencrypt.developmentPath ) {
        config.letsencrypt.privkey = `${rootConfig.letsencrypt.developmentPath}privkey.pem`;
        config.letsencrypt.cert = `${rootConfig.letsencrypt.developmentPath}cert.pem`;
        config.letsencrypt.chain = `${rootConfig.letsencrypt.developmentPath}chain.pem`;
    }

// Production box
} else if ( config.env.production ) {
    config.url = envVars.prodUrl;

    // NOT running clutch-static, HTTPS:TRUE & viable path to letsencrypt certs
    if ( !config.static.site && config.https && rootConfig.letsencrypt.productionPath ) {
        config.letsencrypt.privkey = `${rootConfig.letsencrypt.productionPath}privkey.pem`;
        config.letsencrypt.cert = `${rootConfig.letsencrypt.productionPath}cert.pem`;
        config.letsencrypt.chain = `${rootConfig.letsencrypt.productionPath}chain.pem`;
    }
}



module.exports = config;
