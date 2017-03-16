/**
 *
 * @public
 * @namespace util
 * @memberof core
 * @description Houses app-wide utility methods.
 *
 */
import $ from "properjs-hobo";
import ImageLoader from "properjs-imageloader";
import config from "./config";
import detect from "./detect";


/**
 *
 * @description Module onImageLoadHander method, handles event
 * @method isElementLoadable
 * @param {object} el The DOMElement to check the offset of
 * @memberof core.util
 * @returns {boolean}
 *
 */
const isElementLoadable = function ( el ) {
    let ret = false;

    if ( el ) {
        const bounds = el.getBoundingClientRect();

        ret = ( bounds.top < (window.innerHeight * 2) );
    }

    return ret;
};


/**
 *
 * @description Module isElementVisible method, handles element boundaries
 * @method isElementVisible
 * @param {object} el The DOMElement to check the offsets of
 * @memberof core.util
 * @returns {boolean}
 *
 */
const isElementVisible = function ( el ) {
    let ret = false;

    if ( el ) {
        const bounds = el.getBoundingClientRect();

        ret = ( bounds.top < window.innerHeight && bounds.bottom > 0 );
    }

    return ret;
};


/**
 *
 * @description Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @memberof core.util
 * @returns {ImageLoader}
 *
 */
const loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || isElementLoadable);

    // Normalize the images
    images = (images || $( config.lazyImageSelector ));

    // Hook here to determine image variant sizes to load ?

    return new ImageLoader({
        elements: images,
        property: config.lazyImageAttr,
        executor: handler
    });
};


/**
 *
 * @description All true all the time
 * @method noop
 * @memberof core.util
 * @returns {boolean}
 *
 */
const noop = function () {
    return true;
};


/**
 *
 * @method getElementsInView
 * @memberof core.util
 * @param {Hobo} $nodes The collection to process
 * @param {function} executor Optional method to determin `in view`
 * @description Get elements within a loadable position on the page
 * @returns {Hobo}
 *
 */
const getElementsInView = function ( $nodes, executor ) {
    let i = $nodes.length;
    const ret = [];

    executor = (executor || isElementVisible);

    for ( i; i--; ) {
        if ( executor( $nodes[ i ] ) ) {
            ret.push( $nodes[ i ] );
        }
    }

    return $( ret );
};


/**
 *
 * @description Get the applied transition duration from CSS
 * @method getTransitionDuration
 * @param {object} el The DOMElement
 * @memberof util
 * @returns {number}
 *
 */
const getTransitionDuration = function ( el ) {
    let ret = 0;
    let duration = null;
    let isSeconds = false;
    let multiplyBy = 1000;

    if ( el ) {
        duration = getComputedStyle( el )[ detect.getPrefixed( "transition-duration" ) ];
        isSeconds = duration.indexOf( "ms" ) === -1;
        multiplyBy = isSeconds ? 1000 : 1;

        ret = parseFloat( duration ) * multiplyBy;
    }

    return ret;
};



/******************************************************************************
 * Export
*******************************************************************************/
export {
    noop,
    loadImages,
    isElementLoadable,
    isElementVisible,
    getElementsInView,
    getTransitionDuration
};
