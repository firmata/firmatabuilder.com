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

TODO - figure out an automated deploy flow.

Until then, login to server and:

```
cd /var/www/firmatabuilder.com
git pull origin master
npm update (only if there are changes to firmata-builder or other modules)
pm2 restart app
```
