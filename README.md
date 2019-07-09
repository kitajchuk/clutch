clutch
======

> A modern headless CMS SDK for Prismic.io.



<img style="width:100%;" src="https://static1.squarespace.com/static/5925b6cb03596e075b56bfe2/5d059cfabc404e0001103362/5d059ef873542100013b0b53/1562516926893/Kitajchuk_ProperJS_Coverimage.jpg?format=2500w" />



## Hello
This README file outlines how to get up and running with a Clutch Stack. Its presented in proper order of operations. The documentation assumes some key things about you as a developer:

* You know well and work with [AWS](https://aws.amazon.com)
* You know well and work with [Prismic](https://prismic.io)
* You know well and work with [CircleCI](https://circleci.com)
* You know well and work with [Node.js](https://nodejs.org)
* You know well and work with one of the template languages [here](https://www.npmjs.com/package/consolidate)



## Table of Contents
* [Walkthrough](#walkthrough)
    * [Code setup 01](#code-setup-round-1)
    * [AWS setup](#aws-setup)
        * [S3 setup](#s3-setup)
        * [CDN setup](#cloudfront-setup)
        * [DNS setup](#route-53-setup)
    * [Prismic setup](#headless-cms-setup--prismic-)
    * [Code setup 02](#code-setup-round-2)
    * [Circle CI setup](#circle-ci-setup)
* [Ecosystem](#ecosystem)
    * [Environments](#environments)
        * [API](#api)
        * [Pub/Sub](#pubsub)
    * [Server](#server)
    * [Template](#template)
* [Resources](#resources)



## Walkthrough



### Code Setup Round 1
This walks through creating your new Clutch project.

* Install the [clutch-cli](https://github.com/kitajchuk/clutch-cli) by running `npm i -g clutch-cli`;
* Wherever you keep projects on your computer, make a new directory for `your.new.project`
* Then `cd` into that directory and run `clutch init`



### AWS Setup
Create the `Clutch Stack` within [AWS OpsWorks](https://aws.amazon.com/opsworks) using the [clutch-chef recipe documentation](https://github.com/kitajchuk/clutch-chef). Make sure you hold onto that `clutch.pem` file you get from setting up a Key Pair as you'll use it later to store the Fingerprint in Circle CI for SSH Permissions. You can keep it in `.clutch` for `ssh` access to your instance. The preferred option is to store your public key on each instance in the `/home/ec2-user/.ssh/authorized_keys` file.

#### Letsencrypt Setup
Assuming you can now `ssh` cleanly into your instances, here's how you can setup letsencrypt for `https`! SSH into your instance and stop the node servers. Then remove any iptable forwarding for node. Then run these commands:
* `sudo -s`
* `iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000`
* `git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt`
* `touch /var/www/html/.well-known`
* `/opt/letsencrypt/letsencrypt-auto --debug`
    * Prompt answers in order: 2 ( for nginx ), your email ( eg foo@bar.com ), A, N, your domains ( eg. foo.com www.foo.com ), 2 ( redirect https )
* Screenshot the "IMPORTANT NOTES" for safe keeping
* `rm -rf /var/www/html/.well-known`
* `iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000`
* `iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8443`
* Deploy any necessary contents of `.clutch` to your instance using `npm run deploy:clutch:{env}`

#### S3 Setup
This is optional, however you can create an [S3](https://aws.amazon.com/s3) bucket on AWS and add the bucket URL to the `clutch.config.js` as your `aws.cdn` value. Likewise, change the `aws.cdnOn` value to `true`. Next you'll need to create an [AWS IAM](https://aws.amazon.com/iam) user and group and save the access key and secret key so you can add them to Circle CI later.

#### CloudFront Setup
This is even more optional, but if you need a real CDN you can spin up a [CloudFront](https://aws.amazon.com/cloudfront) Distribution and attach it to your S3 bucket. If you do this you'll want to update the `aws.cdn` value in the `clutch.config.js` file with your CloudFront URL.

#### Route 53 Setup
If you plan on launching your website you'll likely need to setup the DNS in [Route 53](https://aws.amazon.com/route53). You'll add a hosted zone for your domain. Then you'll create record sets. So a full Clutch Stack for [kitajchuk.com](http://kitajchuk.com) would at least need you to create these records for the hosted zone:

* An `A` Record for kitajchuk.com
* An `A` Record for www.kitajchuk.com
* An `A` Record for staging.kitajchuk.com



### Headless CMS Setup ( Prismic )
These steps cover the basics of bootstrapping Prismic for Clutch.

* Create your Prismic repository in your [dashboard](https://prismic.io/dashboard)
* In your repository Settings under Previews add the following sites:
    * Site name: sandbox, Preview URL: http://localhost:8001/preview/
    * Site name: staging, Preview URL: `your.aws.staging.ip`
    * Site name: production, Preview URL: `your.aws.production.ip`
* In your repository Settings under API & Security do the following:
    * Enable the API Endpoint CDN if it isn't already on
    * Choose Open API for your Repository security level
    * If you need to use a Private API, choose that
        * Under the Generate an Access Token section enter a name and click Add this application
        * This makes an app config with oAuth and token access
        * Under the application settings you just made copy the Permanent access tokens - Access to master
        * Create a file at `.clutch/prismic.access.token` and paste the token in that file
        * Next in `clutch.config.js` change `api.token` to `true`
        * Run the .clutch deploy scripts so your instances have access to these tokens
            * `npm run deploy:clutch:staging`
            * `npm run deploy:clutch:production`
* In your repository Settings under Webhooks:
    * Enter the URL for your site: `http://your.site.com/webhook/`
    * Enter a Secret, I use [randomkeygen](https://randomkeygen.com/)
    * Create the file `.clutch/prismic.webhook.secret` and put the key in this file
    * Click "Add this webhook"
    * Clutch will now listen for webhooks, see `server/core/router.js`
* In your repository Custom Types create a Single type called `Site`
    * In the configuration for this type paste the contents of `models/Site.prismic.json` in the JSON editor
* In your repository Custom Types create a Repeatable type called `Page`
    * In the configuration for this type paste the contents of `models/Page.prismic.json` in the JSON editor
* In your repository Content workspace create a new instance of the `Site` model
    * Enter your details, these are high level site-wide settings that will be exposed in your templates
* In your repository Content workspace create a new instance of the `Page` model
    * Call it `Home` with the slug `home` and a description
* Jump back over to your `Site` instance, click the Navigation tab and add a navigation item for the `Home` page linking it to the actual page document
* You can follow the steps for making the `Home` page and create the `Example` page



### Code Setup Round 2
This walks through adding the final details to your Clutch project and pushing it to Github.

* In the root `package.json` file enter your AWS EIPs for `config.aws_ec2_staging_host` and `config.aws_ec2_production_host`
* Create your new repository on Github
* From the root of your new Clutch project source code initialize the repository `git init`
* Add the clutch source files `git add .`
* Make your first commit `git commit -m "clutch bootstrap"`
* Add the remote origin `git remote add origin git@github.com:your.username/your.repository.name.git`
* Push the source code up to Github `git push -u origin master`
* Create the dev branch `git checkout -b dev`
* Push the dev branch `git push origin dev`
* On the Github website for you new repository settings click the branches tab and set dev as the new default branch
*



### Circle CI Setup
Now that AWS and Prismic are setup and the code is on Github you can connect your project repository to Circle CI. Under the repository settings in Circle CI you'll need to add the SSH key from your `clutch.pem` file you created while setting up the AWS OpsWorks Clutch Stack under SSH Permissions. Then you'll need to add the following environment variables:

* AWS_USER: `ec2-user`
* AWS_DEST: /`var/www/html/`
* AWS_STAGING_HOST: `your.aws.staging.ip`
* AWS_PRODUCTION_HOST: `your.aws.production.ip`

If you decided to use an S3 bucket then you'll also need add the bucket information and IAM credentials in the Circle CI environment variables:

* S3_BUCKET: `aws.s3.bucket.name`
* S3_REGION: `aws.s3.bucket.region`
* S3_ACCESS_KEY: `aws.iam.access.key`
* S3_SECRET_KEY: `aws.iam.secret.key`

From the Circle CI website you can now run your first build for your dev branch which will deploy to your AWS staging instance.



## Ecosystem
This section breaks down aspects of the Clutch SDK ecosystem which is rooted in node.



### Environments
The Clutch SDK assumes 3 specific environments for your workflow.

* sandbox ( local development )
* staging ( aws dev instance )
* production ( aws live prod instance )

Some behaviors to note when working with Clutch and environments:

* If you're using an S3 bucket it will only be utilized on `production`
* Likewise if you're using a CDN it also will only be used on `production`
* AppCache is enabled for `production` only by default ( I recommend leaving this as is )
* All that in mind it should be no surprise that Webpack only gzips for `production`



### Server
The Clutch node server uses a convention over configuration approach in regards to accessible endpoints. The URI format is `:content-type/:uid`. When working with Prismic you can define Collections around documents. When you do this Clutch will first attempt to see if `:content-type` is a Collection first before resolving to the root idea of a content-type. A good example case is to have a content-type called `Casestudy`. You may not want your URLs to be `/casestudy/some-title`. Maybe you want it to be `/work/some-title`. If you create a Collection called `work` and add the Casestudy content-type as a filter you can then use the `/work/some-title` URL format.

#### API
The Clutch node server also operates as a `JSON` API for your data. The format is `/api/:content-type/:uid`. You can use the API for partial renderings if you pass `?format=html&template=name.of.template` along with your request. Partials are loaded out of the `/template/partials` directory.

#### Pub/Sub
The Clutch node server implements a pub/sub model for interacting with requests. You can subscribe to content-type requests and modify the `query` and `context` in any way you need. The `client`, `api`, and `query` objects passed to your `query` handlers will be representative of the CMS you are using. The `context` passed to your `context` handlers is the [ContextObject](https://github.com/kitajchuk/clutch/blob/master/server/class/ContextObject.js) instance.

The default `server/app.js` has a couple basic examples. You have to return either the `query` or a new `Promise` for your query handlers. When returning with a Promise you must resolve with an object that as a `results` Array or reject with an error message. For your `context` handlers you have to return the `context`.



### Template
The Clutch node server uses the same convention for templates as it does for endpoints. It looks up endpoints in the `/template/pages` location. So reusing our Casestudy example from the [server](#server) docs we could make a `casestudy.html` file in the `pages` directory and that would render for Casestudy endpoints. We could also make the `work.html` file to utilize the Collection filter functionality of Prismic. The core `template` anatomy is as follows:

* `template/index.html`: This is your layout
* `template/pages`: This is where endpoints lookup templates
* `template/partials`: This is where API partial endpoints lookup templates when using `/api/:content-type/:uid?format=html&template=name.of.template`
* `template/site`: These are core structural elements for the document like `nav` or `header` or `footer`
* `template/**?`: Of course you can make any folder structure you like. I often make a directory called `slices` when using [Prismic's dynamic slicezone functionality](https://prismic.io/blog/slices-builder-create-your-content-component-for-landing-pages).

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
    config: {object},
    dom: {[prismic-dom](https://github.com/prismicio/prismic-dom)}
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



## Resources
These are some general UI tools I find myself using on projects for various tasks.

* [Icongen](http://iconogen.com)
* [SVG Optimizer](https://petercollingridge.appspot.com/svg-editor)
