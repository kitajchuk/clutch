const fs = require( "fs" );
const path = require( "path" );
const lager = require( "properjs-lager" );
const request = require( "request" );
const progress = require( "request-progress" );
const child_process = require( "child_process" );
const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
};
const version = "1.0.0";
const zipFile = path.join( process.cwd(), "properjsapp.zip" );
const outPath = path.join( process.cwd(), "app-master" );
const destPath = path.join( process.cwd(), "source" );
const releaseUrl = "https://github.com/ProperJS/app/archive/master.zip";
const downloadDelay = 500;



lager.info( `Clutch: Downloading ProperJS/app...` );

progress( request.get( releaseUrl, { headers } ) )
    .on( "progress", ( state ) => {
        lager.info( state.percent );
    })
    .on( "error", ( error ) => {
        lager.error( `Clutch: ${error}` );
    })
    .on( "end", () => {
        lager.info( `Clutch: Unpacking ProperJS/app...` );

        setTimeout(() => {
            const unzip = child_process.spawn( "unzip", [zipFile] );

            unzip.on( "close", () => {
                lager.cache( `Clutch: Unpacked ProperJS/app!` );

                lager.info( `Clutch: Moving ProperJS/app files...` );
                    child_process.execSync( `mv ${outPath}/source ${destPath}` );

                lager.info( `Clutch: Cleaning up temp files...` );
                    child_process.execSync( `rm -rf ${zipFile}` );
                    child_process.execSync( `rm -rf ${outPath}` );
            });

            unzip.stdout.on( "data", ( data ) => {
                lager.info( `Clutch: unzip.stdout: ${data}` );
            });

            unzip.stderr.on( "data", ( data ) => {
                lager.warn( `Clutch: unzip.stderr: ${data}` );
            });

        }, downloadDelay );
    })
    .pipe( fs.createWriteStream( zipFile ) );
