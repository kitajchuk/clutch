const config = require( "./core/config" );
const router = require( "./router" );



// :req, :type, :uid, :callback
router.on( "page", "example", null, ( client, query, req ) => {
    console.log( config.logger, "Example page pubsub" );

    // MUST return {query} for final client data fetch
    return query;
});

// :req, :type, :uid, :callback
router.on( "api", "page", null, ( client, query, req ) => {
    console.log( config.logger, "Example api pubsub" );

    // MUST return {query} for final client data fetch
    return query;
});



router.init();
