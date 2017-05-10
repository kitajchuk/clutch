clutch
======

> A modern headless CMS scaffold.



## TOC

* [Quickstart](#quickstart)
* [Headless](#headless)
    * [Prismic :+1:](#prismicio)
    * [Contentful? :thought_balloon: ](#contentful)
* [Express](#express)
* [ProperJS](#properjs)
* [AWS](#aws)
* [Circle CI](#circle-ci)
* [Resources](#resources)



### Quickstart
* Download this template
* CD into the directory and run `npm install`
* Now run `npm start`

This will load the Clutch example connected to a Prismic repository.



### Headless
Clutch aims to be a simple, adapter-based scaffold for building modern wep applications. It's design uses a simple ORM adapter concept to normalize the high-level data structures. From there the system leaves the doors open for you to build, template and work with your data in its provided service format.

#### Prismic.io
The Prismic adapter works out of the box. Prismic allows `JSON` authoring of content models so its a bit easier to do the initial setup.

* Create your Prismic repository
* Add your repositories API access key to `server/config.js`
* Make sure the `adapter` property is set to `prismic`
* In your repository create a single content type called `Site`
* In your repository create a repeatable content type called `Page`
* Using the `JSON` editor paste in the respective contents of the files in `models`
* You can now create your `Site` document and apply its settings
* You can create `Page` documents and add them to the `Site` navigation as needed

These are some helpful links for working with the Prismic platform.

* [Developers Manual](https://prismic.io/docs/old/documentation/developers-manual)
* [API Documentation](https://prismic.io/docs/old/documentation/api-documentation)
* [Previews docs](https://prismic.io/docs/in-website-preview#?lang=javascript)
* [Previews blog](https://prismic.io/blog/preview-content-changes-in-your-website)

#### Contentful
The Contentful adapter is in progess so hopefully its ready really soon ;)



### Express

#### URL
The Clutch node server is designed to access data in a convention over configuration approach. The format is `:type/:uid`. As long as you have content in your CMS for the types and UIDs your content will be loaded.

#### API
The Clutch node server also operates as a `JSON` API for your data. The format is `api/:type/:uid`. You can use the API for partial renderings if you pass `?format=html` along with your request. Partials are loaded out of the `template/partials` directory.

#### Template
The Clutch node server uses [ejs](http://ejs.co) out of the box. The system is designed using [consolidate](https://www.npmjs.com/package/consolidate) so you can swap out for any template language you want that is supported by this module. You can change the defaults in `server/config.js` editing the `template.module` and `template.requires` fields.

The `template` anatomy:

* `template/index.html` — layout
* `template/pages` — path based templates
* `template/partials` — api partial templates
* `template/site` — structural layout level partials
* `template/**?` — you can organize any way you like from here :)

When working with templates you are looking at a normalized Template Context Object. You have normalized `site` and `navi` data structures created from your headless CMS `Site` content type. Depending on your content context you will either have an `item` object reference or an `items` array reference.

The Template Context Object tree:

```js
// Tempate Context Object
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
    javascript: "string"
}

// The navi {object} context
{
    id: "string",
    uid: "string",
    type: "string",
    slug: "string",
    title: "string",
    style: "string"
}
```

Using the context object with `EJS`:

```html
<!-- The default intro template -->
<div class="intro js-intro screen ghost -wrap -fzero -text--center is-active">
    <div class="ghost__child">
        <img src="<%= locals.context.get( 'site' ).data.appLogo %>" class="intro__logo" />
    </div>
</div>

<!-- The default navi template -->
<nav class="navi js-navi screen ghost -exp-2 -wrap -fzero">
    <ul class="navi__ul ghost__child">
        <% locals.context.get( 'navi' ).items.forEach(( item ) => { %>
            <li class="navi__li">
                <a class="navi__a js-navi-a" href="<%= item.slug %>">
                    <%= item.title %>
                </a>
            </li>
        <% }) %>
    </ul>
</nav>

<!-- The default page example template -->
<!--
    Note that this example here is using Prismic document refs
    The portion `getText( 'page.title' )` is specific to the Prismic API
    Those CMS specific refs would be different if you used Contentful
-->
<div class="example -wrap -exp">
    <h1 class="h1"><%- locals.context.get( 'item' ).getText( 'page.title' ) %></h2>
    <p class="p -wrap-copy">
        <br />
        <br />
        <%- locals.context.get( 'item' ).getText( 'page.description' ) %>
    </p>
</div>
```

#### Environments
Clutch utilizes a 3 environment system to differentiate between local and remote instances.

* sandbox
* staging
* production



### ProperJS
Clutch bootstraps with the basic [ProperJS](https://github.com/ProperJS) web app architecture. You can see a full list of ProperJS modules on [npm](https://www.npmjs.com/org/properjs). This is all just preferred, you can use anything you like to build your web app.



### AWS
Clutch will integrate well with AWS if you want it to.

#### Setup
You can take advantage of this as much or as little as you want. At the grandest level Clutch will gzip the static directory and deploy it to an S3 bucket. Optionally, you can have that bucket origin attached to a CloudFront CDN.

But you can do as little as just configure an EC2 instance to deploy your app to. If you don't hook up S3, Clutch serves everything out of the static directory where your app is running minified and gzipped.

Here are some useful links for working on AWS Linux boxes.
* [NGINX setup on EC2](https://gist.github.com/dragonjet/270cf0139df45d1b7690)
* [Node.js setup on EC2](https://codeforgeek.com/2015/05/setup-node-development-environment-amazon-ec2)
* [Node.js port forwarding](https://gist.github.com/kentbrew/776580)

Here are some useful links for setting up services on AWS.
* [S3 Buckets](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
* [IAM Users/Groups](http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-setup.html)
* [CloudFront CDN](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)



### Circle CI
If your project is on Github or BitBucket you can connect it to [Circle CI](http://circleci.com) by adding it as a build. In the project settings on Circle CI add the SSH key for your EC2 instances. You can also input all the needed environment variables in Circle CI used in the `Circlefile`. The default list included is as follows:

* AWS_USER
* AWS_DEST
* AWS_STAGING_HOST
* AWS_PRODUCTION_HOST
* S3_BUCKET
* S3_REGION
* S3_ACCESS_KEY
* S3_SECRET_KEY



### Resources
Just some general UI tools I find myself using on new projects.

* [Icongen](http://iconogen.com)
* [SVG Optimizer](https://petercollingridge.appspot.com/svg-editor)
