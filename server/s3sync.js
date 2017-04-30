const s3 = require( "s3" );
const cli = require( "cli" );
const path = require( "path" );



const doSync = function ( key, secret, region, bucket ) {
    const dir = path.join( __dirname, "../static" );
    const client = s3.createClient({
        s3Options: {
            accessKeyId: key,
            secretAccessKey: secret,
            region: region
        }
    });
    const uploader = client.uploadDir({
        localDir: dir,
        deleteRemoved: true,
        s3Params: {
            Bucket: bucket,
            Prefix: "static",
            ACL: "public-read",
            Metadata: {
                "Content-Encoding": "gzip"
            },
            ContentEncoding: "gzip"
        }
    });

    uploader.on( "error", function ( error ) {
        console.log( error );
    });

    uploader.on( "progress", function () {
        console.log( "progress", uploader.progressAmount, uploader.progressTotal );
    });

    uploader.on( "end", function () {
        console.log( "done" );
    });
};



cli.setApp( "s3sync", "0.1.0" );



cli.parse({
    key: ["key", "The AWS access key id ( IAM ).", "string", ""],
    secret: ["secret", "The AWS secret access key ( IAM ).", "string", ""],
    region: ["region", "The AWS region, like us-west-2.", "string", ""],
    bucket: ["bucket", "The AWS s3 bucket name to sync with.", "string", ""]
});



if ( cli.options.key && cli.options.secret && cli.options.region && cli.options.bucket ) {
    doSync( cli.options.key, cli.options.secret, cli.options.region, cli.options.bucket );

} else {
    console.log( "Requires AWS IAM access key id and secret access id." );

    process.exit( 1 );
}
