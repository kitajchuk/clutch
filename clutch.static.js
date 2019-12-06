const config = require( "./clutch.config" );
const router = require( "./server/core/router" );
const stasis = require( `./server/generators/${config.api.adapter}.static` );
const lager = require( "properjs-lager" );

if ( config.static.site ) {
    // Explicit false for static!
    // Even if the node app is using https: true and you're using https for your s3 bucket,
    // it's necessary to set this here during the static generation because clutch uses
    // the sandbox dev server to map a static build from the /sitemap.xml endpoint.
    config.https = false;

    const clean = Number( process.env.CLUTCH_CLEAN );

    router.init().then(() => {
        if ( clean ) {
            stasis.clean( config ).then(() => {
                lager.cache( "Static files have been cleaned." );
                process.exit( 0 );
            });

        } else {
            stasis.generate( config ).then(() => {
                lager.cache( "Static files have been created." );
                process.exit( 0 );
            });
        }
    });
}
