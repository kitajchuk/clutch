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
        this.views = {};
        this.elements = core.dom.views;

        this.elements.forEach(( element, i ) => {
            this.initView( this.elements.eq( i ) );
        });
    },


    initView ( element ) {
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
