import * as core from "./core";
import PageController from "properjs-pagecontroller";


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
     * @member view
     * @memberof router
     * @description The current vue.js instance.
     *
     */
    view: null,


    /**
     *
     * @public
     * @member page
     * @memberof router
     * @description The current active page element.
     *
     */
    page: null,


    /**
     *
     * @public
     * @method init
     * @memberof router
     * @description Initialize the router module.
     *
     */
    init () {
        this.initPageController();
        this.bindEmptyHashLinks();

        core.log( "router initialized" );
    },


    /**
     *
     * @public
     * @method initPageController
     * @memberof router
     * @description Create the PageController instance.
     *
     */
    initPageController () {
        this.controller = new PageController({
            transitionTime: 0,
            routerOptions: {
                async: false
            }
        });

        this.controller.setConfig([
            "/",
            ":view",
            ":view/:uid"
        ]);

        //this.controller.on( "page-controller-router-samepage", () => core.log( "router samepage" ) );
        this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
        this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
        this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
        this.controller.on( "page-controller-initialized-page", this.initPage.bind( this ) );

        this.controller.initPage();
    },


    /**
     *
     * @public
     * @method bindEmptyHashLinks
     * @memberof router
     * @description Suppress #hash links.
     *
     */
    bindEmptyHashLinks () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    /**
     *
     * @public
     * @method initPage
     * @param {object} data The PageController data object
     * @memberof router
     * @description Make sure page load mounts root if not on root.
     *
     */
    initPage ( data ) {
        this.viewChange( data );
        this.execControllers();
    },


    /**
     *
     * @public
     * @method viewChange
     * @param {object} data The PageController data object
     * @memberof router
     * @description Handle view changes.
     *
     */
    viewChange ( data ) {
        if ( this.view ) {
            core.dom.html.removeClass( `is-${this.view}-page` );
        }

        this.view = (data.request.params.view || "home");

        if ( this.page ) {
            this.page.removeClass( "is-active" );
        }

        core.dom.html.addClass( `is-${this.view}-page` );

        setTimeout(() => {
            this.page = core.dom.views.filter( `.js-${this.view}` );
            this.page.addClass( "is-active" );

        }, core.config.defaultDuration );

        core.emitter.fire( `app--view-${this.view}` );
    },


    /**
     *
     * @public
     * @method changePageOut
     * @memberof router
     * @description Trigger transition-out animation.
     *
     */
    changePageOut () {
        setTimeout( () => {
            core.emitter.fire( "app--view-teardown" );

        }, 0 );
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
        this.viewChange( data );
    },


    /**
     *
     * @public
     * @method changePageIn
     * @param {object} data The data object supplied by PageController from PushState
     * @memberof router
     * @description Trigger transition-in animation.
     *
     */
    changePageIn ( /* data */ ) {
        core.emitter.fire( "app--analytics-pageview" );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
