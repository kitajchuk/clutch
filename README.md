kitajchuk-template-prismic
==========================

> Boilerplate template and scaffold for Prismic.io projects on AWS.



## TOC

* [Quickstart](#getting-started)
* [Prismic.io](#prismic)
* [Express.js](#prismic--express)
* [AWS](#aws)
* [Continuous Integration](#github--circle-ci)
* [Other Resources](#resources)



### Getting Started

Download this template and install the packages with `npm install`. To run the project use `npm start`. This boots the Express server on port `8000` and Webpack. A browser-sync proxy server is started in the Webpack pipeline and will run on port `8001`. The project is configured for [Webpack version 2](https://webpack.js.org/guides/migrating) so familiarization there is good.



### Prismic

Once the [Prismic](http://prismic.io) respository is setup add the models found in the `json` directory. You can create each model type and paste the JSON into the JSON Editor wholesale.

* Nav — Single type
* Site — Single type
* Page — Repeatable type

The API access endpoint under Settings/API & Security can be added to `server/config.js` by swapping out the url value for the `apiAccess` variable.

Here are some helpful links for working with Prismic API:
* [Developers Manual](https://prismic.io/docs/old/documentation/developers-manual)
* [API Documentation](https://prismic.io/docs/old/documentation/api-documentation)

Also, [this repository](https://github.com/kitajchuk/kitajchuk-www) has some small helpful examples for using the Prismic API in template partials. You can see them in `template/partials`.



### Prismic + Express

#### Previews
Prismic has built-in preview functionality for un-published content out of the box. This Express server supports previews using Prismic's `previewSession` cookie. You can click the `preview` icon from the writing room editor in Prismic and view un-published content. This assumes you have correctly setup your preview sites within your repository settings. These are useful links for referencing Prismic preview sites information.

* [Previews docs](https://prismic.io/docs/in-website-preview#?lang=javascript)
* [Previews blog](https://prismic.io/blog/preview-content-changes-in-your-website)

#### Endpoints

##### Pages
There are two main ways to request data from the server. The first is by standard URI structure. This loads templates from the `template/pages` directory. The server is designed to work relatively intelligently with your Prismic data. For instance, say you have a `custom type` called `item`. You can visit `yoursite.com/item` and expect the template located at `template/pages/item.html` to render.

Next say you want to see just one of the items that has a `uid` of `skateboard`. You can visit `yoursite.com/item/skateboard` and expect the same template above to render. This may seem odd, but you have the ability to distinguish in the template what you should render out. Each template is passed either `documents` or `document` data for rendering. So you would either render the `document` OR the `documents`.

You can also use paths that match up with Prismic `collections`. Say you make a collection and call it `items`. Then you whitelist your `item` custom type for this collection. You can now work with the same setup above but replace the singular "item" with the plural "items". This may create more desirable URI paths as you would now have `yoursite.com/items` and `yoursite.com/items/skateboard`. It's really up to you whether you prefer to utilize collections for this or not.

The `json` context for the page templates looks like this:
```javascript
{
    site: {object},
    page: {string},
    template: {string},
    timestamp: {number},
    document: {object},
    documents: [array],
    stylesheet: {string},
    javascript: {string}
}
```

##### Partials
The other way to request data is using the `/api/` endpoints. You can request information in both `json` and rendered `html` partial format. Say you have a model in Prismic called `item`. You can use the endpoints `/api/item` and `/api/item?format=html` in your client-side application. There are injection points in `getData` method in `server/server.js` where you can manipulate queries to Prismic as you need for the project. For requesting `html` from the API you simply need a template to support it. For this example a template located at `template/partials/item.html` will be used. You can also pass a `template` parameter if you want something else. So `/api/item?format=html&template=items` would use a template at `templates/partials/items.html`. This convention is useful to differentiate between rendering a list of items vs one item since model names in Prismic are singular.

The `json` context for template partials looks like this:
```javascript
{
    site: {object},
    document: {object},
    documents: [array]
}
```

#### Templates
The Express server works with [ejs](http://ejs.co) for template rendering by default. The good news is it uses the [consolidate](https://www.npmjs.com/package/consolidate) node module so you can switch to any preferred template language before getting started. All templates are located within the `template` directory. The `template/index.html` file is your site layout. The `pages` and `partials` work in conjunction with this template.

#### Environments
There are three node environments for the project.

* sandbox
* staging
* production



### AWS

This template is designed to compress ( gzip ) and deploy the contents of `static` to an S3 bucket attached to a CloudFront CDN. Check the `Circlefile` to understand that implementation. It uses [ProperJS/s3](https://github.com/ProperJS/s3) to perform the static directory sync. The template is a high-level architecture, however, and can absolutely be enhanced or simplified as needed for any given project.

Once the EC2 instances are configured with Elastic IPs on AWS, download and add the pem file to `local/[pemfile]` for SSH scripts. After configuring any other AWS stuff ( IAM, S3, CloudFront, Route 53 etc... ) you can input all the needed environment variables in CircleCI used in the `Circlefile`. The default list included is as follows:

* AWS_USER
* AWS_DEST
* AWS_STAGING_HOST
* AWS_PRODUCTION_HOST
* S3_BUCKET
* S3_REGION
* S3_ACCESS_KEY
* S3_SECRET_KEY

Here are some useful links for working on AWS Linux boxes.
* [NGINX setup on EC2](https://gist.github.com/dragonjet/270cf0139df45d1b7690)
* [Node.js setup on EC2](https://codeforgeek.com/2015/05/setup-node-development-environment-amazon-ec2)
* [Node.js port forwarding](https://gist.github.com/kentbrew/776580)

Here are some useful links for setting up services on AWS.
* [S3 Buckets](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
* [IAM Users/Groups](http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-setup.html)
* [CloudFront CDN](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)



### Github + Circle CI

Once the project is up on Github connect the repository to [Circle CI](http://circleci.com) by adding it as a build. In the project settings the AWS SSH key from the pem file needs to be added for the deploy steps in the build process.



### Resources

* [Icongen](http://iconogen.com)
* [SVG Optimizer](https://petercollingridge.appspot.com/svg-editor)
