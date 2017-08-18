"use strict";



/**
 *
 * Bootstrap for Contentful
 * https://www.contentful.com
 *
 * Creates the intial `Site` and `Page` models
 *
 *
 */
const fs = require( "fs" );
const path = require( "path" );
const contentful = require( "contentful-management" );
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const token = String( fs.readFileSync( path.join( __dirname, "../../sandbox/contentful.management.token" ) ) ).replace( /^\s+|\s+$/g, "" );
const models = {
    site: require( "../../models/Site.contentful" ),
    page: require( "../../models/Page.contentful" )
};
const client = contentful.createClient({
    accessToken: token
});



lager.cache( "Bootstrapping Contentful content-types..." );



client.getSpace( config.api.access ).then(( space ) => {
    space.createContentTypeWithId( "site", models.site ).then(( siteType ) => {
        lager.cache( "Created content-type Site" );
        lager.data( siteType );

        space.createContentTypeWithId( "page", models.page ).then(( pageType ) => {
            lager.cache( "Created content-type Page" );
            lager.data( pageType );
            lager.cache( "Contentful content-type bootstrap complete!" );
        });
    });
});
