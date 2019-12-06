"use strict";



/**
 *
 * Static site generator for Prismic
 *
 * Every generator must have a common `generate` method
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const path = require( "path" );
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const fs = require( "fs" );
const request = require( "request-promise" );
const xml2js = require( "xml2js" );
const htmlMin = require( "html-minifier" );
const files = require( "../core/files" );
const baseUrl = `http://localhost:${config.express.port}`;
const baseUrlBrowserSync = `http://localhost:${config.browser.port}`;
const saveLoc = config.template.staticDir;
let buildConfig = null;


// Save a rendered template file
const saveFile = ( obj ) => {
    return new Promise(( resolve, reject ) => {
        let regex = new RegExp( `^${buildConfig.url}\/{0,1}|\/$`, "g" );
        let place = saveLoc;
        let slug = obj.url.loc[ 0 ].replace( regex, "" );
        const uris = slug ? slug.split( "/" ) : [];

        uris.forEach(( uri ) => {
            place = `${place}/${uri}`;

            if ( !fs.existsSync( place ) ) {
                fs.mkdirSync( place );

                lager.cache( `[Clutch] Linking static link ${place}` );
            }
        });

        place = `${place}/index.html`;
        regex = new RegExp( baseUrlBrowserSync, "gm" );

        obj.html = String( obj.html ).replace( regex, buildConfig.env.sandbox ? "" : buildConfig.url );

        if ( buildConfig.env.production ) {
            obj.html = htmlMin.minify( obj.html, {
                caseSensitive: true,
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                keepClosingSlash: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeEmptyElements: true,
                removeRedundantAttributes: true
            });
        }

        files.writeStr( place, obj.html ).then(() => {
            lager.cache( `[Clutch] Linking static link ${place}` );

            resolve();

        }).catch( reject );
    });
};



// Clean, or DELETE, static HTML files
const cleanStatic = ( json ) => {
    return new Promise(( resolve, reject ) => {
        json.urlset.url.forEach(( url ) => {
            let regex = new RegExp( `^${buildConfig.url}\/{0,1}|\/$`, "g" );
            let slug = url.loc[ 0 ].replace( regex, "" );
                slug = slug ? `${slug}/index.html` : "index.html";
            const uris = slug.split( "/" );
            const unlinkF = () => {
                const link = `${saveLoc}/${uris.join( "/" )}`;

                if ( fs.existsSync( link ) ) {
                    regex = /\.html$/;

                    if ( regex.test( link ) ) {
                        fs.unlinkSync( link );

                    } else {
                        fs.rmdirSync( link );
                    }

                    lager.error( `[Clutch] Un-Linking static link ${link}` );

                    uris.pop();

                    if ( uris.length ) {
                        unlinkF();

                    } else {
                        resolve();
                    }
                }
            };

            unlinkF();
        });

        resolve();
    });
};



// Request a sitemap location
const requestLoc = ( url ) => {
    return new Promise(( resolve, reject ) => {
        request({
            url: url.loc[ 0 ].replace( buildConfig.url, baseUrl ),
            method: "GET"

        }).then(( html ) => {
            resolve( html );

        }).catch( reject );
    });
};



// Process XML
const processXml = ( xml ) => {
    return new Promise(( resolve, reject ) => {
        xml2js.parseString( xml, ( error, result ) => {
            if ( error ) {
                reject( error );

            } else {
                resolve( result );
            }
        });
    });
};



// Query all documents
const createSite = ( options ) => {
    return new Promise(( resolve, reject ) => {
        request({
            url: `${baseUrl}/sitemap.xml`,
            method: "GET"

        }).then(( xml ) => {
            processXml( xml ).then(( json ) => {
                cleanStatic( json ).then(() => {
                    if ( options.create ) {
                        let saved = 0;

                        json.urlset.url.forEach(( url ) => {
                            requestLoc( url ).then(( html ) => {
                                saveFile( {html, url} ).then(() => {
                                    saved++;

                                    if ( saved === json.urlset.url.length ) {
                                        resolve();
                                    }

                                }).catch( reject );

                            }).catch( reject );
                        });

                    } else {
                        lager.cache( `[Clutch] Cleaned static directory of files` );
                        resolve();
                    }

                }).catch( reject );

            }).catch( reject );

        }).catch(( error ) => {
            reject( `You need to run "npm run server:static" for the app to boot.` );
        });
    });
};



module.exports = {
    generate ( conf ) {
        buildConfig = conf;

        return new Promise(( resolve, reject ) => {
            createSite( {create: true} ).then( resolve ).catch(( error ) => {
                lager.error( error );
            });
        });
    },


    clean ( conf ) {
        buildConfig = conf;

        return new Promise(( resolve, reject ) => {
            createSite( {clean: true} ).then( resolve ).catch(( error ) => {
                lager.error( error );
            });
        });
    }
};
