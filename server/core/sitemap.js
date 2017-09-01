const config = require( "../../clutch.config" );
const sitemap = require( `../generators/${config.api.adapter}.sitemap` );
const lager = require( "properjs-lager" );



lager.cache( "Clutch generating sitemap.xml" );



sitemap.generate().then(() => {
    lager.cache( "Clutch sitemap.xml generated" );
});
