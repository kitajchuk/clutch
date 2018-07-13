"use strict";



const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const cookieParser = require( "cookie-parser" );
const bodyParser = require( "body-parser" );
const lager = require( "properjs-lager" );
const listeners = {};
const core = {
    query: require( "./query" ),
    config: require( "../../clutch.config" ),
    content: require( "./content" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );
let isSiteUpdate = false;



/**
 *
 * Configure Express Middleware.
 *
 */
expressApp.use( cookieParser() );
expressApp.use( bodyParser.json() );
expressApp.use( bodyParser.urlencoded({
    extended: true
}));
expressApp.use( compression( core.config.compression ) );
expressApp.use( express.static( core.config.template.staticDir, {
    maxAge: core.config.static.maxAge
}));



/**
 *
 * Configure Express Routes.
 *
 */
const setReq = function ( req, res, next ) {
    req.params.type = req.params.type || core.config.homepage;

    next();
};
const getKey = function ( type ) {
    const key = type;

    return key || core.config.homepage;
}
const getApi = function ( req, res ) {
    const key = getKey( req.params.type );

    core.query.getApi( req, res, listeners[ key ] ).then(( result ) => {
        if ( req.query.format === "html" ) {
            res.status( 200 ).send( result );

        } else {
            res.status( 200 ).json( result );
        }
    });
};
const getPage = function ( req, res ) {
    const key = getKey( req.params.type );

    core.content.getPage( req, res, listeners[ key ] ).then(( callback ) => {
        // Handshake callback :-P
        callback(( status, html ) => {
            res.status( status ).send( html );
        });
    });
};
const getPreview = function ( req, res ) {
    core.query.getPreview( req, res ).then(( url ) => {
        res.redirect( url );
    });
};
const getWebhook = function ( req, res ) {
    // Skip if update is in progress, Skip if invalid secret was sent
    if ( !isSiteUpdate && req.body.secret === core.config.api.secret ) {
        isSiteUpdate = true;

        // Re-Fetch Site JSON
        core.query.getSite().then(() => {
            isSiteUpdate = false;
        });
    }

    // Always resolve with a 200 and some text
    res.status( 200 ).send( core.config.api.secret );
};
const getSitemap = function ( req, res ) {
    const sitemap = require( `../generators/${core.config.api.adapter}.sitemap` );

    sitemap.generate().then(( xml ) => {
        res.set( "Content-Type", "text/xml" ).status( 200 ).send( xml );
    });

};
const checkAuthToken = function ( req, res, next ) {
    if ( req.query.token === core.config.authorizations.token ) {
        next();

    } else {
        res.redirect( "/" );
    }
}
const getAuthorizations = function ( req, res ) {
    req.params.type = "authorizations";
    core.content.getPage( req, res, listeners.authorizations ).then(( callback ) => {
        // Handshake callback :-P
        callback(( status, html ) => {
            res.status( status ).send( html );
        });
    });
};
const getAuthorizationForApp = function ( req, res ) {
    const app = core.config.authorizations.apps.find(( app ) => {
        return (app === req.params.app);
    });

    require( `../auth/${app}` ).auth( req, res );
};



// SYSTEM
expressApp.get( "/preview", getPreview );
expressApp.post( "/webhook", getWebhook );
expressApp.get( "/sitemap.xml", getSitemap );
expressApp.get( "/authorizations", checkAuthToken, getAuthorizations );
expressApp.get( "/authorizations/:app", checkAuthToken, getAuthorizationForApp );

// API => JSON
expressApp.get( "/api/:type", setReq, getApi );
expressApp.get( "/api/:type/:uid", setReq, getApi );

// URI => HTML
expressApp.get( "/", setReq, getPage );
expressApp.get( "/:type", setReq, getPage );
expressApp.get( "/:type/:uid", setReq, getPage );



/**
 *
 * Router API.
 *
 */
module.exports = {
    /**
     *
     * Handle router subscribe.
     *
     */
    on ( type, handlers ) {
        const key = getKey( type );

        // One handler per route
        if ( !listeners[ key ] ) {
            listeners[ key ] = {
                type: type,
                handlers: handlers
            };
        }
    },


    /**
     *
     * Start the Express {app}.
     *
     */
    init () {
        // Init authorizations
        core.config.authorizations.apps.forEach(( app ) => {
            require( `../auth/${app}` ).init( expressApp );
        });

        // Fetch ./template/pages listing
        core.template.getPages().then(() => {
            // Fetch Site JSON
            core.query.getSite().then(() => {
                expressApp.listen( core.config.express.port );

                lager.server( `Clutch Express server started` );
                lager.server( `Clutch access URL — http://localhost:${core.config.browser.port}` );
            });
        });
    }
};
