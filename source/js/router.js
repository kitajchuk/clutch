import $ from "properjs-hobo";
import PageController from "properjs-pagecontroller";
import ImageController from "./class/ImageController";
import * as core from "./core";
import views from "./views";


/**
 *
 * @public
 * @namespace router
 * @description Handles async web app routing for nice transitions.
 *
 */
const router = {
    /**
     *
     * @public
     * @method init
     * @memberof router
     * @description Initialize the router module.
     *
     */
    init () {
        this.pageClass = "";
        this.pageDuration = core.util.getTransitionDuration( core.dom.main[ 0 ] );
        this.bindEmpty();
        this.initPages();

        core.log( "[Router initialized]" );
    },


    /**
     *
     * @public
     * @method route
     * @param {string} path The uri to route to
     * @memberof router
     * @description Trigger app to route a specific page. [Reference]{@link https://github.com/ProperJS/Router/blob/master/Router.js#L222}
     *
     */
    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    /**
     *
     * @public
     * @method push
     * @param {string} path The uri to route to
     * @param {function} cb Optional callback to fire
     * @memberof router
     * @description Trigger a silent route with a supplied callback.
     *
     */
    push ( path, cb ) {
        this.controller.routeSilently( path, (cb || core.util.noop) );
    },


    /**
     *
     * @public
     * @method initPages
     * @memberof router
     * @description Create the PageController instance.
     *
     */
    initPages () {
        this.controller = new PageController({
            transitionTime: this.pageDuration
        });

        this.controller.setConfig([
            "/",
            ":view",
            ":view/:uid"
        ]);

        this.controller.setModules([
            views
        ]);

        //this.controller.on( "page-controller-router-samepage", () => {} );
        this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
        this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
        this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
        this.controller.on( "page-controller-initialized-page", this.initPage.bind( this ) );

        this.controller.initPage();
    },


    /**
     *
     * @public
     * @method initPage
     * @param {object} data The PageController data object
     * @memberof router
     * @description Cache the initial page load.
     *
     */
    initPage ( data ) {
        this.changeClass( data );
        this.execControllers();
    },


    /**
     *
     * @public
     * @method parseDoc
     * @param {string} html The responseText to parse out
     * @memberof router
     * @description Get the DOM information to cache for a request.
     * @returns {object}
     *
     */
    parseDoc ( html ) {
        let doc = document.createElement( "html" );
        let main = null;

        doc.innerHTML = html;

        doc = $( doc );
        main = doc.find( core.config.mainSelector );

        return {
            doc: doc,
            main: main,
            html: main[ 0 ].innerHTML
        };
    },


    /**
     *
     * @public
     * @method bindEmpty
     * @memberof router
     * @description Suppress #hash links.
     *
     */
    bindEmpty () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    /**
     *
     * @public
     * @method changeClass
     * @param {object} data The PageController data object
     * @memberof router
     * @description Handle document className swapping by page section.
     *
     */
    changeClass ( data ) {
        if ( this.view ) {
            core.dom.html.removeClass( `is-${this.view}-page` );
        }

        this.view = (data.request.params.view || "home");

        core.dom.html.addClass( `is-${this.view}-page` );
    },


    /**
     *
     * @public
     * @method changePageOut
     * @param {object} data The PageController data object
     * @memberof router
     * @description Trigger transition-out animation.
     *
     */
    changePageOut ( /* data */ ) {
        core.dom.html.addClass( "is-routing" );
        core.dom.main.addClass( "is-inactive" );

        this.destroyControllers();
    },


    /**
     *
     * @public
     * @method changeContent
     * @param {object} data The PageController data object
     * @memberof router
     * @description Swap the new content into the DOM.
     *
     */
    changeContent ( data ) {
        const doc = this.parseDoc( data.response );

        core.dom.main[ 0 ].innerHTML = doc.html;

        core.emitter.fire( "app--analytics-push" );

        this.changeClass( data );
    },


    /**
     *
     * @public
     * @method changePageIn
     * @param {object} data The PageController data object
     * @memberof router
     * @description Trigger transition-in animation.
     *
     */
    changePageIn ( /* data */ ) {
        core.dom.html.removeClass( "is-routing" );
        core.dom.main.removeClass( "is-inactive" );

        this.execControllers();
    },


    /**
     *
     * @public
     * @method execControllers
     * @memberof router
     * @description Run page controllers.
     *
     */
    execControllers () {
        this.images = core.dom.main.find( core.config.lazyImageSelector );

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            core.emitter.fire( "app--intro-teardown" );
        });
    },


    /**
     *
     * @public
     * @method destroyControllers
     * @memberof router
     * @description Kill page controllers.
     *
     */
    destroyControllers () {
        if ( this.imageController ) {
            this.imageController.destroy();
            this.imageController = null;
        }
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
