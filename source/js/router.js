import $ from "properjs-hobo";
import Controller from "properjs-controller";
import PageController from "properjs-pagecontroller";
// import paramalama from "paramalama";
import * as gsap from "gsap/all";
import Controllers from "./class/Controllers";
import * as core from "./core";
import navi from "./modules/navi";



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
        this.blit = new Controller();
        this.animDuration = 500;
        this.controllers = new Controllers({
            el: core.dom.main,
            cb: () => {
                // core.emitter.fire( "app--page-teardown" );
                this.topper();
            }
        });

        core.emitter.on( "app--intro-teardown", () => {
            this.controllers.animate();
        });

        // Transition page state stuff
        this.state = {
            now: null,
            future: null
        };
        this.church = null;

        this.bindEmpty();
        this.initPages();
        this.prepPages();

        core.log( "[Router initialized]", this );
    },


    load () {
        return new Promise(( resolve ) => {
            this.controller = new PageController({
                transitionTime: this.animDuration,
                routerOptions: {
                    async: true
                }
            });

            this.controller.setConfig([
                "/",
                ":view",
                ":view/:uid"
            ]);

            // this.controller.setModules( [] );

            //this.controller.on( "page-controller-router-samepage", () => {} );
            this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
            this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
            this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
            this.controller.on( "page-controller-initialized-page", ( data ) => {
                this.initPage( data );
                resolve();
            });
            this.controller.initPage();
        });
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
     * @method initPages
     * @memberof router
     * @description Create the PageController instance.
     *
     */
    initPages () {

    },


    prepPages () {
        this.controllers.exec();
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
        this.setDoc( data );
        this.setState( "now", data );
        this.setState( "future", data );
        this.setClass();
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
            html: main[ 0 ].innerHTML,
            data: main.data()
        };
    },


    setDoc ( data ) {
        this.doc = this.parseDoc( data.response );
    },


    setState ( time, data ) {
        this.state[ time ] = {
            raw: data,
            uid: data.request.params.uid || null,
            view: data.request.params.view || core.config.homepage,
            cat: data.request.query.category || null
        };

        if ( time === "future" ) {
            this.church = {
                isFeedFeed: (this.state.now.view === this.state.future.view && !this.state.now.uid && !this.state.future.uid),
                isFeedDetail: (this.state.now.view === this.state.future.view && !this.state.now.uid && this.state.future.uid),
                isDetailDetail: (this.state.now.view === this.state.future.view && this.state.now.uid && this.state.future.uid),
                isDetailFeed: (this.state.now.view === this.state.future.view && this.state.now.uid && !this.state.future.uid)
            };
        }
    },


    setTheme () {
        if ( this.doc.data.darkside ) {
            core.dom.html.addClass( "is-darkside" );

        } else {
            core.dom.html.removeClass( "is-darkside" );
        }
    },


    setPath () {
        if ( this.church.isFeedDetail ) {
            core.dom.html.addClass( "is-feed-detail" );

        } else if ( this.church.isFeedFeed ) {
            core.dom.html.addClass( "is-feed-feed" );

        } else if ( this.church.isDetailDetail ) {
            core.dom.html.addClass( "is-detail-detail" );

        } else if ( this.church.isDetailFeed ) {
            core.dom.html.addClass( "is-detail-feed" );
        }
    },


    unsetPath () {
        core.dom.html.removeClass( "is-feed-detail is-feed-feed is-detail-detail is-detail-feed" );
    },


    setClass () {
        if ( this.state.future.view ) {
            core.dom.html.addClass( `is-${this.state.now.view}-page` );
        }

        if ( this.state.future.uid ) {
            core.dom.html.addClass( `is-uid-page` );
        }

        if ( this.state.future.cat ) {
            core.dom.html.addClass( `is-cat-page` );
        }
    },


    unsetClass () {
        if ( this.state.now.view !== this.state.future.view ) {
            core.dom.html.removeClass( `is-${this.state.now.view}-page` );
        }

        if ( this.state.now.uid && !this.state.future.uid ) {
            core.dom.html.removeClass( `is-uid-page` );
        }

        if ( this.state.now.cat && !this.state.future.cat ) {
            core.dom.html.removeClass( `is-cat-page` );
        }
    },


    changePageOut ( data ) {
        core.dom.html.addClass( "is-tranny" );
        this.setState( "future", data );
        this.setPath();
        this.unsetClass();
        this.setClass();
        this.transitionOut();
        navi.close();
        navi.active( this.state.future.view );
        this.controllers.destroy();
    },


    changeContent ( data ) {
        this.setDoc( data );
        this.setTheme();
        core.dom.main[ 0 ].innerHTML = this.doc.html;
        this.topper();
        this.controllers.exec();
        core.emitter.fire( "app--analytics-pageview", this.doc );
    },


    changePageIn ( data ) {
        setTimeout(() => {
            core.dom.html.removeClass( "is-tranny" );
            this.controllers.animate();
            this.transitionIn();
            this.setState( "now", data );
            this.unsetPath();

        }, this.animDuration );
    },


    tweenContent ( opacity ) {
        const isOne = (opacity === 1);

        this.tween = gsap.TweenLite.to( core.dom.main[ 0 ], 0.5, {
            css: {
                opacity
            },
            ease: isOne ? gsap.Power4.easeOut : gsap.Power4.easeIn,
            onComplete: () => {}
        });
    },


    transitionOut () {
        this.tweenContent( 0 );
    },


    transitionIn () {
        this.blit.go(() => {
            if ( this.tween && !this.tween.isActive() ) {
                this.blit.stop();

                this.tweenContent( 1 );
            }
        });
    },


    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    push ( path, cb ) {
        this.controller.routeSilently( path, (cb || core.util.noop) );
    },


    topper () {
        window.scrollTo( 0, 0 );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
