const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const rootSandbox = path.join( root, "sandbox" );
const rootTemplatePartials = path.join( root, "template", "partials" );
const rootNotes = path.join( root, ".notes" );
const rootHobo = path.join( rootNodeModules, "properjs-app", "node_modules", "properjs-hobo" );
const rootServer = path.join( root, "server" );
const rootTasks = path.join( root, "tasks" );
const child_process = require( "child_process" );
const config = require( "./clutch.config" );


// Note that with `npm@5` there have been some hiccups
// The ultimate resolve was to trash the `.npm` cache



console.log( "Installing node_modules..." );


// 1.0: No `node_modules`
if ( !fs.existsSync( rootNodeModules ) ) {
    child_process.execSync( "npm install" );

// 2.0 Reset `node_modules` cache
} else {
    child_process.execSync( `rm -rf ${rootNodeModules}` );
    child_process.execSync( "npm install" );
}


// 3.0 Create sandbox
console.log( "Creating sandbox..." );

if ( !fs.existsSync( rootSandbox ) ) {
    child_process.execSync( `mkdir ${rootSandbox}` );
}


// 4.0 Create template partials
console.log( "Creating template partials..." );

if ( !fs.existsSync( rootTemplatePartials ) ) {
    child_process.execSync( `mkdir ${rootTemplatePartials}` );
}


// 5.0 Create notes
console.log( "Creating notes..." );

if ( !fs.existsSync( rootNotes ) ) {
    child_process.execSync( `touch ${rootNotes}` );
}


// 6.0 Hobo.js build
console.log( "Building properjs-hobo..." );

child_process.execSync( `cd ${rootHobo} && npm install && npm run build -- '${config.browser.hobo}'` );


// 7.0 server install
console.log( "Installing server node_modules..." );

child_process.execSync( `cd ${rootServer} && npm install` );


// 8.0 tasks install
console.log( "Installing tasks node_modules..." );

if ( fs.existsSync( rootTasks ) ) {
    child_process.execSync( `cd ${rootTasks} && npm install` );
}

// 9.0 done
console.log( "Done!" );
