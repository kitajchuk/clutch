module.exports = {
  "name": "Site",
  "description": "Sitewide, high-level settings.",
  "displayField": "title",
  "fields": [
    {
      "name": "Title",
      "id": "title",
      "type": "Symbol",
      "validations": [],
      "localized": false,
      "required": false,
      "disabled": false,
      "omitted": false
    },
    {
      "name": "URL",
      "id": "url",
      "type": "Symbol"
    },
    {
      "name": "Description",
      "id": "description",
      "type": "Symbol"
    },
    {
      "name": "Email",
      "id": "email",
      "type": "Symbol"
    },
    {
      "name": "Google Analytics Tag",
      "id": "googleUA",
      "type": "Symbol"
    },
    {
      "name": "Google Site Verification",
      "id": "googleVerify",
      "type": "Symbol"
    },
    {
      "name": "App Name",
      "id": "appName",
      "type": "Symbol"
    },
    {
      "name": "Logo Image ( can be svg )",
      "id": "appLogo",
      "type": "Link",
      "linkType": "Asset",
      "validations": []
    },
    {
      "name": "OG Image ( jpg or png )",
      "id": "appImage",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "Favicon Image ( png )",
      "id": "appFavicon",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-180x180 ( png )",
      "id": "appIOSIcon180x180",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-152x152 ( png )",
      "id": "appIOSIcon152x152",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-144x144 ( png )",
      "id": "appIOSIcon144x144",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-120x120 ( png )",
      "id": "appIOSIcon120x120",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-114x114 ( png )",
      "id": "appIOSIcon114x114",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-76x76 ( png )",
      "id": "appIOSIcon76x76",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-72x72 ( png )",
      "id": "appIOSIcon72x72",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-60x60 ( png )",
      "id": "appIOSIcon60x60",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "apple-icon-57x57 ( png )",
      "id": "appIOSIcon57x57",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "favicon-192x192 ( png )",
      "id": "appIcon192x192",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "favicon-96x96 ( png )",
      "id": "appIcon96x96",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "favicon-32x32 ( png )",
      "id": "appIcon32x32",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "favicon-16x16 ( png )",
      "id": "appIcon16x16",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "msapplication-TileColor",
      "id": "appMSTileColor",
      "type": "Symbol"
    },
    {
      "name": "msapp-icon-310x310logo ( png )",
      "id": "appMSIcon310x310",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "msapp-icon-310x150logo ( png )",
      "id": "appMSIcon310x150",
      "type": "Link",
      "linkType": "Asset",
      "validations": []
    },
    {
      "name": "msapp-icon-150x150logo ( png )",
      "id": "appMSIcon150x150",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "msapp-icon-70x70logo ( png )",
      "id": "appMSIcon70x70",
      "type": "Link",
      "linkType": "Asset"
    },
    {
      "name": "Navigation Items",
      "id": "navi",
      "type": "Array",
      "items": {
        "type": "Link",
        "linkType": "Entry",
        "validations": [
          {
            "linkContentType": [
              "page"
            ],
            "message": "You can only add Page types to the navigation"
          }
        ]
      },
      "validations": []
    }
  ]
};
