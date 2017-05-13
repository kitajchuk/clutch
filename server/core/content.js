const path = require( "path" );
const core = {
    watch: require( "./watch" ),
    query: require( "./query" ),
    config: require( "./config" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        const page = (req.params.type ? req.params.type : core.config.homepage);
        const context = new ContextObject( page );
        const check = function ( data ) {
            context.set({
                site: core.query.cache.site,
                navi: core.query.cache.navi
            });

            // 0.0 => Missing template file
            // 0.1 => Single ContentItem
            // 0.2 => Multiple ContentItems(s)
            if ( core.watch.cache.pages.indexOf( `${page}.html` ) === -1 ) {
                const file = path.join( core.config.template.pagesDir, `${page}.html` );

                fail( `The template file for this path is missing at "${file}".` );

            } else if ( data.item ) {
                context.set( "item", data.item );

            } else if ( data.items ) {
                context.set( "items", data.items );
            }

            // context?
            if ( listener && listener.handlers.context ) {
                context = listener.handlers.context( context, core.query.cache, req );
            }

            done();
        };
        const fail = function ( error ) {
            context.set({
                navi: core.query.cache.navi,
                site: core.query.cache.site,
                page: core.config.notfound,
                error: error
            });

            done();
        };
        const done = function () {
            resolve(( callback ) => {
                render( callback );
            });
        };
        const render = function ( callback ) {
            const localObject = {
                context: context
            };

            core.template.render( core.config.template.layout, localObject ).then(( html ) => {
                callback( (context.page === core.config.notfound ? 404 : 200), html );

            }).catch(( error ) => {
                console.log( core.config.logger, error );
            });
        };

        core.query.getPage( req, res, listener ).then( check ).catch( fail );
    });
};


module.exports = {
    getPage
};
