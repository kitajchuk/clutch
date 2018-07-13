const config = require( "../clutch.config" );
const router = require( "./core/router" );
const path = require( "path" );
const fs = require( "fs" );



// :type, :handlers
router.on( "authorizations", {
    query ( client, api, query, cache, req ) {
        // Must return either {query} OR Promise.
        // Promise must resolve with {results: [...]} or reject with "error"
        return new Promise(( resolve, reject ) => {
            resolve({
                results: config.authorizations.apps.map(( app ) => {
                    const authFile = path.join( __dirname, `../sandbox/authorizations/${app}.auth.json` );

                    return {
                        authorized: fs.existsSync( authFile ),
                        app
                    };
                })
            });
        });
    }
});



router.init();
