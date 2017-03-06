import log from "../core/log";
import env from "../core/env";
import loadJS from "fg-loadjs";
import emitter from "../core/emitter";


// Singleton
let _instance = null;


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
        if ( !_instance ) {
            this.stageUA = "";
            this.prodUA = window.APP_CONFIG.googleUA;
            this.GAScript = "//www.google-analytics.com/analytics.js";
            this.GAUATag = (env.isProd() ? this.prodUA : this.stageUA);

            this.initGoogleAnalytics();

            emitter.on( "app--analytics-pageview", this.track.bind( this ) );

            log( "Analytics initialized", this );

            _instance = this;
        }

        return _instance;
    }


    /**
     *
     * @public
     * @method initGoogleAnalytics
     * @memberof core.Analytics
     * @description Build GA interface and load analytics.js.
     *
     */
    initGoogleAnalytics () {
        if ( _instance ) {
            return;
        }

        // Setup GA Interface
        window.GoogleAnalyticsObject = "ga";
        window.ga = (window.ga || function () {
            // Blockers like `Privacy Badger` will blow GA up here
            // https://www.eff.org/privacybadger
            try {
                window.ga.q = (window.ga.q || []).push( arguments );

            } catch ( error ) {
                log( "warn", "GA Error", error );
            }
        });
        window.ga.l = Number( new Date() );

        // Load GA Javascript
        loadJS( this.GAScript, () => {
            log( "Analytics GA loaded" );

            window.ga( "create", this.GAUATag, "auto" );
            window.ga( "send", "pageview" );
        });
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
