const config = require( "../clutch.config" );
const router = require( "./core/router" );



// :type, :handlers
router.on( "example", {
    query ( client, api, query, cache, req ) {
        // Must return either {query} OR Promise.
        // Promise must resolve with {results: [...]} or reject with "error"
        // return new Promise(( resolve, reject ) => {
        //     resolve({
        //         results: []
        //     });
        // });
        return query;
    },
    context ( context, cache, req ) {
        // Must return context. You can add to the context...
        // context.set( "foo", "bar" );
        return context;
    }
});



router.init();
