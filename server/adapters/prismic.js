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
 *
 * Different Headless CMS will require slightly different internal approaches
 * Whatever means necessary is A-OK as long as the data resolves to the ORM format
 *
 *
 */
const path = require( "path" );
const config = require( "../config" );
const prismic = require( "prismic.io" );
const cache = {};
const lib = {
    template: require( "../lib/template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res ) {
    getDataForApi( req ).then(( json ) => {
        const data = {};

        // Single document for /:type/:uid
        if ( req.params.uid ) {
            data.document = json.find(( document ) => {
                return (document.uid === req.params.uid);
            });

        // All documents for /:type
        } else {
            data.documents = json;
        }

        if ( req.query.format === "html" ) {
            getPartial( req.params, req.query, data ).then(( html ) => {
                res.send( html );
            });

        } else {
            res.json( data );
        }

    }).catch(( error ) => {
        res.json( error );
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = function ( req ) {
    return new Promise(( resolve, reject ) => {
        getDataForPage( req ).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
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
        prismic.api( config.api.access, null ).then(( api ) => {
            api.getSingle( "site" ).then(( document ) => {
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
                    let slug = "";
                    const title = slice.value.value[ 0 ].data.name.value;

                    if ( slice.value.value[ 0 ].data.slug ) {
                        slug = `/${slice.value.value[ 0 ].data.slug.value.replace( /\//g, "" )}/`;

                    } else if ( slice.value.value[ 0 ].data.page ) {
                        id = slice.value.value[ 0 ].data.page.value.document.id;
                        uid = slice.value.value[ 0 ].data.page.value.document.uid;
                        type = slice.value.value[ 0 ].data.page.value.document.type;
                        slug = `/${uid}/`;
                    }

                    navi.items.push({
                        id: id,
                        uid: uid,
                        type: type,
                        slug: slug,
                        title: title
                    });
                });

                cache.api = api;
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
 * Handle preview URLs from Prismic for draft content.
 *
 */
const getPreview = function ( req, res ) {
    const previewToken = req.query.token;
    const linkResolver = function ( doc ) {
        return `/${doc.type}/${doc.uid}/`;
    };

    prismic.api( config.api.access, null ).then(( api ) => {
        api.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
            res.cookie( prismic.previewCookie, previewToken, {
                maxAge: 60 * 30 * 1000,
                path: "/",
                httpOnly: false
            });

            res.redirect( redirectUrl );
        });
    });
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
        const template = path.join( config.template.partialsDir, `${partial}.html` );

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
 * Load data for API response. Resolve RAW from Service.
 *
 */
const getDataForApi = function ( req ) {
    return new Promise(( resolve, reject ) => {
        prismic.api( config.api.access, null ).then(( api ) => {
            const done = function ( json ) {
                resolve( json.results );
            };
            const fail = function ( error ) {
                resolve({
                    error: error
                });
            };

            // query
            const query = [];

            // form
            const form = api.form( (api.data.forms[ req.params.type ] ? req.params.type : "everything") );

            // ref
            form.ref( getRef( req, api ) );

            // type
            if ( !api.data.forms[ req.params.type ] ) {
                query.push( prismic.Predicates.at( "document.type", req.params.type ) );
            }

            // query
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
const getDataForPage = function ( req ) {
    return new Promise(( resolve, reject ) => {
        const data = {
            item: null,
            items: null
        };
        const doQuery = function ( type ) {
            const done = function ( json ) {
                // Question?
                // A `single` type should return a pure `result` {object}
                // A `repeatable` type should return a `results` [array]

                if ( !json.results.length ) {
                    reject( `The page template for "${type}" exists but Prismic has no data for it.` );

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

            // query
            const query = [];

            // navi
            const navi = getNavi( type );

            // form
            const form = cache.api.form( "everything" );

            // ref
            form.ref( getRef( req, cache.api ) );

            // type
            if ( navi ) {
                query.push( prismic.Predicates.at( "document.type", navi.type ) );
                query.push( prismic.Predicates.at( "document.id", navi.id ) );

            } else {
                query.push( prismic.Predicates.at( "document.type", type ) );
            }

            // Custom querying can be done here...
            // Example use of `active` field for querying
            // if ( type === "${sometype}" ) {
            //     query.push( prismic.Predicates.has( `my.${type}.active` ) );
            // }

            // query
            if ( query.length ) {
                form.query( query );
            }

            // Custom ordering can be done here...
            // Example use of `order` field for ordering
            // if ( type === "${sometype}" ) {
            //     form.orderings( `[my.${type}.order]` );
            // }

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
const getRef = function ( req, api ) {
    let ref = api.master();

    if ( req && req.cookies && req.cookies[ prismic.previewCookie ] ) {
        ref = req.cookies[ prismic.previewCookie ];
    }

    return ref;
};



const getDoc = function ( uid, documents ) {
    return documents.find(( doc ) => {
        return (doc.uid === uid);
    });
};



module.exports = {
    cache,
    getApi,
    getPage,
    getPreview
};
