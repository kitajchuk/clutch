module.exports = {
   prismic: {
       apiAccess: "",
       accessToken: "",
       webhookSecret: ""
   },
   letsencrypt: {
       developmentPath: "",
       productionPath: "",
       email: "",
       privkey: "",
       cert: "",
       chain: "",
       domains: {
           development: ["DEVELOPMENT_DOMAIN"],
           production: ["PRODUCTION_DOMAIN", "PRODUCTION_DOMAIN_WWW"]
       }
   },
   clutch: {
       authorizationsToken: "",
       urls: {
           development: "DEVELOPMENT_URL",
           production: "PRODUCTION_URL"
       }
   }
};
