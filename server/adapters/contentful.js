"use strict";



/**
 *
 * Adapter for Contentful
 * https://www.contentful.com
 *
 * Every adapter must have a common, public `cache` object:
 * cache: Object { api: Object, site: Object, navi: Object }
 *
 * Every adapter must have common, public `ORM` functions:
 * getApi: Function
 * getPage: Function
 * getPreview: Function
 *
 * Every adapter must have common, private `ORM` functions:
 * getSite: Function
 * getNavi: Function
 * getPartial: Function
 * getDataForApi: Function
 * getDataForPage: Function
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const path = require( "path" );
const contentful = require( "contentful" );
const cache = {
    api: null,
    site: null,
    navi: null
};
const core = {
    watch: require( "../core/watch" ),
    config: require( "../../clutch.config" ),
    template: require( "../core/template" )
};
const ContextObject = require( "../class/ContextObject" );
const previewCookie = "io.contentful.preview";
const previewHost = "preview.contentful.com";
const cdnHost = "cdn.contentful.com";



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        getDataForApi( req, listener ).then(( json ) => {
            const data = {};

            // Single entry for /:type/:uid
            if ( req.params.uid ) {
                data.entry = getEntry( req.params.uid, json );

            // All entries for /:type
            } else {
                data.entries = json;
            }

            // Render partial for ?format=html&template=foo
            if ( req.query.format === "html" ) {
                getPartial( req, data, listener ).then(( html ) => {
                    resolve( html );
                });

            } else {
                resolve( data );
            }

        }).catch(( error ) => {
            // Resolve error as JSON result
            resolve( error );
        });
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        getDataForPage( req, listener ).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            reject( error );
        });
    });
};



/**
 *
 * Handle preview URLs for draft content.
 *
 */
const getPreview = function ( req, res ) {
    return new Promise(( resolve, reject ) => {
        const contentType = req.query.type;
        const contentUID = req.query.uid;

         res.cookie( previewCookie, core.config.api.preview, {
             maxAge: 60 * 30 * 1000,
             path: "/",
             httpOnly: false
         });

         resolve( `/${contentType}/${contentUID}/` );
    });
};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( req, data, listener ) {
    return new Promise(( resolve, reject ) => {
        const partial = (req.query.template || req.params.type);
        const localObject = {
            context: new ContextObject( partial )
        };
        const template = path.join( core.config.template.partialsDir, `${partial}.html` );

        if ( data.entry ) {
            localObject.context.set( "item", data.entry );
        }

        if ( data.entries ) {
            localObject.context.set( "items", data.entries );
        }

        // context?
        if ( listener && listener.handlers.context ) {
            localObject.context = listener.handlers.context( localObject.context, cache, req );
        }

        core.template.render( template, localObject )
            .then(( html ) => {
                resolve( html );
            })
            .catch(( error ) => {
                reject( error );
            });
    });
};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = function ( req ) {
    return new Promise(( resolve, reject ) => {
        const api = getClient( req );

        api.getEntries( { content_type: "site" } ).then(( response ) => {
            const navi = {
                items: []
            };
            const site = {
                data: {}
            };

            // Normalize site context
            for ( let i in response.items[ 0 ].fields ) {
                if ( i !== "navi" ) {
                    site.data[ i ] = typeof response.items[ 0 ].fields[ i ] === "object" ? response.items[ 0 ].fields[ i ].fields.file.url : response.items[ 0 ].fields[ i ];
                }
            }

            // Normalize navi context
            response.items[ 0 ].fields.navi.forEach(( page ) => {
                const id = page.sys.id;
                const uid = page.fields.uid;
                const type = "page";
                const slug = page.fields.uid;
                const style = "primary";
                const title = page.fields.title;

                navi.items.push({
                    id: id,
                    uid: (slug === core.config.homepage ? slug : uid),
                    type: type,
                    slug: (slug === core.config.homepage ? "/" : `/${slug}/`),
                    title: title,
                    style: style
                });
            });

            cache.api = api;
            cache.site = site;
            cache.navi = navi;

            resolve();
        });
    });
};



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = function ( type ) {
    let ret = false;

    cache.navi.items.forEach(( item ) => {
        if ( item.uid === type ) {
            ret = item;
        }
    });

    return ret;
};



