"use strict";



const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const cookieParser = require( "cookie-parser" );
const listeners = {};
const core = {
    watch: require( "./core/watch" ),
    query: require( "./core/query" ),
    config: require( "./core/config" ),
    content: require( "./core/content" ),
    template: require( "./core/template" )
};



/**
 *
 * Configure Express Middleware.
 *
 */
expressApp.use( cookieParser() );
expressApp.use( compression( core.config.compression ) );
expressApp.use( express.static( core.config.template.staticDir, {
    maxAge: core.config.static.maxAge
}));



/**
 *
 * Configure Express Routes.
 *
 */
const getKey = function ( type ) {
    let key = type;

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
    core.query.getWebhook( req, res ).then(( data ) => {
        console.log( core.config.logger, "Webhook data", data );
    });
};



// SYSTEM
expressApp.get( "/preview", getPreview );
expressApp.post( "/webhook", getWebhook );

// API => JSON
expressApp.get( "/api/:type", getApi );
expressApp.get( "/api/:type/:uid", getApi );

// URI => HTML
expressApp.get( "/", getPage );
expressApp.get( "/:type", getPage );
expressApp.get( "/:type/:uid", getPage );



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
        core.watch.getPages().then(() => {
            if ( core.config.env.sandbox ) {
                core.watch.startWatch();
            }

            expressApp.listen( core.config.express.port );

            console.log( core.config.logger, `Express server started` );
            console.log( core.config.logger, `Access URL — http://localhost:${core.config.browser.port}` );
        });
    }
};
