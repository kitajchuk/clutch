"use strict";


const path = require( "path" );
const config = require( "../config" );
const prismic = require( "prismic.io" );
const cache = {};
const lib = {
    template: require( "./template" )
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



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = function ( type ) {
    let ret = false;

    cache.site.getSliceZone( "site.navi" ).value.forEach(( slice ) => {
        if ( slice.value.value[ 0 ].data.page.value.document.uid === type ) {
            ret = slice.value.value[ 0 ].data.page.value.document;
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

    prismic.api( config.apiAccess, null ).then(( api ) => {
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
        const jsonData = {};
        const template = path.join( config.template.partialsDir, `${(query.template || params.type)}.html` );

        if ( data.document ) {
            jsonData.document = data.document;
        }

        if ( data.documents ) {
            jsonData.documents = data.documents;
        }

        lib.template.render( template, jsonData )
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
        prismic.api( config.apiAccess, null ).then(( api ) => {
            api.getSingle( "site" ).then(( site ) => {
                cache.api = api;
                cache.site = site;

                resolve( site );
            });
        });
    });
};



/**
 *
 * Load data for API response.
 *
 */
const getDataForApi = function ( req ) {
    return new Promise(( resolve, reject ) => {
        prismic.api( config.apiAccess, null ).then(( api ) => {
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
        const doQuery = function ( type ) {
            const done = function ( json ) {
                // Question:
                // A `single` type should return a pure `result` {object}
                // A `repeatable` type should return a `results` [array]
                if ( !json.results.length ) {
                    reject( `The page template for "${type}" exists but Prismic has no data for it.` );

                } else {
                    resolve( json.results );
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
            const form = cache.api.form( (cache.api.data.forms[ type ] ? type : "everything") );

            // ref
            form.ref( getRef( req, cache.api ) );

            // type
            if ( !cache.api.data.forms[ type ] ) {
                // Check against site navigation
                if ( navi ) {
                    query.push( prismic.Predicates.at( "document.type", navi.type ) );
                    query.push( prismic.Predicates.at( "document.id", navi.id ) );

                } else {
                    query.push( prismic.Predicates.at( "document.type", type ) );
                }
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
            const type = (req.params.path || "");

            if ( !type ) {
                resolve( [] );

            } else {
                doQuery( type );
            }
        });
    });
};



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



module.exports = {
    cache,
    getApi,
    getPage,
    getPreview
};
