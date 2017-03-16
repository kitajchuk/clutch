import * as core from "./core";
import View from "./class/View";


/**
 *
 * @public
 * @namespace views
 * @description Performs the view loading.
 *
 */
const views = {
    init () {
        core.log( "[PageController::views initialized]" );
    },


    setup () {
        this.views = {};
        this.elements = core.dom.main.find( ".js-view" );
    },


    onload () {
        core.log( "[PageController::views onload]" );

        this.elements.forEach(( element, i ) => {
            this.loadView( this.elements.eq( i ) );
        });
    },


    unload () {
        core.log( "[PageController::views unload]" );

        this.teardown();
    },


    teardown () {
        this.views = {};
        this.elements = null;
    },


    isActive () {
        this.setup();

        return (this.elements.length > 0);
    },


    loadView ( element ) {
        const data = element.data();

        this.views[ data.uid ] = new View({
            id: data.uid,
            el: element,
            url: data.api
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default views;
