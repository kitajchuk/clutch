"use strict";


const path = require( "path" );
const config = require( "../config" );
const contentful = require( "contentful" );
const cache = {};
const lib = {
    template: require( "../lib/template" )
};



/**
 *
 * Get valid `ref` for Prismic API data.
 *
 */
const getRef = function ( req, api ) {

};



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = function ( type ) {

};



/**
 *
 * Handle preview URLs from Prismic for draft content.
 *
 */
const getPreview = function ( req, res ) {

};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( params, query, data ) {

};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = function () {
    return new Promise(( resolve, reject ) => {
        const client = contentful.createClient({
            space: config.api.space,
            accessToken: config.api.access
        });

        client.sync( {initial: true} ).then(( res ) => {
            console.log( res.entries );
            // cache.client = client;
            // cache.site = site;
            //
            // resolve( site );
        });
    });
};



/**
 *
 * Load data for API response.
 *
 */
const getDataForApi = function ( req ) {

};



/**
 *
 * Load data for Page response.
 *
 */
const getDataForPage = function ( req ) {
    return new Promise(( resolve, reject ) => {
        const doQuery = function ( type ) {
            console.log( "CACHE", cache );
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
