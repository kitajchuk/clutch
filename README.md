clutch
======

> A modern headless CMS scaffold for Prismic and Contentful.



### Outline

* [Example](#example)
* [Setup](#setup)
    * [AWS](#aws)
    * [Circle CI](#circle-ci)
* [Install](#install)
* [Headless](#headless)
    * [Prismic](#prismicio)
    * [Contentful](#contentful)
* [Express](#express)
* [Static](#static)
* [ProperJS](#properjs)
* [Resources](#resources)




### Example
This `clutch` scaffold is currently testing against a `staging` environment at [clutch.kitajchuk.com](http://clutch.kitajchuk.com/).

If you want to streamline the install you can use the [clutch-cli](https://github.com/kitajchuk/clutch-cli);



### Setup
First setup the **Clutch Stack** on AWS OpsWorks as defined [here](https://github.com/kitajchuk/clutch-chef). The `clutch-chef` repository is a Chef cookbook that configures the AWS EC2 instances for you.

#### AWS
Once the **Clutch Stack** is setup in OpsWorks, you can put your `staging` and `production` information in the `package.json` file for this project under the `config` property:

```js
"config": {
    "aws_ec2_staging_host": "[Elastic IP]",
    "aws_ec2_production_host": "[Elastic IP]"
}
```

This provides some useful `npm-run` commands for the project allowing you to connect to your instances via SSH as well as deploy directly to them if need be. Though you can deploy manually from your `sandbox`, it is recommended to utilize the Circle CI configuration for streamlined Continuous Integration and Deployment. Checkout the `npm-scripts` in the `package.json` and see the [section on Circle CI](#circle-ci) for this.

Here are some useful links for setting up other services on AWS.
* [S3 Buckets](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
* [IAM Users/Groups](http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-setup.html)
* [CloudFront CDN](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)



#### Circle CI
The Clutch scaffold is designed to provide [Continuous Integration](https://en.wikipedia.org/wiki/Continuous_integration) and [Continuous Deployment](https://en.wikipedia.org/wiki/Continuous_delivery#Relationship_to_continuous_deployment) using [Circle CI](http://circleci.com). In the project settings on Circle CI add the `clutch` SSH key for your instances. You can also input all the needed environment variables in Circle CI used in the `Circlefile`. The default list included is as follows:

* AWS_USER — `ec2-user` by default
* AWS_DEST — `/var/www/html/` by default
* AWS_STAGING_HOST — IP for staging instance
* AWS_PRODUCTION_HOST — IP for production instance
* S3_BUCKET — The name of the S3 bucket
* S3_REGION — The region field for the S3 bucket
* S3_ACCESS_KEY — The IAM role access key
* S3_SECRET_KEY — The IAM role secret key



### Install
* Download this template
* CD into the directory and run `npm run bootstrap`
* Now run `npm start`

This will load the Clutch example connected to a Prismic repository. Optionally, you can toggle the `api` config in `clutch.config.js` to see it work with a Contentful space. Magic...

The following section will cover the differences between getting started with either [Prismic](#prismicio) or [Contentful](#contentful).



### Headless CMS
Clutch aims to be a simple, adapter-based scaffold for building modern wep applications. It's design uses a simple ORM adapter concept to normalize the high-level data structures. From there the system leaves the doors open for you to build, template and work with your data in its provided service format.

#### Prismic.io
Prismic does not have a CMS API so you have to manually paste the initial content-type JSON yourself in the CMS:

* Create your Prismic repository
* Add your api url and access token info to `clutch.config.js`
* Make sure the `adapter` property is set to `prismic`
* In your repository create a single content type called `Site`
* In your repository create a repeatable content type called `Page`
* Using the `JSON` editor paste in the respective contents of the files in `models`
* You can now create your `Site` document and apply its settings
* You can create `Page` documents and add them to the `Site` navigation as needed
* Now go to town and make something cool...

To create your first sandbox `preview` site go to Settings -> Previews. Use `localhost` for the Site name and `http://localhost:8001/preview/` for the Preview URL.

#### Contentful
Contentful has a CMS API and does not have manual JSON entry for creating content-types.

* Create your Contentful space
* Create a new Content delivery/preview token set called `Clutch`
* Add your space, CDN and preview token info to `clutch.config.js`
* Create a new Content management token called `Clutch`
* Copy your CMT token and put it in a file at `./sandbox/contentful.management.token`
* Make sure the `adapter` property is set to `contentful`
* Execute `npm run bootstrap:contentful` to create the initial `Site` and `Page` content-types
* Now in Contentful you need to go into each content-type and click the Save button to activate them
* You can now create your `Site` entry and apply its settings
* You can create `Page` entries and add them to the `Site` navigation as needed
* Now go to town and make something cool...

To create your first sandbox `preview` site go to Settings -> Content preview. Use `localhost` for the Name and `http://localhost:8001/preview/?type=page&uid={entry_field.uid}` for the Preview URLs for your content-types, replacing `type=page` with the appropriate content-type for each checkbox.



### Express

#### URL
The Clutch node server is designed to access data in a convention over configuration approach. The format is `:type/:uid`. As long as you have posts in your CMS for the content-types and corresponding UIDs the system will successfully load your pages.

#### API
The Clutch node server also operates as a `JSON` API for your data. The format is `api/:type/:uid`. You can use the API for partial renderings if you pass `?format=html&template=yourtemplate` along with your request. Partials are loaded out of the `template/partials` directory.

#### Pub/Sub
The Clutch node server implements a pub/sub model for interacting with requests. You can subscribe to content-type requests and modify the `query` and `context` in any way you need. The `client`, `api`, and `query` objects passed to your `query` handlers will be representative of the CMS you are using. The `context` passed to your `context` handlers is the [ContextObject](https://github.com/kitajchuk/clutch/blob/master/server/class/ContextObject.js) instance.

The default `server/app.js` has a couple basic examples. You have to return either the `query` or a new `Promise` for your query handlers. When returning with a Promise you must resolve with an object that as a `results` Array or reject with an error message. For your `context` handlers you have to return the `context`.

```js
const config = require( "../clutch.config" );
const router = require( "./router" );



// :type, :handlers
router.on( "example", {
    query ( client, api, query, cache, req ) {
        // Must return either {query} OR Promise.
        // Promise must resolve with {results: [...]} or reject with "error"
        // return new Promise(( resolve, reject ) => {
        //     resolve({
        //         results: []
        //     });
        // });
        return query;
    },
    context ( context, cache, req ) {
        // Must return context. You can add to the context...
        // context.set( "foo", "bar" );
        return context;
    }
});



router.init();
```

#### Template
The Clutch node server uses [ejs](http://ejs.co) out of the box. The system is designed using [consolidate](https://www.npmjs.com/package/consolidate) so you can swap out for any template language you want that is supported by this module. You can change the defaults in `clutch.config.js` editing the `template.module` field.

The `template` anatomy:

* `template/index.html` — layout
* `template/pages` — path based templates
* `template/partials` — api partial templates
* `template/site` — structural layout level partials
* `template/**?` — you can organize any way you like from here :)

When working with templates you are looking at a normalized Template Context Object. You have normalized `site` and `navi` data structures created from your headless CMS `Site` content type. Depending on your content context you will either have an `item` object reference or an `items` array reference.

The Template Context Object tree:

```js
{
    site: {object},
    navi: [array],
    page: "string",
    cache: boolean?,
    error: "string",
    timestamp: number,
    item: {object},
    items: [array],
    stylesheet: "string",
    javascript: "string",
    config: {object}
}
```

The Navi Context Object tree:

```js
{
    id: "string",
    uid: "string",
    type: "string",
    slug: "string",
    title: "string",
    style: "string"
}
```



#### Environments
Clutch utilizes a 3 environment system to differentiate between local and remote instances.

* sandbox
* staging
* production



### Static
The `static` directory is the default static directory for the Express app. You can serve anything from here including `css`, `js`, `fonts`, `images` and so forth. The build pipeline distributes the `css` and `js` here by default as well. The static assets can be served by your app in one of three ways:

* From static directory on your Express app server ( this is the default )
* From an AWS S3 bucket synced with your static directory
* From an AWS CloudFront CDN in front of an AWS S3 bucket synced with your static directory



### ProperJS
Clutch bootstraps with the basic [ProperJS](https://github.com/ProperJS/app) web app architecture. You can see a full list of ProperJS modules on [npm](https://www.npmjs.com/org/properjs). This is all just preferred, you can use anything you like to build your web app.



### Resources
Just some general UI tools I find myself using on new projects.

* [Icongen](http://iconogen.com)
* [SVG Optimizer](https://petercollingridge.appspot.com/svg-editor)
