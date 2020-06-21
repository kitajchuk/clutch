const fs = require( "fs" );
const path = require( "path" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootClutch = path.join( root, ".clutch" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
// Leave this alone! You put your values in .clutch/config.json
// Netlify / CircleCI environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
// For CircleCI set these in a Context called `aws`
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
const rootConfig = require( "./clutch.root" );



// Fresh `node_modules`
console.log( "[Clutch] Installing node_modules..." );

child_process.execSync( "npm i" );



// Create sandbox
console.log( "[Clutch] Creating .clutch directory..." );

if ( !fs.existsSync( rootClutch ) ) {
    child_process.execSync( `mkdir ${rootClutch}` );
    child_process.execSync( `touch ${path.join( rootClutch, "config.json" )}` );

    files.write( path.join( rootClutch, "config.json" ), rootConfig, true );
}


// Hobo.js build
console.log( "[Clutch] Building properjs-hobo..." );

child_process.execSync( `npm run bootstrap:hobo` );


// 6.0 done
console.log( "[Clutch] Install complete!" );
