"use strict";



/**
 *
 * Clientside Express application server.
 *
 * https://prismic.io/docs#?lang=javascript
 *
 */
const fs = require( "fs" );
const path = require( "path" );
const config = require( "./config" );
const prismic = require( "prismic.io" );
const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const consolidate = require( "consolidate" );
const cookieParser = require( "cookie-parser" );
const cache = {};



/**
 *
 * Mustache adapter for templating.
 *
 */
consolidate.requires[ config.template.module ] = config.template.require;



/**
 *
 * Get valid `ref` for Prismic API data.
 *
 */
const getRef = function ( req, api ) {
    let ref = api.master();

    if ( req && req.cookies && req.cookies[ prismic.previewCookie ] ) {
        ref = req.cookies[ prismic.previewCookie ];
    }

    return ref;
};



/**
 *
 * Get data from Prismic.
 *
 */
const getData = function ( type, req ) {
    return new Promise(function ( resolve, reject ) {
        prismic.api( config.apiAccess, null ).then(function ( api ) {
            const query = [];
            const done = function ( json ) {
                // Question:
                // A `single` type should return a pure `result` {object}
                // A `repeatable` type should return a `results` [array]
                if ( !json.results.length ) {
                    reject( `The page template for "${type}" exists but Prismic has no data for it.` );

                } else {
                    resolve( json.results );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };

            // form
            const form = api.form( (api.data.forms[ type ] ? type : "everything") );

            // ref
            form.ref( getRef( req, api ) );

            if ( !api.data.forms[ type ] ) {
                query.push( prismic.Predicates.at( "document.type", type ) );
            }

            // Custom querying can be done here...
            // Example use of `active` field for querying
            // if ( type === "${sometype}" ) {
            //     query.push( prismic.Predicates.has( `my.${type}.active` ) );
            // }

            // query
            if ( query.length ) {
                form.query( query );
            }

            // Custom ordering can be done here...
            // Example use of `order` field for ordering
            // if ( type === "${sometype}" ) {
            //     form.orderings( `[my.${type}.order]` );
            // }

            // submit
            form.submit().then( done ).catch( fail );
        });
    });
};



/**
 *
 * Handle preview URLs from Prismic for draft content.
 *
 */
const getPreview = function ( req, res ) {
    const previewToken = req.query.token;
    const linkResolver = function ( doc ) {
        return `/${doc.type}/${doc.uid}/`;
    };

    prismic.api( config.apiAccess, null ).then(function ( api ) {
        api.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
            res.cookie( prismic.previewCookie, previewToken, {
                maxAge: 60 * 30 * 1000,
                path: "/",
                httpOnly: false
            });

            res.redirect( redirectUrl );
        });
    });
};



/**
 *
 * Handle site loading.
 *
 */
const getSite = function ( req, res ) {
    const page = (req.params.path ? req.params.path : "home");
    const data = {
        site: null,
        page: page,
        error: null,
        template: `pages/${page}.html`,
        timestamp: config.timestamp,
        document: null,
        documents: null,
        stylesheet: config.static.css,
        javascript: config.static.js
    };
    const check = function ( json ) {
        // All documents for /:type
        if ( json.length > 1 ) {
            data.documents = json;
        }

        // Single document for /:type/:uid
        if ( req.params.uid ) {
            data.document = json.find(function ( document ) {
                return (document.uid === req.params.uid);
            });

            // The :uid is invalid
            if ( !data.document ) {
                fail( `The document with UID "${req.params.uid}" could not be found by Prismic.` );

            // Resolve document
            } else {
                done();
            }

        // Resolve documents
        } else {
            done();
        }
    };
    const done = function () {
        render( data );
    };
    const fail = function ( error ) {
        data.page = "404";
        data.error = error;
        data.template = "pages/404.html";

        render( data );
    };
    const render = function ( json ) {
        consolidate[ config.template.module ]( config.template.layout, json )
            .then(function ( html ) {
                res.send( html );
            })
            .catch(function ( error ) {
                console.log( config.logger, error );
            });
    };

    getData( "site", req ).then(function ( json ) {
        // New Site reference each time
        cache.site = json[ 0 ];

        // Apply Site reference for template data
        data.site = cache.site;

        // Check for template file, handle missing file as 404
        if ( cache.files.indexOf( `${page}.html` ) === -1 ) {
            fail( `The template file for this path is missing at "templates/pages/${page}.html".` );

        // Check for :path so we get can query for Prismic data
        } else if ( req.params.path ) {
            getData( req.params.path, req )
                .then( check )
                .catch( fail );

        // Resolve homepage
        } else {
            done();
        }
    });
};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( params, query, data ) {
    return new Promise(function ( resolve, reject ) {
        const template = (query.template || params.type);
        const jsonData = { site: cache.site };

        if ( data.document ) {
            jsonData.document = data.document;
        }

        if ( data.documents ) {
            jsonData.documents = data.documents;
        }

        consolidate[ config.template.module ]( path.join( config.template.partialsDir, `${template}.html` ), jsonData )
            .then(function ( html ) {
                resolve( html );
            })
            .catch(function ( error ) {
                reject( error );
            });
    });
};



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res ) {
    getData( req.params.type, req ).then(function ( json ) {
        const data = json.length > 1 ? { documents: json } : { document: json[ 0 ] };

        if ( req.query.format === "html" ) {
            getPartial( req.params, req.query, data ).then(function ( html ) {
                res.send( html );
            });

        } else {
            res.json( data );
        }
    });
};



/**
 *
 * Fresh look at the `template/pages dir`.
 *
 */
const readPages = function () {
    return new Promise(( resolve, reject ) => {
        fs.readdir( config.template.pagesDir, function ( error, files ) {
            cache.files = files;

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
 * Configure Express.
 *
 */
expressApp.use( cookieParser() );
expressApp.use( compression( config.compression ) );
expressApp.use(express.static( config.template.staticDir, {
    maxAge: config.static.maxAge
}));



/**
 *
 * Configure Express Routes.
 *
 */
expressApp.get( "/api/:type", getApi );
expressApp.get( "/api/:type/:uid", getApi );
expressApp.get( "/preview", getPreview );
expressApp.get( "/", getSite );
expressApp.get( "/:path", getSite );
expressApp.get( "/:path/:uid", getSite );
// Prismic webhooks can be used if necessary...
// expressApp.post( "/updates", function ( req, res ) {
//     if ( req.body.releases.deletion ) {
//         restart server...?
//     }
// });



/**
 *
 * Start the Express {app}.
 *
 */
readPages().then(() => {
    expressApp.listen( config.port );

    console.log( config.logger, `Express server started` );
    console.log( config.logger, `Access URL — http://localhost:${config.port}` );
});



/**
 *
 * Watch the `template` dir to update `cache.files`.
 *
 */
fs.watch( config.template.dir, ( event, filename ) => {
    readPages().then(( files ) => {
        console.log( config.logger, `Updated pages list`, JSON.stringify( files, null, 4 ) );
    });
});
