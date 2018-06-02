/*
  Copyright (c) 2015-2018 Jeff Hoefs. All rights reserved.

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

var getWiFiSecurityType = function(connectionParams) {
  var securityType = {};
  var securityParams = {};
  if (connectionParams.securityType && connectionParams.securityType === "wpa") {
    securityParams.passphrase =
      connectionParams.wpaPassphrase ? connectionParams.wpaPassphrase : "your_wpa_passphrase";
    securityType.wpa = securityParams;
  } else if (connectionParams.securityType && connectionParams.securityType === "wep") {
    securityParams.key = connectionParams.wepKey ? connectionParams.wepKey : "your_wep_key";
    securityParams.index = connectionParams.wepIndex ? connectionParams.wepIndex : 0;
    securityType.wep = securityParams;
  } else {
    securityType.none = "NONE";
  }
  return securityType;
}

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
        controller: connection.ethernetController,
        remoteIp: connection.ethernetRemoteIp,
        remoteHost: connection.ethernetRemoteHost,
        localIp: connection.ethernetLocalIp,
        remotePort: connection.ethernetRemotePort,
        mac: connection.mac
      }
    }
  } else if (connection.connectionType === "wifi") {
    return {
      wifi: {
        controller: connection.wifiController,
        remoteServerIp: connection.wifiRemoteServerIp,
        networkPort: connection.wifiPortNumber,
        localIp: connection.wifiLocalIp,
        subnetMask: connection.subnetMask,
        gatewayIp: connection.gatewayIp,
        ssid: connection.ssid,
        securityType: getWiFiSecurityType(connection)
      }
    }
  } else if (connection.connectionType === "ble") {
    return {
      ble: {
        controller: connection.bleController,
        localName: connection.bleLocalName,
        minInterval: connection.bleMinInterval,
        maxInterval: connection.bleMaxInterval
      }
    }
  }
};

router.get('/', function (req, res, next) {
  res.render('index', {
    coreFeatures: coreFeatures,
    contributedFeatures: contributedFeatures,
    controllers: builder.controllers,
    version: {tag: "2.10.1", url: "https://github.com/firmata/ConfigurableFirmata/releases/tag/2.10.1"}
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
