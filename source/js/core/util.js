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
 * @description Add pixel units when inline styling
 * @method px
 * @param {string} str The value to pixel-ify
 * @memberof core.util
 * @returns {string}
 *
 */
const px = function ( str ) {
    return `${str}px`;
};


/**
 *
 * @description Apply a translate3d transform
 * @method translate3d
 * @param {object} el The element to transform
 * @param {string|number} x The x value
 * @param {string|number} y The y value
 * @param {string|number} z The z value
 * @memberof core.util
 *
 */
const translate3d = function ( el, x, y, z ) {
    el.style[ detect.getPrefixed( "transform" ) ] = `translate3d( ${x}, ${y}, ${z} )`;
};


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
    // images.forEach(( image, i ) => {
    //     const data = images.eq( i ).data();
    //
    //     // data-img-size="[width, height]"
    //     if ( data.imgSize ) {
    //         image.className += ` image--${data.imgSize[ 0 ] > data.imgSize[ 1 ] ? "wide" : "tall"}`;
    //     }
    // });

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
 * @method getElementDuration
 * @param {object} el The DOMElement
 * @param {string} key The duration type to get eg `transition` or `animation`
 * @memberof util
 * @returns {number}
 *
 */
const getElementDuration = function ( el, key ) {
    let ret = 0;
    let duration = null;
    let isSeconds = false;
    let multiplyBy = 1000;

    key = key || "transition";

    if ( el ) {
        duration = getComputedStyle( el )[ detect.getPrefixed( `${key}-duration` ) ];
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
    px,
    noop,
    loadImages,
    translate3d,
    isElementLoadable,
    isElementVisible,
    getElementsInView,
    getElementDuration
};
