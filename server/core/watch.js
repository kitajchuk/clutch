const fs = require( "fs" );
const lager = require( "properjs-lager" );
const config = require( "../../clutch.config" );
const watch = require( "node-watch" );
const cache = {
    pages: null
};



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
        getPages().then(() => {
            lager.template( `Clutch template ${event} on ${filename.replace( config.template.dir, "template" )}` );
        });
    });
};



module.exports = {
    cache,
    getPages,
    startWatch
};
