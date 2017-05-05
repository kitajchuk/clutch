const config = require( "../config" );
const lib = {
    watch: require( "./watch" ),
    query: require( "./query" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res ) {
    const page = (req.params.type ? req.params.type : config.homepage);
    const context = new ContextObject( page );
    const check = function ( data ) {
        context.set({
            site: lib.query.cache.site,
            navi: lib.query.cache.navi
        });

        // 0.0 => Missing template file
        // 0.1 => Single ContentItem
        // 0.2 => Multiple ContentItems(s)
        if ( lib.watch.cache.pages.indexOf( `${page}.html` ) === -1 ) {
            const file = path.join( config.template.pagesDir, `${page}.html` );

            fail( `The template file for this path is missing at "${file}".` );

        } else if ( data.item ) {
            context.set( "item", data.item );

        } else if ( data.items ) {
            context.set( "items", data.items );
        }

        render();
    };
    const fail = function ( error ) {
        context.set({
            navi: lib.query.cache.navi,
            site: lib.query.cache.site,
            page: "404",
            error: error
        });

        render();
    };
    const render = function () {
        const localObject = {
            context: context
        };

        lib.template.render( config.template.layout, localObject )
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