/**
 *
 * Load data for API response. Resolve RAW from Service.
 *
 */
const getDataForApi = function ( req, listener ) {
    return new Promise(( resolve, reject ) => {
        const api = getClient( req );
        const doQuery = function ( type ) {
            const done = function ( response ) {
                resolve( response.items );
            };
            const fail = function ( error ) {
                resolve({
                    error: error
                });
            };
            let query = {};

            // query: type?
            query.content_type = type;

            // query: pubsub?
            if ( listener && listener.handlers.query ) {
                query = listener.handlers.query( contentful, api, query, cache, req );
            }

            // query: promise?
            if ( query instanceof Promise ) {
                query.then( done ).catch( fail );

            } else {
                // submit
                api.getEntries( query ).then( done ).catch( fail );
            }
        };

        doQuery( req.params.type );
    });
};



/**
 *
 * Load data for Page response.
 *
 */
const getDataForPage = function ( req, listener ) {
    return new Promise(( resolve, reject ) => {
        const data = {
            item: null,
            items: null
        };
        const doQuery = function ( type ) {
            const done = function ( response ) {
                if ( !response.items.length ) {
                    // Static page with no CMS data attached to it...
                    if ( core.watch.cache.pages.indexOf( `${type}.html` ) !== -1 ) {
                        resolve( data );

                    } else {
                        reject( `Contentful has no data for the content-type "${type}".` );
                    }

                } else {
                    // all
                    data.items = response.items;

                    // uid
                    if ( req.params.uid || navi ) {
                        data.item = getEntry( (navi ? navi.uid : req.params.uid), response.items );

                        if ( !data.item ) {
                            reject( `The entry with UID "${navi ? navi.uid : req.params.uid}" could not be found by Contentful.` );
                        }
                    }

                    resolve( data );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };
            const navi = getNavi( type );
            let query = {};

            // query: type?
            if ( navi ) {
                query.content_type = navi.type;

            } else {
                query.content_type = type;
            }

            // query: pubsub?
            if ( listener && listener.handlers.query ) {
                query = listener.handlers.query( contentful, cache.api, query, cache, req );
            }

            // query: promise?
            if ( query instanceof Promise ) {
                query.then( done ).catch( fail );

            } else {
                // submit
                cache.api.getEntries( query ).then( done ).catch( fail );
            }
        };

        getSite( req ).then(() => {
            const type = req.params.type;

            if ( !type ) {
                resolve( data );

            } else {
                doQuery( type );
            }
        });
    });
};



/**
 *
 * Get one entry from all entries.
 *
 */
const getEntry = function ( uid, entries ) {
    return entries.find(( entry ) => {
        return (entry.fields.uid === uid);
    });
};



/**
 *
 * Get valid `token` for Contentful API data ( handles previews ).
 *
 */
const getToken = function ( req ) {
    let token = core.config.api.token;

    if ( req && req.cookies && req.cookies[ previewCookie ] ) {
        token = core.config.api.preview;
    }

    return token;
};



/**
 *
 * Get valid `host` for Contentful API data ( handles previews ).
 *
 */
const getHost = function ( req ) {
    let host = cdnHost;

    if ( req && req.cookies && req.cookies[ previewCookie ] ) {
        host = previewHost;
    }

    return host;
};



/**
 *
 * Get the client ( handles previews ).
 *
 */
const getClient = function ( req ) {
    return contentful.createClient({
        space: core.config.api.access,
        accessToken: getToken( req ),
        host: getHost( req )
    });
};



module.exports = {
    cache,
    getApi,
    getPage,
    getPreview
};
