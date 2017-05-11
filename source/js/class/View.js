import * as core from "../core";
import $ from "properjs-hobo";
import Controllers from "./Controllers";
import paramalama from "paramalama";


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
        this.controllers = new Controllers();

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
        return new Promise(( resolve ) => {
            const cache = core.cache.get( `partial--${this.id}` );
            const query = paramalama( window.location.search );

            // Set these for Clutch API partial rendering
            query.format = "html";
            query.template = this.id;

            if ( cache ) {
                resolve( cache );

            } else {
                $.ajax({
                    url: this.endpoint,
                    dataType: "html",
                    method: "GET",
                    data: query

                }).then(( response ) => {
                    // core.cache.set( `partial--${this.id}`, response );

                    resolve( response );
                });
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
        this.controllers.exec();
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
        this.controllers.destroy();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
