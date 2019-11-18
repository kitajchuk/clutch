const DEV = "development";
const PROD = "production";


/**
 *
 * @public
 * @namespace env
 * @memberof core
 * @description Set the app environment.
 *
 */
const env = {
    /**
     *
     * @member DEV
     * @memberof core.env
     * @description The development environment CONST.
     *
     */
    DEV: DEV,


    /**
     *
     * @member PROD
     * @memberof core.env
     * @description The production environment CONST.
     *
     */
    PROD: PROD,


    /**
     *
     * @member ENV
     * @memberof core.env
     * @description The applied environment ref.
     *
     */
    ENV: (/^dev|localhost|^[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}/g.test( document.domain ) ? DEV : PROD),


    /**
     *
     * @method get
     * @memberof core.isDev
     * @description Returns the dev mode status.
     * @returns {boolean}
     *
     */
    isDev () {
        return (this.ENV === DEV);
    },


    /**
     *
     * @method get
     * @memberof core.isProd
     * @description Returns the dev mode status.
     * @returns {boolean}
     *
     */
    isProd () {
        return (this.ENV === PROD);
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default env;
