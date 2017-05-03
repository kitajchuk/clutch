const fs = require( "fs" );
const config = require( "../config" );
const watch = require( "node-watch" );
const cache = {};



/**
 *
 * Fresh look at the `template/pages dir`.
 *
 */
const getPages = function () {
    return new Promise(( resolve, reject ) => {
        fs.readdir( config.template.pagesDir, ( error, files ) => {
            cache.pages = files;

            if ( error ) {
                reject( error );

            } else {
                resolve( files );
            }
        });
    });
};



/**
 *
 * Watch the `template` dir to update `cache.pages`.
 *
 */
const startWatch = function () {
    watch( config.template.dir, { recursive: true, filter: /\.html$/ }, ( event, filename ) => {
        getPages().then(( files ) => {
            console.log( config.logger, `Updated pages list`, JSON.stringify( files, null, 4 ) );
        });
    });
};



module.exports = {
    cache,
    getPages,
    startWatch
};
