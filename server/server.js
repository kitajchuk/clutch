/**
 *
 * Clientside Express application server.
 *
 * https://prismic.io/docs#?lang=javascript
 *
 */
const path = require( "path" );
const prismic = require( "prismic.io" );
const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const consolidate = require( "consolidate" );
const expressPort = 8000;
const apiAccess = "[PRISMIC_API_ENDPOINT]";
const layout = path.join( __dirname, "../template/index.html" );
const partials = path.join( __dirname, "../template", "partials" );
const cache = {};



/**
 *
 * Mustache adapter for templating.
 *
 */
consolidate.requires.ejs = require( "ejs" );



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
        prismic.api( apiAccess, undefined ).then(function ( api ) {
            var query = [prismic.Predicates.at( "document.type", type )];

            // Custom querying can be done here...

            // How to use an `active` field for querying
            // query.push( prismic.Predicates.has( "my.[type].active" ) );

            // How to use an `order` field for ordering
            // query.push( prismic.Predicates.orderings( "my.[type].order" ) );

            api.query( query ).then(function ( json ) {
                resolve( json.results );

            }).catch(function ( error ) {
                reject( error );
            });
        });
    });
};



/**
 *
 * Handle site loading.
 *
 */
const getSite = function ( req, res ) {
    const page = (req.params.uid ? "root" : req.params.path || "root");

    getData( "site" ).then(function ( json ) {
        const data = {
            site: json[ 0 ],
            stylesheet: (isProduction() ? "/css/screen.min.css" : "/css/screen.css"),
            javascript: (isProduction() ? "/js/app.min.js" : "/js/app.js")
        };

        // Maintain an updated global `site` reference
        cache.site = data.site;

        consolidate.ejs( layout, data )
            .then(function ( html ) {
                res.send( html );
            })
            .catch(function ( error ) {
                console.log( "Consolidate", error );
            });
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
        const jsonData = { site: cache.site, data: data };

        consolidate.ejs( path.join( partials, `${template}.html` ), jsonData )
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
 * Normalized API endpoints return data as
 *
 * { document: {object}, documents: [array] }
 *
 */
expressApp.get( "/api/:type", function ( req, res ) {
    getData( req.params.type ).then(function ( json ) {
        const data = json.length > 1 ? { documents: json } : { document: json[ 0 ] };

        if ( req.query.format === "html" ) {
            getPartial( req.params, req.query, data ).then(function ( html ) {
                res.send( html );
            });

        } else {
            res.json( data );
        }
    });
});
expressApp.get( "/api/:type/:uid", function ( req, res ) {
    getData( req.params.type ).then(function ( json ) {
        const data = {
            document: json.find(function ( document ) {
                return (document.uid === req.params.uid);
            }),
            documents: json
        };

        if ( req.query.format === "html" ) {
            getPartial( req.params, req.query, data ).then(function ( html ) {
                res.send( html );
            });

        } else {
            res.json( data );
        }
    });
});
expressApp.get( "/", getSite );
expressApp.get( "/:path", getSite );
expressApp.get( "/:path/:uid", getSite );
expressApp.post( "/updates", function ( req, res ) {
    //if ( req.body.releases.deletion ) {
        //restart server...?
    //}
});



/**
 *
 * Open Express on proper port.
 *
 */
expressApp.listen( expressPort );



/**
 *
 * Log active server to console.
 *
 */
console.log( ("This is running on port " + expressPort) );
