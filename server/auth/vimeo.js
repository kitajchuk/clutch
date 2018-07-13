const crypto = require( "crypto" );
const path = require( "path" );
const request = require( "request-promise" );
const core = {
    files: require( "../core/files" ),
    config: require( "../../clutch.config" )
};
const authorization = {
    config: require( "../../sandbox/authorizations/vimeo.config" ),
    store: path.join( __dirname, "../../sandbox/authorizations/vimeo.auth.json" ),
    cache: path.join( __dirname, "../../static/vimeo/" )
};



const getVimeoState = () => {
    return crypto.createHmac( "sha256", authorization.config.state ).update( authorization.config.redirectUrl ).digest( "hex" );
};
const getVimeoBuff = () => {
    return Buffer.from( `${authorization.config.clientId}:${authorization.config.clientSecret}` ).toString( "base64" );
};
const getVimeoAuth = ( req, res ) => {
    // 0.1 Authorization
    if ( !req.query.code ) {
        // https://developer.vimeo.com/api/authentication#authentication-workflow
        res.redirect( `https://api.vimeo.com/oauth/authorize?client_id=${authorization.config.clientId}&response_type=code&redirect_uri=${authorization.config.redirectUrl}&state=${getVimeoState()}&scope=${authorization.config.scope}` );

    // 0.2 Token Request
    } else if ( req.query.code ) {
        if ( req.query.state !== getVimeoState() ) {
            res.redirect( `/authorizations/vimeo/?token=${core.config.authorizations.token}` );

        } else {
            request({
                url: "https://api.vimeo.com/oauth/access_token",
                json: true,
                method: "POST",
                form: {
                    code: req.query.code,
                    grant_type: "authorization_code",
                    redirect_uri: authorization.config.redirectUrl
                },
                headers: {
                    "Authorization": `basic ${getVimeoBuff()}`
                }

            }).then(( json ) => {
                core.files.write( authorization.store, json, true );

                res.redirect( `/authorizations/?token=${core.config.authorizations.token}` );
            });
        }
    }
};
const getVimeoVideo = ( req, res ) => {
    const vimeoJson = path.join( authorization.cache, `${req.params.videoId}.json` );

    core.files.read( vimeoJson, false ).then(( json ) => {
        res.status( 200 ).json( json );

        // lager.cache( `Loaded vimeo JSON [${req.params.videoId}] from cache` );
    })
    .catch(() => {
        const oauthJson = core.files.read( authorization.store, true );

        request({
            // Query with Vimeo JSON Filters to reduce payload sizes
            // https://developer.vimeo.com/api/common-formats#json-filter
            url: `https://api.vimeo.com/videos/${req.params.videoId}?fields=files,pictures`,
            json: true,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${oauthJson.access_token}`
            }

        }).then(( json ) => {
            res.status( 200 ).json( json );

            core.files.write( vimeoJson, json, false ).then(() => {
                // lager.cache( `Saved vimeo JSON [${req.params.videoId}]` );
            });
        });
    });
};



module.exports = {
    init ( expressApp ) {
        expressApp.get( "/vimeo/:videoId", getVimeoVideo );
    },


    auth ( req, res ) {
        getVimeoAuth( req, res );
    }
};
