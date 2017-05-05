import * as core from "./core";


/**
 *
 * @public
 * @namespace navi
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const navi = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.navi
     * @description Method initializes navi node in DOM.
     *
     */
    init () {
        this.isOpen = false;
        this.element = core.dom.navi;
        this.trigger = core.dom.body.find( ".js-controller--navi" );
        this.bind();
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
        });
    },


    open () {
        this.isOpen = true;
        this.element.addClass( "is-active" );
    },


    close () {
        this.isOpen = false;
        this.element.removeClass( "is-active" );
    },


    toggle () {
        if ( this.isOpen ) {
            this.close();

        } else {
            this.open();
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navi;
