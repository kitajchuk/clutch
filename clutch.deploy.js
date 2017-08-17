/**
 *
 * These are the variables you define for Clutch:
 *
 * AWS_USER — `ec2-user` by default
 * AWS_DEST — `/var/www/html/` by default
 * AWS_STAGING_HOST — IP for staging instance
 * AWS_PRODUCTION_HOST — IP for production instance
 * S3_BUCKET — The name of the S3 bucket
 * S3_REGION — The region field for the S3 bucket
 * S3_ACCESS_KEY — The IAM role access key
 * S3_SECRET_KEY — The IAM role secret key
 *
 */
const child_process = require( "child_process" );
const deployTargets = "server static template clutch.config.js";
const deployExclude = "server/node_modules";



if ( process.env.NODE_ENV === "staging" ) {
    // S3 Bucket Sync ( Uncomment if using S3 bucket )
    // child_process.execSync( `./node_modules/.bin/properjs-s3 --key ${process.env.S3_ACCESS_KEY} --secret ${process.env.S3_SECRET_KEY} --region "${process.env.S3_REGION}" --bucket "${process.env.S3_BUCKET}" --prefix "static" --directory "static"` );

    // Rsync + Restart App Server
    child_process.execSync( `rsync -av -e "ssh" --rsync-path "sudo rsync" --exclude "${deployExclude}" ${deployTargets} ${process.env.AWS_USER}@${process.env.AWS_STAGING_HOST}:${process.env.AWS_DEST}` );
    child_process.execSync( `ssh ${process.env.AWS_USER}@${process.env.AWS_STAGING_HOST} 'cd ${process.env.AWS_DEST}server/ ; echo ${Date.now()} > clutch.timestap ; sudo npm run install:staging'` );

} else if ( process.env.NODE_ENV === "production" ) {
    // S3 Bucket Sync ( Uncomment if using S3 bucket )
    // child_process.execSync( `./node_modules/.bin/properjs-s3 --key ${process.env.S3_ACCESS_KEY} --secret ${process.env.S3_SECRET_KEY} --region "${process.env.S3_REGION}" --bucket "${process.env.S3_BUCKET}" --prefix "static" --directory "static"` );

    // Rsync + Restart App Server
    child_process.execSync( `rsync -av -e "ssh" --rsync-path "sudo rsync" --exclude "${deployExclude}" ${deployTargets} ${process.env.AWS_USER}@${process.env.AWS_PRODUCTION_HOST}:${process.env.AWS_DEST}` );
    child_process.execSync( `ssh ${process.env.AWS_USER}@${process.env.AWS_PRODUCTION_HOST} 'cd ${process.env.AWS_DEST}server/ ; echo ${Date.now()} > clutch.timestap ; sudo npm run install:staging'` );
}
