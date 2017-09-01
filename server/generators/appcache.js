const child_process = require( "child_process" );
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const prefix = config.aws.cdnOn ? config.aws.cdn : "";

// Generate cache manifest
lager.cache( "Clutch generating appcache-manifest" );
    child_process.execSync( `./node_modules/.bin/appcache-manifest -p ${prefix} -o ./static/cache.manifest --stamp --network-star ./static/**/*` );
