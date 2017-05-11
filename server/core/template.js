const config = require( "./config" );
const consolidate = require( "consolidate" );



/**
 *
 * Template adapter setup.
 *
 */
consolidate.requires[ config.template.module ] = config.template.require;



module.exports = {
    render: consolidate[ config.template.module ],
    consolidate: consolidate
};
