import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";
import CoverController from "./CoverController";
import QueryController from "./QueryController";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.options = options || {};
        this.controllers = [];
    }


    push ( id, elements, controller, conditions ) {
        this.controllers.push({
            id: id,
            elements: elements,
            instance: null,
            Controller: controller,
            conditions: conditions
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length && controller.conditions ) {
                controller.instance = new controller.Controller( controller.elements );
            }
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];
    }


    exec () {
        this.controllers = [];

        this.push( "animates", core.dom.main.find( core.config.animSelector ), AnimateController, true );
        this.push( "cover", core.dom.main.find( core.config.coverSelector ), CoverController, true );
        this.push( "query", ["q"], QueryController, true );

        this.images = core.dom.main.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            this.init();

            if ( this.options.onPreloaded ) {
                this.options.onPreloaded();
            }
        });
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
