"use strict";



const config = require( "../../clutch.config" );



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
        const item = this.get( "item" );
        let title = this.get( "site" ).data.title;

        if ( config.api.adapter === "prismic" ) {
            title = (item ? item.getText( `${item.type}.title` ) + ` — ${title}` : title);

        } else if ( config.api.adapter === "contentful" ) {
            title = (item ? `${item.fields.title} — ${title}` : title);
        }

        return title;
    }

    getPageImage () {
        const item = this.get( "item" );
        const appImage = this.get( "site" ).data.appImage;
        let pageImage = "";

        if ( config.api.adapter === "prismic" ) {
            pageImage = item ? item.getImage( `${item.type}.image` ) : "";

        } else if ( config.api.adapter === "contentful" ) {
            pageImage = item ? item.fields.image.fields.file.url : "";
        }

        return (pageImage ? pageImage.url : appImage);
    }

    // Prismic specific... tsk tsk...?
    getUrl ( item ) {
        return `/${item.type}/${item.uid}/`;
    }

    // Prismic specific... tsk tsk...?
    getMediaAspect ( media ) {
        return `${media.height / media.width * 100}%`;
    }
}



module.exports = ContextObject;
