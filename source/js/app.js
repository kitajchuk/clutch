require( "../sass/screen.scss" );


// import router from "./router-views";
import router from "./router-pages";
import * as core from "./core";
import views from "./views";
import intro from "./intro";
import Analytics from "./class/Analytics";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.core = core;
        this.views = views;
        this.intro = intro;
        // this.router = router;
        this.router = router;

        this.initModules();
    }


    /**
     *
     * @public
     * @instance
     * @method initModules
     * @memberof App
     * @description Initialize application modules.
     *
     */
    initModules () {
        // Core
        this.core.detect.init();

        // Utility ?

        // Views
        this.views.init();
        this.intro.init();

        // Controller
        // this.router.init();
        this.router.init();

        // Analytics
        this.analytics = new Analytics();
    }
}


/******************************************************************************
 * Expose
*******************************************************************************/
window.app = new App();


/******************************************************************************
 * Export
*******************************************************************************/
export default window.app;
