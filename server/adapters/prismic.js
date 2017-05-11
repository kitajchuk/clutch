"use strict";



/**
 *
 * Adapter for Prismic.io
 * Every adapter must have a common ORM format exposed to the scaffold:
 * cache: { site: Object, navi: Object }
 * getApi: Function
 * getPage: Function
 * getSite: Function
 * getNavi: Function
 * getPreview: Function
 * getPartial: Function
 * getWebhook: Function
 *
 * Different Headless CMS will require slightly different internal approaches
 * Whatever means necessary is A-OK as long as the data resolves to the ORM format
 *
 *
 */
const path = require( "path" );
const prismic = require( "prismic.io" );
const cache = {
    site: null,
    navi: null,
    client: null
};
const core = {
    config: require( "../core/config" ),
    template: require( "../core/template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res, handle ) {
    return new Promise(( resolve, reject ) => {
        getDataForApi( req, handle ).then(( json ) => {
            const data = {};

            // Single document for /:type/:uid
            if ( req.params.uid ) {
                data.document = getDoc( req.params.uid, json );

            // All documents for /:type
            } else {
                data.documents = json;
            }

            // Render partial for ?format=html&template=foo
            if ( req.query.format === "html" ) {
                getPartial( req.params, req.query, data ).then(( html ) => {
                    resolve( data );
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
const getPage = function ( req, res, handle ) {
    return new Promise(( resolve, reject ) => {
        getDataForPage( req, handle ).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            reject( error );
        });
    });
};



/**
 *
 * Handle preview URLs from Prismic for draft content.
 *
 */
const getPreview = function ( req, res ) {
    return new Promise(( resolve, reject ) => {
        const previewToken = req.query.token;
        const linkResolver = function ( doc ) {
            return `/${doc.type}/${doc.uid}/`;
        };

        prismic.api( core.config.api.access, null ).then(( client ) => {
            client.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
                res.cookie( prismic.previewCookie, previewToken, {
                    maxAge: 60 * 30 * 1000,
                    path: "/",
                    httpOnly: false
                });

                resolve( redirectUrl );
            });
        });
    });
};



/**
 *
 * Handle webhook POST URLs from Prismic for content changes.
 *
 */
const getWebhook = function ( req, res ) {

};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( params, query, data ) {
    return new Promise(( resolve, reject ) => {
        const partial = (query.template || params.type);
        const localObject = {
            context: new ContextObject( partial )
        };
        const template = path.join( core.config.template.partialsDir, `${partial}.html` );

        if ( data.document ) {
            localObject.context.set( "item", data.document );
        }

        if ( data.documents ) {
            localObject.context.set( "items", data.documents );
        }

        lib.template.render( template, localObject )
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
const getSite = function () {
    return new Promise(( resolve, reject ) => {
        prismic.api( core.config.api.access, null ).then(( client ) => {
            client.getSingle( "site" ).then(( document ) => {
                const navi = {
                    items: []
                };
                const site = {
                    data: {}
                };

                // Normalize site context
                for ( let i in document.fragments ) {
                    if ( i !== "site.navi" ) {
                        const key = i.replace( /^site\./, "" );

                        site.data[ key ] = document.fragments[ i ].value || document.fragments[ i ].url;
                    }
                }

                // Normalize navi context
                document.getSliceZone( "site.navi" ).value.forEach(( slice ) => {
                    let id = null;
                    let uid = null;
                    let type = null;
                    let slug = null;
                    const style = slice.value.value[ 0 ].data.style.value.toLowerCase();
                    const title = slice.value.value[ 0 ].data.name.value;

                    // Handle Document.link to a Page
                    if ( slice.value.value[ 0 ].data.page ) {
                        id = slice.value.value[ 0 ].data.page.value.document.id;
                        uid = slice.value.value[ 0 ].data.page.value.document.uid;
                        type = slice.value.value[ 0 ].data.page.value.document.type;
                        slug = uid;

                    // Handle `slug` manual entry
                    } else {
                        slug = slice.value.value[ 0 ].data.slug.value.replace( /\//g, "" );
                        id = slug;
                        uid = slug;
                        type = slug;
                    }

                    navi.items.push({
                        id: id,
                        uid: (slug === core.config.homepage ? slug : uid),
                        type: type,
                        slug: (slug === core.config.homepage ? "/" : `/${slug}/`),
                        title: title,
                        style: style
                    });
                });

                cache.client = client;
                cache.site = site;
                cache.navi = navi;

                resolve();
            });
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
const getDataForApi = function ( req, handle ) {
    return new Promise(( resolve, reject ) => {
        prismic.api( core.config.api.access, null ).then(( client ) => {
            const done = function ( json ) {
                resolve( json.results );
            };
            const fail = function ( error ) {
                resolve({
                    error: error
                });
            };
            const type = req.params.type;
            const form = getForm( req, client );
            let query = [];

            // query: type?
            query.push( prismic.Predicates.at( "document.type", type ) );

            // query: pubsub?
            if ( handle ) {
                query = handle.handler( cache.client, query, req );
            }

            // query?
            if ( query.length ) {
                form.query( query );
            }

            // submit
            form.submit().then( done ).catch( fail );
        });
    });
};



/**
 *
 * Load data for Page response.
 *
 */
const getDataForPage = function ( req, handle ) {
    return new Promise(( resolve, reject ) => {
        const data = {
            item: null,
            items: null
        };
        const doQuery = function ( type ) {
            const done = function ( json ) {
                if ( !json.results.length ) {
                    reject( `Prismic has no data for the content-type "${type}".` );

                } else {
                    // uid
                    if ( req.params.uid || navi ) {
                        data.item = getDoc( (navi ? navi.uid : req.params.uid), json.results );

                        if ( !data.item ) {
                            reject( `The document with UID "${navi ? navi.uid : req.params.uid}" could not be found by Prismic.` );
                        }

                    } else {
                        data.items = json.results;
                    }

                    resolve( data );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };
            const navi = getNavi( type );
            const form = getForm( req, cache.client );
            let query = [];

            // query: type?
            if ( navi ) {
                query.push( prismic.Predicates.at( "document.type", navi.type ) );
                query.push( prismic.Predicates.at( "document.id", navi.id ) );

            } else {
                query.push( prismic.Predicates.at( "document.type", type ) );
            }

            // query: pubsub?
            if ( handle ) {
                query = handle.handler( cache.client, query, req );
            }

            // query?
            if ( query.length ) {
                form.query( query );
            }

            // ordering?

            // submit
            form.submit().then( done ).catch( fail );
        };

        getSite().then(() => {
            const type = (req.params.type || "");

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
 * Get valid `ref` for Prismic API data.
 *
 */
const getRef = function ( req, client ) {
    let ref = client.master();

    if ( req && req.cookies && req.cookies[ prismic.previewCookie ] ) {
        ref = req.cookies[ prismic.previewCookie ];
    }

    return ref;
};



/**
 *
 * Get one document from all documents.
 *
 */
const getDoc = function ( uid, documents ) {
    return documents.find(( doc ) => {
        return (doc.uid === uid);
    });
};



/**
 *
 * Get the stub of the search form.
 *
 */
const getForm = function ( req, client ) {
    return client.form( "everything" ).pageSize( 100 ).ref( getRef( req, client ) );
};



module.exports = {
    cache,
    getApi,
    getPage,
    getPreview,
    getWebhook
};
