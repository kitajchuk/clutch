// You put your values in .clutch/config.json
// Netlify / CircleCI environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
// AWS_ACCESS_KEY
// AWS_SECRET_ACCESS_KEY
const child_process = require( "child_process" );
const lager = require( "properjs-lager" );
const s3 = require( "properjs-s3" );
const router = require( "./server/core/router" );
const config = require( "./clutch.config" );
const stasis = require( "./server/generators/static" );



// Use the node.js app to generate our static build
router.init().then(() => {
    stasis.generate( config ).then(() => {
        const bucket = config.url.replace( /^https?:\/\//, "" );
        const directory = "static";

        s3.sync({
            key: config.envVars.accessKey,
            secret: config.envVars.secretAccessKey,
            region,
            bucket,
            directory,

        }).then(() => {
            stasis.clean( config ).then(() => {
                process.exit( 0 );
            });

        }).catch(( error ) => {
            process.exit( 1 );
        });
    });
});
