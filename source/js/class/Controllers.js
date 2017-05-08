import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 *
 */
class Controllers {
    constructor () {}


    exec () {
        this.images = core.dom.main.find( core.config.lazyImageSelector );
        this.animates = core.dom.main.find( core.config.animSelector );

        if ( this.animates.length ) {
            this.animateController = new AnimateController( this.animates );
        }

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            core.emitter.fire( "app--intro-teardown" );
        });
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
            this.imageController = null;
        }

        if ( this.animateController ) {
            this.animateController.destroy();
            this.animateController = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
