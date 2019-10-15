import log from "../../core/log";
import emitter from "../../core/emitter";


/**
 *
 * @public
 * @class Analytics
 * @classdesc Handles Google Analytics.
 *            @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/}
 * @memberof core
 *
 */
class Analytics {
    constructor () {
        emitter.on( "app--analytics-pageview", this.track.bind( this ) );

        log( "[Analytics initialized]" );
    }


    /**
     *
     * @public
     * @method track
     * @memberof core.Analytics
     * @param {object} doc The doc object created by router {$doc, $page, pageData, pageHtml}
     * @description Track Squarespace Metrics since we are ajax-routing.
     *
     */
    track ( doc ) {
        log( "Analytics pageview", window.location.href );

        // Google Analytics
        window.ga( "send", "pageview", window.location.href );

        // Document title
        this.setDocumentTitle( doc.data.title );
    }


    /**
     *
     * @public
     * @method setDocumentTitle
     * @param {string} title The new title for the document
     * @memberof class.Analytics
     * @description Update the documents title.
     *
     */
    setDocumentTitle ( title ) {
        document.title = title;
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Analytics;
