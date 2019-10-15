// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
import router from "./router";
import * as core from "./core";
import navi from "./modules/navi";
import intro from "./modules/intro";
import Analytics from "./class/services/Analytics";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.analytics = new Analytics();
        this.core = core;
        this.intro = intro;
        this.router = router;
        this.navi = navi;

        this.init();
    }


    /**
     *
     * @public
     * @instance
     * @method init
     * @memberof App
     * @description Initialize application modules.
     *
     */
    init () {
        this.core.detect.init();
        this.intro.init();
        this.navi.init();
        this.router.init();
        this.router.load().then(() => {
            this.intro.teardown();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
