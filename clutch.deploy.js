/*
 *
 * These env vars need to be applied in CircleCI
 *
 * AWS_USER:                 ec2-user by default
 * AWS_DEST:                 /var/www/html/ by default
 * AWS_DEVELOPMENT_HOST:     Elastic IP for dev instance
 * AWS_PRODUCTION_HOST:      Elastic IP for production instance
 * S3_BUCKET:                The name of the S3 bucket
 * S3_REGION:                The region field for the S3 bucket
 * S3_ACCESS_KEY:            The IAM role access key
 * S3_SECRET_KEY:            The IAM role secret key
 *
 */
const child_process = require( "child_process" );
const lager = require( "properjs-lager" );
const s3 = require( "properjs-s3" );
const router = require( "./server/core/router" );
const config = require( "./clutch.config" );
const stasis = require( `./server/generators/${config.api.adapter}.static` );



// Static site deployment to S3
if ( config.static.site ) {
    // Explicit false for static, even if the node app IS using https: true
    config.https = false;
    router.init().then(() => {
        stasis.generate( config ).then(() => {
            s3.sync(
                process.env.S3_ACCESS_KEY,
                process.env.S3_SECRET_KEY,
                process.env.S3_REGION,
                process.env.S3_BUCKET,
                null,
                "static"
            ).then(() => {
                stasis.clean( config ).then(() => {
                    process.exit( 0 );
                });

            }).catch(( error ) => {
                process.exit( 1 );
            });
        });
    });


// Node app deployment to EC2
} else {
    // Rsync + SSH and Restart App Server
    child_process.execSync( `rsync -av -e "ssh" --rsync-path "sudo rsync" --exclude "server/node_modules" server static template clutch.config.js ${process.env.AWS_USER}@${process.env.AWS_HOST}:${process.env.AWS_DEST}` );
    child_process.execSync( `ssh ${process.env.AWS_USER}@${process.env.AWS_HOST} "cd ${process.env.AWS_DEST}server/ ; sudo npm run install:${process.env.NODE_ENV}"` );
}
