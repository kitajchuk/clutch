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
     * @member ENV
     * @memberof core.env
     * @description The applied environment ref.
     *              Looks at domain to determine ENV as `DEV` or `PROD`
     *
     */
    ENV: (/^localhost|^dev|^[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}/g.test( document.domain ) ? DEV : PROD),


    /**
     *
     * @method get
     * @memberof core.isDev
     * @description Returns true for sandbox and development environments
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
     * @description Returns true for production.
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