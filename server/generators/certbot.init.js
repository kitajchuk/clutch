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

// Install letsencrypt
child_process.execSync( `git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt` );
    report.push( "Installed letsencrypt" );


// Well-known for certbot authentication
child_process.execSync( `touch /var/www/html/.well-known` );


// Generate new certificates
// This works as long as the initial certs were created like so:
// /opt/letsencrypt/letsencrypt-auto --nginx --agree-tos --noninteractive --email YOUR_EMAIL -d YOUR_DOMAIN(S)
child_process.execSync( `/opt/letsencrypt/letsencrypt-auto --nginx --agree-tos --redirect --noninteractive --email ${config.letsencrypt.email} -d ${config.letsencrypt.domains[process.env.NODE_ENV].join( "," )}` );
    report.push( "Generated new Certbot certificates" );


// Clean up well-known
child_process.execSync( `rm -rf /var/www/html/.well-known` );


// Declare our mission successful!
child_process.execSync( `echo "================================
Cron Job Report
$(date)
================================
${report.join( "\n" )}
================================
"  > /var/www/html/.clutch/certbot.auto.log` );
