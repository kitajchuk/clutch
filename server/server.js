/**
 *
 * Clientside Express application server.
 *
 * https://prismic.io/docs#?lang=javascript
 *
 */
const fs = require( "fs" );
const path = require( "path" );
const prismic = require( "prismic.io" );
const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const consolidate = require( "consolidate" );
const expressPort = 8000;
const apiAccess = "https://kitajchuk-template-prismic.cdn.prismic.io/api";
const apiToken = null;
const layout = path.join( __dirname, "../template/index.html" );
const pagesDir = path.join( __dirname, "../template", "pages" );
const partialsDir = path.join( __dirname, "../template", "partials" );
const timestamp = Date.now();
const cache = {};
const tpl = {
    "module": "ejs",
    "require": require( "ejs" )
};



/**
 *
 * Mustache adapter for templating.
 *
 */
consolidate.requires[ tpl.module ] = tpl.require;



/**
 *
 * Determine production environment.
 *
 */
const isProduction = function () {
    return (process.env.NODE_ENV === "production");
};



/**
 *
 * Get data from Prismic.
 *
 */
const getData = function ( type ) {
    return new Promise(function ( resolve, reject ) {
        prismic.api( apiAccess, apiToken ).then(function ( api ) {
            const query = [];
            const done = function ( json ) {
                if ( !json.results.length ) {
                    reject( `The page template for "${type}" exists but Prismic has no data for it.` );

                } else {
                    resolve( json.results );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };

            // Custom querying can be done here...

            // Example use of `active` field for querying
            // api.query( [prismic.Predicates.has( `my.${type}.active` )] )

            // Example use of `order` field for ordering
            // api.orderings( `[my.${type}.order]` )

            // Prismic Collections
            if ( api.data.forms[ type ] ) {
                api.form( type )
                    .ref( api.master() )
                    .submit()
                    .then( done )
                    .catch( fail );

            // Prismic Custom Types
            } else {
                query.push( prismic.Predicates.at( "document.type", type ) );

                api.form( "everything" )
                    .ref( api.master() )
                    .query( query )
                    .submit()
                    .then( done )
                    .catch( fail );
            }
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
        timestamp: timestamp,
        document: null,
        documents: null,
        stylesheet: (isProduction() ? "/css/screen.min.css" : "/css/screen.css"),
        javascript: (isProduction() ? "/js/app.min.js" : "/js/app.js")
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
        consolidate[ tpl.module ]( layout, json )
            .then(function ( html ) {
                res.send( html );
            })
            .catch(function ( error ) {
                console.log( "Consolidate", error );
            });
    };

    getData( "site" ).then(function ( json ) {
        // New Site reference each time
        cache.site = json[ 0 ];

        // Apply Site reference for template data
        data.site = cache.site;

        // Check for template file, handle missing file as 404
        if ( cache.files.indexOf( `${page}.html` ) === -1 ) {
            fail( `The template file for this path is missing at "templates/pages/${page}.html".` );

        // Check for :path so we get can query for Prismic data
        } else if ( req.params.path ) {
            getData( req.params.path )
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

        consolidate[ tpl.module ]( path.join( partialsDir, `${template}.html` ), jsonData )
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
    getData( req.params.type, req.params.uid ).then(function ( json ) {
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
 * Configure Express.
 *
 */
 expressApp.use( compression({
     threshold: 0
 }));
 expressApp.use( express.static( path.join( __dirname, "../static" ), {
     // One day
     maxAge: 86400000
 }));



/**
 *
 * Configure Express Routes.
 *
 */
expressApp.get( "/api/:type", getApi );
expressApp.get( "/api/:type/:uid", getApi );
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
 * Open Express on proper port.
 *
 */
fs.readdir( pagesDir, function ( error, files ) {
    cache.files = files;

    expressApp.listen( expressPort );

    console.log( `Express server started` );
});
