# Monster Workshop
Template calculator web app for [Pathfinder first edition](http://legacy.aonprd.com).

## How to Use
The website is live at http://monster-workshop.herokuapp.com. As it is hosted on Heroku's free plan the server can go to sleep. In that case the first page can take 10-20 seconds to load.

The current version does all its calculations on the server therefore Javascript is not required in the browser. That is likely to change in future versions.

## How to build
### Install Node.js and npm
The npm documentation has [instructions for installing Node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Install the dependencies
On the command line, move to the project's main folder then
run:

```npm install```

This will install all dependencies into folder `node_modules`.

### Run the server locally
```npm start```

This runs the app on port `8080` or on the port specified by environment variable `PORT`.

You can stop the server with Ctrl-C.

### Load the local app in your browser
If running on the default port, type `localhost:8080` in the browser address bar. As long as the server is running, the local version of the app should be displayed.

## Changelog
Changes are logged in CHANGELOG.md.