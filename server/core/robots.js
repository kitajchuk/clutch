const config = require( "../../clutch.config" );
const sitemap = require( `../generators/${config.api.adapter}.robots` );
const lager = require( "properjs-lager" );



lager.cache( "Clutch generating robots.txt" );



sitemap.generate().then(() => {
    lager.cache( "Clutch robots.txt generated" );
});
