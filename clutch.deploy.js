// You put your values in .clutch/config.json
// Netlify / CircleCI environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
const child_process = require( "child_process" );
const lager = require( "properjs-lager" );
const s3 = require( "s3" );
const router = require( "./server/core/router" );
const config = require( "./clutch.config" );
const stasis = require( "./server/generators/static" );



// Use the node.js app to generate our static build
router.init().then(() => {
    stasis.generate( config ).then(() => {
        // Fallback to `dev` since that should be the first env established in the workflow
        const bucket = config.aws.buckets[ process.env.NODE_ENV ] || config.aws.buckets.dev;
        const region = config.aws.region;
        const directory = "static";
        const doGzip = false;

        const client = s3.createClient({
            s3Options: {
                region,
            }
        });
        const uploader = client.uploadDir({
            localDir: directory,
            deleteRemoved: true,
            s3Params: {
                Bucket: bucket,
                ACL: "public-read"
            },
            getS3Params: ( localFile, stat, callback ) => {
                let s3Params = {};
                let s3Error = null;
                const fileName = localFile.split( "/" ).pop();
                const isGzip = /\.js$|\.css$/.test( localFile );
                const isDot = /^\./.test( fileName );

                // Skip dot files...
                if ( isDot ) {
                    s3Params = null;

                // Only gzip .js and .css files if specified to do so...
                } else if ( isGzip && doGzip ) {
                    s3Params.ContentEncoding = "gzip";
                    s3Params.Metadata = {
                        "Content-Encoding": "gzip"
                    };
                }

                callback( s3Error, s3Params );
            }
        });

        uploader.on( "error", ( error ) => {
            lager.error( "S3 Upload Error", error );

            process.exit( 0 );
        });

        uploader.on( "progress", () => {
            lager.info( "S3 Upload Progress", uploader.progressAmount, uploader.progressTotal );
        });

        uploader.on( "end", () => {
            lager.cache( "S3 Upload Done!" );

            stasis.clean( config ).then(() => {
                lager.cache( "[Clutch] Static files have been cleaned." );
                process.exit( 0 );
            });
        });
    });
});
