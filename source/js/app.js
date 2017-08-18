// Load the ProperJS/app SASS
require( "properjs-app/source/sass/screen.scss" );


// Load the local project SASS
// Note that rather than load all ProperJS/app SASS,
// you can optionally import just what you want in app.scss.
require( "../sass/app.scss" );


// Load the ProperJS/app JavaScript
import router from "properjs-app/source/js/router";
import * as core from "properjs-app/source/js/core";
import navi from "properjs-app/source/js/navi";
import intro from "properjs-app/source/js/intro";
import Analytics from "properjs-app/source/js/class/Analytics";


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
        this.navi = navi;
        this.intro = intro;
        this.router = router;

        this.bind();
        this.init();
    }


    bind () {
        this.core.emitter.on( "app--intro-teardown", () => {
            this.core.log( "App Intro Teardown" );
        });

        this.core.emitter.on( "app--page-teardown", () => {
            this.core.log( "App Page Teardown" );
        });
    }


    init () {
        // Core
        this.core.detect.init();

        // Utility ?

        // Views
        this.navi.init();
        this.intro.init();

        // Controller
        this.router.init();

        // Analytics
        this.analytics = new Analytics();
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
