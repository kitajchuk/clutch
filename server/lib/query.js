const config = require( "../config" );



module.exports = require( `../adapters/${config.api.adapter}` );
