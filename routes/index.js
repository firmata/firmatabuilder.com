/*
  firmatabuilder v0.1.1 - 2016-1-24
  Copyright (c) 2015-2016 Jeff Hoefs. All rights reserved.

  See file LICENSE-MIT for further informations on licensing terms.
*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

var firmataBuilder = require('firmata-builder');
var builder = firmataBuilder.builder;
var coreFeatures = firmataBuilder.coreFeatures;
var contributedFeatures = firmataBuilder.contributedFeatures;

var parseFeatures = function (data) {
  var features = [];
  for (var key in data) {
    if (key.indexOf('feature-') !== -1) {
      features.push(key.split('-')[1]);
    }
  }
  return features;
};

var parseConnection = function (data) {
  var connection = {};

  for (var key in data) {
    // exclude features
    if (key.indexOf('feature-') === -1) {
      connection[key] = data[key];
    }
  }

  if (connection.connectionType === "serial") {
    return {
      serial: {baud: connection.baud}
    }
  } else if (connection.connectionType === "ethernet") {
    return {
      ethernet: {
        controller: connection.controller,
        remoteIp: connection.remoteIp,
        remoteHost: connection.remoteHost,
        localIp: connection.localIp,
        remotePort: connection.remotePort,
        mac: connection.mac
      }
    }
  }
};

router.get('/', function (req, res, next) {
  res.render('index', {
    coreFeatures: coreFeatures,
    contributedFeatures: contributedFeatures,
    controllers: builder.controllers,
    version: {tag: "2.8.0", url: "https://github.com/firmata/ConfigurableFirmata/releases/tag/2.8.0"}
  });
});

router.post('/', function (req, res, next) {

  var archive = archiver('zip');
  var filename = req.body.filename || "ConfiguredFirmata";
  var defaultConnection = {serial: {baud: 57600}};
  var input = {};

  var connection = parseConnection(req.body);
  if (!connection) {
    connection = defaultConnection;
  }

  input.filename = filename;
  input.connectionType = connection;
  parseConnection(req.body);
  input.selectedFeatures = parseFeatures(req.body);

  var outputText = builder.build(input);

  // set the archive name
  res.attachment(filename + '.zip');

  archive.pipe(res);

  var fileName = path.join(filename, filename + '.ino')
  archive.append(new Buffer(outputText), {name: fileName})
  archive.finalize();

});

module.exports = router;
