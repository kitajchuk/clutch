"use strict";



/**
 *
 * Create letsencrypt certs
 *
 * https://letsencrypt.org/
 *
 *
 */
const config = require( "../../clutch.config" );
const child_process = require( "child_process" );
const fs = require( "fs" );
const path = require( "path" );
const report = [];


// Stop Clutch server
child_process.execSync( `cd /var/www/html/server && npm run stop` );
    report.push( "Stopped Clutch server" );


// Revert IP tables for cert authentication
try {
    child_process.execSync( `iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000` );
    child_process.execSync( `iptables -t nat -D PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8443` );
        report.push( "Reverted IP tables" );

} catch ( error ) {
    report.push( `Catch Error on IP Tables: ${error}` );
}


// Well-known for certbot authentication
child_process.execSync( `touch /var/www/html/.well-known` );


// Generate new certificates
// This works as long as the initial certs were created like so:
// /opt/letsencrypt/letsencrypt-auto --nginx --agree-tos --noninteractive --email YOUR_EMAIL -d YOUR_DOMAIN(S)
child_process.execSync( `/opt/letsencrypt/letsencrypt-auto --nginx --redirect --noninteractive -d ${config.letsencrypt.domains[process.env.NODE_ENV].join( "," )}` );
    report.push( "Generated new Certbot certificates" );


// Clean up well-known
child_process.execSync( `rm -rf /var/www/html/.well-known` );


// Reset IP tables
child_process.execSync( `iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000` );
child_process.execSync( `iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8443` );
    report.push( "Reset IP tables" );


// Restart Clutch server
child_process.execSync( `cd /var/www/html/server && npm run start:${process.env.NODE_ENV}` );
    report.push( "Restarted Clutch server" );


// Declare our mission successful!
child_process.execSync( `echo "================================
Cron Job Report
$(date)
================================
${report.join( "\n" )}
================================
"  > /var/www/html/.clutch/certbot.auto.log` );
