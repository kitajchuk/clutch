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
        this.element = core.dom.intro;
        this.logo = this.element.find( ".js-intro-logo" );
        this.durations = {
            animation: core.util.getElementDuration( this.logo[ 0 ], "animation" ),
            transition: core.util.getElementDuration( this.element[ 0 ] )
        };
        core.emitter.on( "app--page-teardown", this.teardown );
    },


    teardown () {
        core.emitter.off( "app--page-teardown", intro.teardown );

        setTimeout( () => {
            intro.element.removeClass( "is-active" );

        }, intro.durations.animation );

        setTimeout( () => {
            intro.element.remove();

            core.emitter.fire( "app--intro-teardown" );

        }, (intro.durations.animation + intro.durations.transition) );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
