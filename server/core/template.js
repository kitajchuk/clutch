const config = require( "../../clutch.config" );
const consolidate = require( "consolidate" );



/**
 *
 * Template adapter setup.
 *
 */
consolidate.requires[ config.template.module ] = require( `${config.template.module}` );



module.exports = {
    render: consolidate[ config.template.module ],
    consolidate: consolidate
};
