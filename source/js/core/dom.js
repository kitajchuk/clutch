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
     * @member header
     * @memberof core.dom
     * @description The cached <header> node.
     *
     */
    header: $( ".js-header" ),


    /**
     *
     * @public
     * @member footer
     * @memberof core.dom
     * @description The cached <footer> node.
     *
     */
    footer: $( ".js-footer" ),


    /**
     *
     * @public
     * @member views
     * @memberof core.dom
     * @description The cached view nodes.
     *
     */
    views: $( ".js-view" ),


    /**
     *
     * @public
     * @member intro
     * @memberof core.dom
     * @description The cached intro node.
     *
     */
    intro: $( ".js-intro" ),


    /**
     *
     * @public
     * @member main
     * @memberof core.dom
     * @description The cached main node.
     *
     */
    main: $( ".js-main" ),


    /**
     *
     * @public
     * @member navi
     * @memberof core.dom
     * @description The cached <nav> nodes.
     *
     */
    navi: $( ".js-navi" )
};



/******************************************************************************
 * Export
*******************************************************************************/
export default dom;
