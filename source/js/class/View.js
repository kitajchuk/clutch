import $ from "properjs-hobo";
import * as core from "../core";
import AnimateController from "./AnimateController";
import ImageController from "./ImageController";


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
        this.anims = this.element.find( core.config.animSelector );
        this.images = this.element.find( core.config.lazyImageSelector );

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            if ( this.anims.length ) {
                this.animController = new AnimateController( this.anims );
            }

            core.emitter.fire( "app--intro-teardown" );
        });
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

        if ( this.animController ) {
            this.animController.destroy();
            this.animController = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
