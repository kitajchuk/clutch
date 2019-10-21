const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const child_process = require( "child_process" );
const config = require( "../clutch.config" );


// Note that with `npm@5` there have been some hiccups
// The ultimate resolve was to trash the `.npm` cache


// 1.0: Fresh `node_modules`
console.log( "Installing node_modules..." );

child_process.execSync( `rm -rf ${rootPackageLock}` );
// child_process.execSync( `rm -rf ${rootNodeModules}` );
child_process.execSync( "npm i" );


// 2.0 Stop `environment` server
try {
    console.log( `Try stopping ${process.env.NODE_ENV} server...` );

    child_process.execSync( "npm run stop" );

} catch ( error ) {
    console.log( `Stopping server failed: ${error}` );
}


// 3.0 Start `environment` server
console.log( `Starting ${process.env.NODE_ENV} server...` );

child_process.execSync( `npm run start:${process.env.NODE_ENV}` );
