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

    // Prismic specific with `getText`... tsk tsk...?
    getPageTitle () {
        const item = this.get( "item" );
        const title = this.get( "site" ).data.title;

        return (item ? item.getText( `${item.type}.title` ) + ` — ${title}` : title);
    }

    // Prismic specific with `getImage`... tsk tsk...?
    getPageImage () {
        const item = this.get( "item" );
        const appImage = this.get( "site" ).data.appImage;
        const pageImage = item ? item.getImage( `${item.type}.image` ) : "";

        return (pageImage ? pageImage.url : appImage);
    }
}



module.exports = ContextObject;
