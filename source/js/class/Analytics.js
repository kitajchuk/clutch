import log from "../core/log";
import env from "../core/env";


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
     * @description Track Squarespace Metrics since we are ajax-routing.
     *
     */
    track () {
        log( "Analytics pageview", window.location.href );

        // Google Analytics
        window.ga( "send", "pageview", window.location.href );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Analytics;
