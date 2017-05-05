import $ from "properjs-hobo";
import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";


/**
 *
 * @public
 * @global
 * @class View
 * @param {object} args The settings for the view
 * @classdesc Handle shared view functionality.
 *
 * @todo: Use ./core/cache for data and try that first
 *
 */
class View {
    constructor ( args ) {
        this.id = args.id;
        this.element = args.el;
        this.endpoint = args.url;
        this.callback = args.cb;
        this.response = "";
        this.data = {};

        this.init();
    }


    /**
     *
     * @instance
     * @description Run the View initialization stack
     * @memberof View
     * @method init
     *
     */
    init () {
        this.load().then( ( response ) => {
            this.response = response;
            this.render();
            this.exec();
            this.done();
        });
    }


    /**
     *
     * @instance
     * @description Fire callback when init stack is done
     * @memberof View
     * @method done
     *
     */
    done () {
        if ( typeof this.callback === "function" ) {
            this.callback();
        }
    }


    /**
     *
     * @instance
     * @description Update a view without rendering
     * @memberof View
     * @method update
     * @param {string} url The new endpoint
     * @param {function} cb The new callback
     *
     */
    update ( url, cb ) {
        this.endpoint = url;
        this.callback = cb;

        this.load().then( ( response ) => {
            this.response = response;
            this.done();
        });
    }


    /**
     *
     * @instance
     * @description Get the data for the view
     * @memberof View
     * @method load
     * @returns {Promise}
     *
     */
    load () {
        return $.ajax({
            url: this.endpoint,
            dataType: "html",
            method: "GET",
            data: {
                format: "html",
                template: this.id
            }
        });
    }


    /**
     *
     * @instance
     * @description Render the view template
     * @memberof View
     * @method render
     *
     */
    render () {
        this.element[ 0 ].innerHTML = this.response;
    }


    /**
     *
     * @instance
     * @description Initialize controllers
     * @memberof View
     * @method exec
     *
     */
    exec () {
        this.images = core.dom.main.find( core.config.lazyImageSelector );
        this.animates = core.dom.main.find( core.config.animSelector );

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            core.emitter.fire( "app--intro-teardown" );
        });

        if ( this.animates.length ) {
            this.animateController = new AnimateController( this.animates );
        }
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof View
     * @method destroy
     *
     */
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
export default View;
