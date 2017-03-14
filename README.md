kitajchuk-template-prismic
==========================

> Boilerplate template and scaffold for Prismic.io projects on AWS.



### Getting Started

Download this template and install the packages with `npm install`. To run the project use `npm start`. This boots the Express server on port `8000` and Webpack. A browser-sync proxy server is started in the Webpack pipeline and will run on port `8001`. The project is configured for [Webpack version 2](https://webpack.js.org/guides/migrating) so familiarization there is good.


### Prismic

Once the [Prismic](http://prismic.io) respository is setup add the `Site` model and config. To do this create a new custom type called `Site` with a slug of `site` and paste the contents of `json/Site.json` into the editor. Save it. This model contains high-level app information that gets rendered in the `<head>` of your document. The API access endpoint can be added to `server/server.js` by swapping out the url value for the `apiAccess` variable.

[This repository](https://github.com/kitajchuk/kitajchuk-www) has some small helpful examples for using the Prismic API in template partials. You can see them in `template/partials`.

Here are some helpful links for working with Prismic API:
* [Developers Manual](https://prismic.io/docs/old/documentation/developers-manual)
* [API Documentation](https://prismic.io/docs/old/documentation/api-documentation)


### AWS

Once instances are configured on AWS download and add the pem file to `local/[pemfile]` for SSH scripts. Also swap out the placeholder values in the npm scripts — `[PEM_FILE_HERE]`, `[EC2_IP_HERE]` and in the Circlefile — `[EC2_IP_HERE]`.

Here are some useful links for working on AWS Linux boxes.
* [NGINX setup on EC2](https://gist.github.com/dragonjet/270cf0139df45d1b7690)
* [Node.js setup on EC2](https://codeforgeek.com/2015/05/setup-node-development-environment-amazon-ec2)
* [Node.js port forwarding](https://gist.github.com/kentbrew/776580)


### Github + Circle CI

Once the project is up on Github connect the repository to [Circle CI](http://circleci.com) by adding it as a build. In the project settings the AWS SSH key from the pem file needs to be added for the deploy steps in the build process.


### Node.js Server

The Express server uses `ejs` for template rendering by default. It uses the [consolidate](https://www.npmjs.com/package/consolidate) module so you can switch to any preferred template language before getting started. The server operates as an API for your Prismic data. You can request information in both `json` and rendered `html` format. Say you have a model in Prismic called `item`. You can use the endpoints `/api/item` and `/api/item?format=html` in your client-side application. There are injection points in `getData` method in `server/server.js` where you can manipulate queries to Prismic as you need for the project. For requesting `html` from the API you simply need a template to support it. For this example a template located at `template/partials/item.html` will be used. You can also pass a `template` parameter if you want something else. So `/api/item?format=html&template=items` would use a template at `templates/partials/items.html`. This convention is useful to differentiate between rendering a list of items vs one item since model names in Prismic are singular.

The `json` context for the index.html template looks like this:
```javascript
{
    site: {object},
    timestamp: {number},
    document: {object},
    documents: [array]
}
```

The `json` context for template partials looks like this:
```javascript
{
    site: {object},
    data: {
        document: {object},
        documents: [array]
    }
}
```

There are 3 node environments for the project.

* sandbox
* staging
* production



### Helpful links

* [Icongen](http://iconogen.com)
* [SVG Optimizer](https://petercollingridge.appspot.com/svg-editor)
