"use strict";



/**
 *
 * Sitemap generator for Prismic
 *
 * https://www.sitemaps.org/protocol.html
 *
 * Every generator must have a common `generate` method
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const prismic = require( "prismic.io" );
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    @content
</urlset>`;
const xmlNode = `<url>
    <loc>@loc</loc>
    <changefreq>@changefreq</changefreq>
    <priority>@priority</priority>
    <lastmod>@lastmod</lastmod>
</url>`;



const getLastmod = ( timestamp ) => {
    const date = new Date( timestamp );
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();

    return [
        date.getFullYear(),
        (mm > 9 ? "" : "0") + mm,
        (dd > 9 ? "" : "0") + dd

    ].join( "-" );
};
const getDocuments = ( api ) => {
    return new Promise(( resolve, reject ) => {
        let docs = [];
        const getDocs = ( p ) => {
            api.form( "everything" )
                .pageSize( 100 )
                .page( p )
                .ref( api.master() )
                .submit()
                .then(( json ) => {
                    json.results.forEach(( doc ) => {
                        // Explicit `false` to exclude content-type
                        if ( config.generate.sitemap[ doc.type ] !== false ) {
                            docs.push( doc );
                        }
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
const createSitemap = () => {
    return new Promise(( resolve, reject ) => {
        prismic.api( config.api.access, (config.api.token || null) ).then(( api ) => {
            getDocuments( api ).then(( docs ) => {
                const nodes = [];

                docs.forEach(( doc ) => {
                    let loc = `${config.url}`;

                    // Clutch lets pages be special
                    // e.g /page/foobar => /foobar
                    if ( doc.type !== "page" ) {
                        loc = `${loc}/${config.generate.mappings[ doc.type ] ? config.generate.mappings[ doc.type ] : doc.type}`;
                    }

                    loc = `${loc}/${doc.uid}/`;

                    nodes.push(
                        xmlNode
                            .replace( "@loc", loc )
                            .replace( "@changefreq", "monthly" )
                            .replace( "@priority", "0.5" )
                            .replace( "@lastmod", getLastmod( doc.lastPublicationDate ) )
                    );
                });

                const finalXML = xmlDoc.replace( "@content", nodes.join( "\n" ) );

                resolve( finalXML );
            });
        });
    });
};



module.exports = {
    generate () {
        return new Promise(( resolve, reject ) => {
            createSitemap().then( resolve ).catch( reject );
        });
    }
};
