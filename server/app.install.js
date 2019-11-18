const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const child_process = require( "child_process" );
const config = require( "../clutch.config" );
const lager = require( "properjs-lager" );


// 1.0: Fresh `node_modules`
lager.info( "Installing node_modules..." );

child_process.execSync( "npm i" );


// 2.0 Stop `environment` server
try {
    lager.info( `Attempt stopping ${process.env.NODE_ENV} server.` );

    child_process.execSync( "npm run stop" );

} catch ( error ) {
    lager.error( `Stopping server failed: ${error}` );
}


// 3.0 Start `environment` server
lager.cache( `Starting ${process.env.NODE_ENV} server!` );

child_process.execSync( `npm run start:${process.env.NODE_ENV}` );
