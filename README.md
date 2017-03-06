kitajchuk-template-prismic
==========================

> Boilerplate template and scaffold for Prismic.io projects on AWS.



### Getting Started

Download this template and install the packages with `npm install`. To run the project use `npm start`. This boots the Express server on port `8000` and Webpack. A browser-sync proxy server is started in the Webpack pipeline and will run on port `8001`. The project is configured for [Webpack version 2](https://webpack.js.org/guides/migrating) so familiarization there is good.


### Prismic

Once the [Prismic](http://prismic.io) respository is setup the API access endpoint can be added to `server/server.js` by swapping it out for the placeholder value — `[PRISMIC_API_ENDPOINT]`.


### AWS

Once instances are configured on AWS download and add the pem file to `local/[pemfile]` for SSH scripts. Also swap out the placeholder values in the npm scripts — `[PEM_FILE_HERE]`, `[EC2_IP_HERE]` and in the Circlefile — `[EC2_IP_HERE]`. Here are some useful links for working on AWS Linux boxes.

* [NGINX setup on EC2](https://gist.github.com/dragonjet/270cf0139df45d1b7690)
* [Node.js setup on EC2](https://codeforgeek.com/2015/05/setup-node-development-environment-amazon-ec2)
* [Node.js port forwarding](https://gist.github.com/kentbrew/776580)


### Github + Circle CI

Once the project is up on Github connect the repository to [Circle CI](http://circleci.com) by adding it as a build. In the project settings the AWS SSH key from the pem file needs to be added for the deploy steps in the build process.


### Node.js Server

The Express server uses `ejs` for template rendering by default. It uses the [consolidate](https://www.npmjs.com/package/consolidate) module so you can switch to any preferred template language before getting started. The server operates as an API for your Prismic data. You can request information in both `json` and rendered `html` format. Say you have a model in Prismic called `item`. You can use the endpoints `/api/item` and `/api/item?format=html` in your client-side application. There are injection points in `getData` method in `server/server.js` where you can manipulate queries to Prismic as you need for the project. For requesting `html` from the API you simply need a template to support it. For this example a template located at `template/partials/item.html` will be used. You can also pass a `template` parameter if you want something else. So `/api/item?format=html&template=items` would use a template at `templates/partials/items.html`. This convention is useful to differentiate between rendering a list of items vs one item since model names in Prismic are singular. The `json` context for template partials looks like this:

```javascript
{
    site: {object},
    data: {
        document: {object},
        documents: {object}
    }
}
```

There are 3 node environments for the project.

* sandbox
* staging
* production
