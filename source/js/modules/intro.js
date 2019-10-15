import * as core from "../core";
import Controller from "properjs-controller";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 *
 */
const intro = {
    init () {
        this.element = core.dom.body.find( ".js-intro" );

        if ( this.element.length ) {
            this.logTime = Date.now();
            this.minTime = 4000;
            this.blit = new Controller();
            this.animIn();
        }
    },

    animIn () {
        this.element.find( ".js-intro-anim" ).addClass( "is-animated" );
    },

    teardown () {
        this.blit.go(() => {
            if ( (Date.now() - this.logTime) > this.minTime ) {
                this.blit.stop();
                this.element.removeClass( "is-active" );
                core.emitter.fire( "app--intro-teardown" );
            }
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
