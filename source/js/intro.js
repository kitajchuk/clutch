import * as core from "./core";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const intro = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.intro
     * @description Method initializes intro node in DOM.
     *
     */
    init () {
        this.header = core.dom.header;

        core.emitter.on( "app--intro-teardown", this.teardown.bind( this ) );
    },


    teardown () {
        setTimeout( () => {
            this.header.removeClass( "is-hylian" );

        }, 1000 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
