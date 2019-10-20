"use strict";



const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const rootClutch = path.join( root, ".clutch" );
const rootTemplatePartials = path.join( root, "template", "partials" );
const rootNotes = path.join( root, ".notes" );
const rootServer = path.join( root, "server" );
const rootTasks = path.join( root, "tasks" );
const rootSource = path.join( root, "source" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
const rootConfig = {
    prismic: {
        apiAccess: "",
        accessToken: "",
        webhookSecret: ""
    },
    letsencrypt: {
        developmentPath: "",
        productionPath: "",
        privkey: "",
        cert: "",
        chain: "",
        domains: {
            development: ["DEVELOPMENT_DOMAIN"],
            production: ["PRODUCTION_DOMAIN", "PRODUCTION_DOMAIN_WWW"]
        }
    },
    clutch: {
        authorizationsToken: ""
    }
};



// Note that with `npm@5` there have been some hiccups
// The ultimate resolve was to trash the `.npm` cache



// 1.0: Fresh `node_modules`
console.log( "Installing node_modules..." );

// child_process.execSync( `rm -rf ${rootPackageLock}` );
// child_process.execSync( `rm -rf ${rootNodeModules}` );
child_process.execSync( "npm i" );



// 2.0 Create sandbox
console.log( "Creating .clutch..." );

if ( !fs.existsSync( rootClutch ) ) {
    child_process.execSync( `mkdir ${rootClutch}` );
    child_process.execSync( `mkdir ${path.join( rootClutch, "authorizations" )}` );
    child_process.execSync( `touch ${path.join( rootClutch, "config.json" )}` );

    // Leave this alone! You put your values in .clutch/config.json
    files.write( path.join( rootClutch, "config.json" ), rootConfig, true );
}


// 3.0 Create template partials
console.log( "Creating template partials..." );

if ( !fs.existsSync( rootTemplatePartials ) ) {
    child_process.execSync( `mkdir ${rootTemplatePartials}` );
}


// 4.0 Create notes
console.log( "Creating notes..." );

if ( !fs.existsSync( rootNotes ) ) {
    child_process.execSync( `touch ${rootNotes}` );
}


// 5.0 Create source
console.log( "Creating source...?" );

if ( !fs.existsSync( rootSource ) ) {
    child_process.execSync( `npm install clutch-cli` );
    child_process.execSync( `./node_modules/.bin/clutch source` );
}


// 6.0 Hobo.js build
console.log( "Building properjs-hobo..." );

child_process.execSync( `npm run boostrap:hobo` );


// 7.0 server install
console.log( "Installing server node_modules..." );

child_process.execSync( `cd ${rootServer} && npm i` );


// 8.0 tasks install
console.log( "Installing tasks node_modules..." );

if ( fs.existsSync( rootTasks ) ) {
    child_process.execSync( `cd ${rootTasks} && npm i` );
}

// 9.0 done
console.log( "Done!" );
