clutch
======

> A modern headless CMS SDK for Prismic and Contentful.



![Clutch](https://static1.squarespace.com/static/5a20f625b7411c85e1015293/t/5ab2f92570a6ad9909ae9c7a/1521678629329/BK_Face_128x128.png)



## Hello
This README file outlines how to get up and running with a Clutch Stack. Its presented in proper order of operations. The documentation assumes some key things about you as a developer:

* You know well and work with [AWS](https://aws.amazon.com)
* You know well and work with [Prismic](https://prismic.io) or [Contentful](https://www.contentful.com)
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
    * [CMS setup](#headless-cms-setup-prismic)
    * [Code setup 02](#code-setup-round-2)
    * [Circle CI setup](#circle-ci-setup)



## Walkthrough



### Code Setup Round 1
This walks through creating your new Clutch project.

* Install the [clutch-cli](https://github.com/kitajchuk/clutch-cli) by running `npm i -g clutch-cli`;
* Wherever you keep projects on your computer, make a new directory for `your.new.project`
* Then `cd` into that directory and run `clutch init`



### AWS Setup
Create the `Clutch Stack` within [AWS OpsWorks](https://aws.amazon.com/opsworks) using the [clutch-chef recipe documentation](https://github.com/kitajchuk/clutch-chef). Make sure you hold onto that `clutch.pem` file you get from setting up a Key Pair as you'll use it later to store the Fingerprint in Circle CI for SSH Permissions.

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
* In your repository Custom Types create a Single type called `Site`
    * In the configuration for this type paste the contents of `models/Site.prismic.json` in the JSON editor
* In your repository Custom Types create a Repeatable type called `Page`
    * In the configuration for this type paste the contents of `models/Page.prismic.json` in the JSON editor
* In your repository Content workspace create a new instance of the `Site` model
    * Enter your details, these are high level site-wide settings that will be exposed in your templates
* In your repository Content workspace create a new instance of the `Page` model
    * Call it `Example` with the slug `example` and a description
* Jump back over to your `Site` instance, click the Navigation tab and add a navigation item for the `Example` page linking it to the actual page document



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
This is coming next!
