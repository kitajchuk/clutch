"use strict";



/**
 *
 * Adapter for Prismic
 * https://prismic.io
 *
 * Every adapter must have a common, public `cache` object:
 * cache: Object { api: Object, site: Object, navi: Object, docs: Object }
 *
 * Every adapter must have common, public functions:
 * getApi: Function
 * getPage: Function
 * getPreview: Function
 *
 * Every adapter must have common, private functions:
 * getSite: Function
 * getNavi: Function
 * getDataForApi: Function
 * getDataForPage: Function
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves properly.
 *
 *
 */
const path = require( "path" );
const prismic = require( "prismic-javascript" );
const cache = {
    api: null,
    site: null,
    navi: null,
    docs: null
};
const core = {
    config: require( "../../clutch.config" ),
    template: require( "../core/template" )
};
const ContextObject = require( "../class/ContextObject" );
const apiOptions = {
    accessToken: core.config.api.token || null,
    fetchLinks: core.config.api.fetchLinks || []
};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = ( req ) => {
    return new Promise(( resolve, reject ) => {
        prismic.api( core.config.api.access, apiOptions ).then(( api ) => {
            cache.api = api;

            getDocs().then(( docs ) => {
                const navi = {
                    items: []
                };
                const site = {
                    data: {}
                };

                // Normalize site context
                for ( let i in docs.site[ 0 ].data ) {
                    // Skip navi since we process that elsewhere...
                    if ( i !== "navi" ) {
                        // Handle `null` values...
                        if ( !docs.site[ 0 ].data[ i ] ) {
                            site.data[ i ] = "";

                        // Handle `string` values...
                        } else {
                            site.data[ i ] = docs.site[ 0 ].data[ i ];
                        }
                    }
                }

                // Normalize navi context
                docs.site[ 0 ].data.navi.forEach(( slice ) => {
                    let slug = slice.primary.page.uid || core.config.homepage;

                    if ( slug === core.config.homepage ) {
                        slug = "/";

                    } else {
                        slug = `/${slug}/`;
                    }

                    navi.items.push({
                        id: slice.primary.page.id || "",
                        uid: slice.primary.page.uid || slice.primary.slug,
                        type: slice.primary.page.type || slice.primary.slug,
                        slug,
                        title: slice.primary.name,
                        label: slice.primary.label
                    });
                });

                cache.site = site;
                cache.navi = navi;
                cache.docs = docs;

                resolve();
            });
        });
    });
};



/**
 *
 * Handle API requests.
 *
 */
const getApi = ( req, res, listener ) => {
    return new Promise(( resolve, reject ) => {
        const doQuery = ( type, uid ) => {
            let ret = null;
            let pageUID = cache.docs.page.find(( page ) => {
                return (page.uid === type);
            });

            if ( cache.api.data.forms[ type ] ) {
                const regex = /\[\[\:d\s=\sany\(document.type,\s\["(.*?)"\]\)\]\]/;
                const match = cache.api.data.forms[ type ].fields.q.default.match( regex );

                type = match[ 1 ] || type;
            }

            // Homepage "/"
            if ( !cache.docs[ type ] && !pageUID ) {
                resolve({
                    site: cache.site,
                    navi: cache.navi,
                    docs: cache.docs
                });

            // One-pager
            } else if ( core.config.onepager ) {
                resolve({
                    site: cache.site,
                    navi: cache.navi,
                    doc: cache.docs.page.find(( d ) => {
                        return (d.uid === core.config.homepage);
                    })
                });

            } else {
                const docs = pageUID ? cache.docs.page : cache.docs[ type ];

                // Single
                if ( uid || pageUID ) {
                    const doc = docs.find(( d ) => {
                        return (d.uid === (pageUID ? pageUID.uid : uid));
                    });
                    const idx = docs.indexOf( doc );
                    let next = null;
                    let prev = null;

                    if ( docs[ idx + 1 ] ) {
                        next = docs[ idx + 1 ];
                    }

                    if ( docs[ idx - 1 ] ) {
                        prev = docs[ idx - 1 ];
                    }

                    resolve({
                        site: cache.site,
                        navi: cache.navi,
                        doc,
                        next,
                        prev
                    });

                } else {
                    resolve({
                        site: cache.site,
                        navi: cache.navi,
                        docs
                    });
                }
            }

            /*
            // @hook: orderings
            if ( listener && listener.handlers.orderings ) {
                listener.handlers.orderings( prismic, cache.api, form, cache, req );
            }

            // @hook: fetchLinks
            if ( listener && listener.handlers.fetchLinks ) {
                listener.handlers.fetchLinks( prismic, cache.api, form, cache, req );
            }

            // @hook: pagination
            if ( listener && listener.handlers.pagination ) {
                listener.handlers.pagination( prismic, cache.api, form, cache, req );
            }
            */
        };

        doQuery( req.params.type, req.params.uid );
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = ( req, res, listener ) => {
    return getApi( req, res, listener );
};



/**
 *
 * Get all documents from a Prismic service API
 *
 */
const getDocs = () => {
    return new Promise(( resolve, reject ) => {
        let docs = {};
        const getDocs = ( p ) => {
            cache.api.form( "everything" )
                .pageSize( 100 )
                .page( p )
                .ref( cache.api.master() )
                .submit()
                .then(( json ) => {
                    json.results.forEach(( doc ) => {
                        if ( !docs[ doc.type ] ) {
                            docs[ doc.type ] = [];
                        }

                        docs[ doc.type ].push( doc );
                    });

                    if ( json.next_page ) {
                        getDocs( (p + 1) );

                    } else {
                        resolve( docs );
                    }
                })
                .catch(( error ) => {
                    reject( error );
                })
        };

        getDocs( 1 );
    });
};



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = ( type ) => {
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
 * Get valid `ref` for Prismic API data ( handles previews ).
 *
 */
const getRef = ( req, api ) => {
    let ref = api.master();

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
const getDoc = ( uid, documents ) => {
    return documents.find(( doc ) => {
        return (doc.uid === uid);
    });
};



/**
 *
 * Get the stub of the search form.
 *
 */
// const getForm = function ( req, api, collection ) {
//     const form = api.data.forms[ collection ] ? collection : "everything";
//
//     return api.form( form ).pageSize( 100 ).ref( getRef( req, api ) );
// };



/**
 *
 * Handle preview URLs for draft content.
 *
 */
// const getPreview = function ( req, res ) {
//     let resolvedUrl = "/";
//
//     return new Promise(( resolve, reject ) => {
//         const previewToken = req.query.token;
//         const linkResolver = function ( doc ) {
//             const type = (cache.api.data.forms[ doc.type ] || doc.type);
//
//             resolvedUrl = (type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`;
//
//             return resolvedUrl;
//         };
//
//         prismic.api( core.config.api.access, apiOptions ).then(( api ) => {
//             api.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
//                 res.cookie( prismic.previewCookie, previewToken, {
//                     maxAge: 60 * 30 * 1000,
//                     path: "/",
//                     httpOnly: false
//                 });
//
//                 resolve( resolvedUrl );
//             });
//         });
//     });
// };



module.exports = {
    cache,
    getApi,
    getSite,
    getPage,
    getDocs
};
