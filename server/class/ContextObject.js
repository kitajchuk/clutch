"use strict";



const config = require( "../../clutch.config" );
const prismicDOM = require( "prismic-dom" );



/**
 *
 * Template Context {object}.
 *
 */
class ContextObject {
    constructor ( page ) {
        this.site = null;
        this.navi = null;
        this.page = page;
        this.cache = config.env.production;
        this.error = null;
        this.timestamp = config.timestamp;
        this.item = null;
        this.items = null;
        this.stylesheet = config.static.css;
        this.javascript = config.static.js;
        this.config = config;
        this.dom = (config.api.adapter === "prismic" ? prismicDOM : null);
        this.env = process.env.NODE_ENV;
    }

    set ( prop, value ) {
        if ( typeof prop === "object" ) {
            for ( let i in prop ) {
                this[ i ] = prop[ i ];
            }

        } else {
            this[ prop ] = value;
        }
    }

    get ( prop ) {
        return this[ prop ];
    }

    getTemplate () {
        return `pages/${this.page}.html`;
    }

    getPageTitle () {
        const page = this.get( "page" );;
        const site = this.get( "site" );
        const navi = this.get( "navi" );
        const items = this.get( "items" );
        let item = this.get( "item" );
        let title = site.data.title;
        let navItem = null;

        if ( config.api.adapter === "prismic" ) {
            if ( typeof title === "object" ) {
                title = prismicDOM.RichText.asText( title );
            }

            // Supports collection mapping to content-type
            if ( items ) {
                item = navi.items.find(( nav ) => {
                    return (nav.uid === page);
                });

                if ( item ) {
                    item.data = {
                        title: item.title
                    };
                }

            } else if ( item && (typeof item.data.title === "object") ) {
                item.data.title = prismicDOM.RichText.asText( item.data.title );
            }

            title = (item ? `${item.data.title} — ${title}` : title);

        } else if ( config.api.adapter === "contentful" ) {
            title = (item ? `${item.fields.title} — ${title}` : title);
        }

        return title;
    }

    getPageImage () {
        const item = this.get( "item" );
        let appImage = this.get( "site" ).data.appImage;
        let pageImage = null;

        if ( config.api.adapter === "prismic" ) {
            pageImage = item ? item.data.image.url : null;
            appImage = appImage.url;

        } else if ( config.api.adapter === "contentful" ) {
            pageImage = item ? item.fields.image.fields.file.url : null;
        }

        return (pageImage || appImage);
    }

    getUrl ( doc ) {
        const type = (config.generate.mappings[ doc.type ] || doc.type);
        const resolvedUrl = doc.uid === config.homepage ? "/" : ((type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`);

        return resolvedUrl;
    }

    getMediaAspect ( media ) {
        return `${media.height / media.width * 100}%`;
    }
}



module.exports = ContextObject;
