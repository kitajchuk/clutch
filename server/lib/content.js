const config = require( "../config" );
const lib = {
    watch: require( "./watch" ),
    query: require( "./query" ),
    template: require( "./template" )
};



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res ) {
    const page = (req.params.path ? req.params.path : "home");
    const data = {
        site: null,
        page: page,
        cache: config.env.production,
        error: null,
        template: `pages/${page}.html`,
        timestamp: config.timestamp,
        document: null,
        documents: null,
        stylesheet: config.static.css,
        javascript: config.static.js
    };
    const check = function ( json ) {
        data.site = lib.query.cache.site;

        // 0.0 => Template file does not exist
        // 0.1 => Single document for /:type => /page/:type
        // 0.2 => Single document for /:type/:uid
        // 0.3 => All documents for /:type
        // 0.4 => Resolve documents
        if ( lib.watch.cache.pages.indexOf( `${page}.html` ) === -1 ) {
            fail( `The template file for this path is missing at "templates/pages/${page}.html".` );

        } else if ( json.length === 1 && json[ 0 ].type === "page" ) {
            data.document = json[ 0 ];

            done();

        } else if ( req.params.uid ) {
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

        } else if ( json.length > 1 ) {
            data.documents = json;

            done();

        } else {
            done();
        }
    };
    const fail = function ( error ) {
        data.site = lib.query.cache.site;
        data.page = "404";
        data.error = error;
        data.template = "pages/404.html";

        render( data );
    };
    const done = function () {
        render( data );
    };
    const render = function ( json ) {
        lib.template.render( config.template.layout, json )
            .then(( html ) => {
                res.send( html );
            })
            .catch(( error ) => {
                console.log( config.logger, error );
            });
    };

    lib.query.getPage( req ).then( check ).catch( fail );
};


module.exports = {
    getPage
};
