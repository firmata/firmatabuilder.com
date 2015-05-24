var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');

var builder = require('../lib/builder.js');
var coreFeatures = require('../lib/coreFeatures.js');
var contributedFeatures = require('../lib/contributedFeatures');

var parseFeatures = function (data) {
  var features = [];
  for (var key in data) {
    if (key.indexOf('feature-') != -1) {
      features.push(key.split('-')[1]);
    }
  }
  return features;
};

var parseConnection = function (data) {
  var connection = {};

  for (var key in data) {
    if (key === "connectionType") {
      connection.connectionType = data[key];
    }
    if (key === "baud") {
      connection.baud = data[key];
    }
  }

  if (connection.connectionType === "serial") {
    return {
      serial: {baud: connection.baud}
    }
  }

};

router.get('/', function (req, res, next) {
  res.render('index', {
    coreFeatures: coreFeatures,
    contributedFeatures: contributedFeatures,
    version: "v2.7.0"
  });
});

router.post('/', function (req, res, next) {

  var zip = new AdmZip();

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

  zip.addFile(filename + '/' + filename + '.ino', new Buffer(outputText));
  res.attachment(filename + '.zip');
  res.send(zip.toBuffer());

});

module.exports = router;
