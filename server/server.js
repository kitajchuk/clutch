const config = require( "./config" );
const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const cookieParser = require( "cookie-parser" );
const lib = {
    watch: require( "./lib/watch" ),
    query: require( "./lib/query" ),
    content: require( "./lib/content" ),
    template: require( "./lib/template" )
};



/**
 *
 * Configure Express Middleware.
 *
 */
expressApp.use( cookieParser() );
expressApp.use( compression( config.compression ) );
expressApp.use( express.static( config.template.staticDir, {
    maxAge: config.static.maxAge
}));



/**
 *
 * Configure Express Routes.
 *
 */
expressApp.get( "/api/:type", lib.query.getApi );
expressApp.get( "/api/:type/:uid", lib.query.getApi );
expressApp.get( "/preview", lib.query.getPreview );
expressApp.get( "/", lib.content.getPage );
expressApp.get( "/:type", lib.content.getPage );
expressApp.get( "/:type/:uid", lib.content.getPage );



/**
 *
 * Start the Express {app}.
 *
 */
lib.watch.getPages().then(() => {
    lib.watch.startWatch();

    expressApp.listen( config.express.port );

    console.log( config.logger, `Express server started` );
    console.log( config.logger, `Access URL — http://localhost:${config.express.port}` );
});
