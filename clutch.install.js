const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const rootClutch = path.join( root, ".clutch" );
const rootTemplatePartials = path.join( root, "template", "partials" );
const rootNotes = path.join( root, ".notes" );
const rootServer = path.join( root, "server" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
// Leave this alone! You put your values in .clutch/config.json
// Netlify environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
const rootConfig = require( "./clutch.root" );



// 1.0: Fresh `node_modules`
console.log( "[Clutch] Installing node_modules..." );

child_process.execSync( "npm i" );



// 2.0 Create sandbox
console.log( "[Clutch] Creating .clutch directory..." );

if ( !fs.existsSync( rootClutch ) ) {
    child_process.execSync( `mkdir ${rootClutch}` );
    child_process.execSync( `mkdir ${path.join( rootClutch, "authorizations" )}` );
    child_process.execSync( `touch ${path.join( rootClutch, "config.json" )}` );

    files.write( path.join( rootClutch, "config.json" ), rootConfig, true );
}


// 3.0 Create template partials
console.log( "[Clutch] Creating template partials..." );

if ( !fs.existsSync( rootTemplatePartials ) ) {
    child_process.execSync( `mkdir ${rootTemplatePartials}` );
}


// 4.0 Create notes
console.log( "[Clutch] Creating .notes file for dev..." );

if ( !fs.existsSync( rootNotes ) ) {
    child_process.execSync( `touch ${rootNotes}` );
}


// 5.0 Hobo.js build
console.log( "[Clutch] Building properjs-hobo..." );

child_process.execSync( `npm run bootstrap:hobo` );


// 6.0 server install
console.log( "[Clutch] Installing server node_modules..." );

child_process.execSync( `cd ${rootServer} && npm i` );

// 7.0 done
console.log( "[Clutch] Install complete!" );
