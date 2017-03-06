import $ from "properjs-hobo";


/**
 *
 * @public
 * @namespace dom
 * @memberof core
 * @description Holds high-level cached Nodes.
 *
 */
const dom = {
    /**
     *
     * @public
     * @member doc
     * @memberof core.dom
     * @description The cached document.
     *
     */
    doc: $( document ),


    /**
     *
     * @public
     * @member html
     * @memberof core.dom
     * @description The cached documentElement node.
     *
     */
    html: $( document.documentElement ),


    /**
     *
     * @public
     * @member body
     * @memberof core.dom
     * @description The cached body node.
     *
     */
    body: $( document.body ),


    /**
     *
     * @public
     * @member navi
     * @memberof core.dom
     * @description The cached <header> node.
     *
     */
    header: $( ".js-header" ),


    /**
     *
     * @public
     * @member views
     * @memberof core.dom
     * @description The cached view nodes.
     *
     */
    views: $( ".js-view" )
};



/******************************************************************************
 * Export
*******************************************************************************/
export default dom;
