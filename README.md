## Prerequisites

- node
- npm
- nodemon (optional)

```
// if using nodemon
npm install -g nodemon
```

## Setup

```
npm install
```

## Run locally

```
nodemon app.js
```

## Deploy

TODO - figure out a contributor-friendly automated deploy flow.

Until then, only the project admin (@soundanalogous) can deploy.

```
cd /var/www/firmatabuilder.com
git pull origin master
npm update (only if there are changes to firmata-builder or other modules)
pm2 restart app
```
