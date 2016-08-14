$(function () {

  var $tooltip = $('[data-toggle="tooltip"]');
  var $form = $('form');

  var $submitBtn = $('#submit');
  var $connectionType = $('#connectionType');
  var $serialConfig = $('#serialConfig');
  var $ethernetConfig = $('#ethernetConfig');
  var $wifiConfig = $('#wifiConfig');
  var $macAddress = $('#macAddress');
  var $localIp = $('#localIpAddress');
  var $wifiLocalIp = $('#wifiLocalIpAddress');
  var $subnetMask = $('#subnetMask');
  var $gatewayIp = $('#gatewayIp');
  var $remoteHost = $('#remoteHost');
  var $remoteIp = $('#remoteIp');
  var $uipEthernet = $('#uipEthernet');
  var $configError = $('#configError');
  var $submitError = $('#submitError');
  var $securityType = $('#securityType');
  var $wpaPassphrase = $('#wpaPassphrase');
  var $wepKey = $('#wepKey');
  var $wepIndex = $('#wepIndex');
  var $wifiConnectionType = $('#wifiConnectionType');
  var $wifiServerIp = $('#wifiServerIp');

  var $features = $('.features');
  var $controller = $('.controller');
  var $ipAddress = $('.ipAddress');
  var $port = $('.port');

  var $featureCheckboxes = $features.find("input:checkbox");

  var configErrors = {};
  var submitErrors = {};
  var defaultConnectionType = "serial";
  var connectionType = defaultConnectionType;

  var errorTypes = {
    CONFIG: "config",
    REMOTE: "remote",
    MAC: "mac",
    NO_REMOTE: "noRemote",
    PORT: "port",
    FEATURE: "feature"
  };

  if(!('keys' in Object)) {
    Object.prototype.keys = function(data) {
      var keys = [];
      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          keys.push(prop);
        }
      }
      return keys;
    }
  }

  // make sure serial is selected on page load
  $connectionType.val(defaultConnectionType);

  function getNumFeaturesChecked() {
    return $features.find("input:checkbox:checked").length;
  }

  function validateFeatureSelection($formData) {
    if (getNumFeaturesChecked() > 0) {
      return true;
    } else {
      return false;
    }
  }

  function validateIp(ip) {
    if (/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
      return true;
    } else {
      return false;
    }
  }

  function validateMac(mac) {
    // from: http://stackoverflow.com/questions/4260467/what-is-a-regular-expression-for-a-mac-address
    if (/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test(mac)) {
      return true;
    } else {
      return false;
    }
  }

  function validatePort(port) {
    if (port && port >= 0 && port <= 65536) {
      return true;
    } else {
      return false;
    }
  }

  $tooltip.on('click', function (e) {
    e.preventDefault();
  });
  $tooltip.tooltip();

  $connectionType.on('change', function (e) {
    var val = e.target.value;
    removeAllErrors($configError, configErrors);
    removeAllErrors($submitError, submitErrors);
    switch (val) {
    case "serial":
      $ethernetConfig.hide();
      $wifiConfig.hide();
      $serialConfig.show();
      break;
    case "ethernet":
      $serialConfig.hide();
      $wifiConfig.hide();
      $ethernetConfig.show();
      break;
    case "wifi":
      $serialConfig.hide();
      $ethernetConfig.hide();
      $wifiConfig.show();
      break;
    }
    connectionType = val;
  });

  $controller.on('change', function (e) {
    if (e.target.value === "YUN") {
      $macAddress.hide();
      $localIp.hide();
    } else {
      $macAddress.show();
      $localIp.show();
    }

    if (e.target.value === "ENC28J60") {
      $uipEthernet.show();
    } else {
      $uipEthernet.hide();
    }
  });

  $securityType.on('change', function (e) {
    if (e.target.value === "wpa") {
      $wepKey.hide();
      $wepIndex.hide();
      $wpaPassphrase.show();
    } else if (e.target.value === "wep") {
      $wpaPassphrase.hide();
      $wepKey.show();
      $wepIndex.show();
    } else {
      $wepKey.hide();
      $wepIndex.hide();
      $wpaPassphrase.hide();
    }
  });

  function displayValidationState($context, isValid) {
    if (isValid) {
      $context.removeClass('has-error');
    } else {
      $context.addClass('has-error');
    }
  }

  function getIpType($el) {
    var name = $el.attr('name');
    return name;
  }

  function getErrorCount(errorCollection) {
    return Object.keys(errorCollection).length;
  }

  function displayError($el, errorCollection, type, msg) {
    errorCollection[type] = msg;
    $el.show();
    var text = $el.find('.errorText');
    text.text(msg);
  }

  function removeError($el, errorCollection, type) {
    if (!errorCollection[type]) {
      return;
    }
    delete errorCollection[type];
    var numErrors = getErrorCount(errorCollection);
    if (numErrors === 0) {
      $el.hide();
    } else {
      var key = Object.keys(errorCollection)[numErrors - 1];
      displayError($el, errorCollection, key, errorCollection[key]);
    }
  }

  function displayConfigError(type, msg) {
    displayError($configError, configErrors, type, msg);
  }

  function removeConfigError(type) {
    removeError($configError, configErrors, type);

    if (getErrorCount(configErrors) === 0) {
      if (submitErrors[errorTypes.CONFIG]) {
        removeSubmitError(errorTypes.CONFIG);
      }
    }
  }

  function displaySubmitError(type, msg) {
    displayError($submitError, submitErrors, type, msg);
  }

  function removeSubmitError(type) {
    removeError($submitError, submitErrors, type);
  }

  function removeAllErrors($el, errorCollection) {
    if (getErrorCount(errorCollection) === 0) {
      return;
    }
    $el.hide();
    errorCollection = {};
  }

  function enforceRemoteHostvsIp() {
    if ($remoteIp.val() && $remoteHost.val()) {
      displayConfigError(errorTypes.REMOTE, "Only enter a remote IP or remote host, not both");
    } else {
      removeConfigError(errorTypes.REMOTE);

      if ($remoteIp.val() || $remoteHost.val()) {
        removeSubmitError(errorTypes.NO_REMOTE);
      }
    }
  }

  $wifiLocalIp.on('change', function (e) {
    var address = e.target.value;
    var isValid = validateIp(address);
    if (isValid) {
      $subnetMask.show();
      $gatewayIp.show();
    } else {
      $subnetMask.hide();
      $gatewayIp.hide();
      $subnetMask.find('input').val("");
      $gatewayIp.find('input').val("");
      removeConfigError("subnetMask");
      removeConfigError("gatewayIp");
    }
  });

  $ipAddress.on('change', function (e) {
    var isValid = validateIp(e.target.value) || e.target.value === "";
    var iPType = getIpType($(e.target));
    displayValidationState($(this), isValid);
    if (!isValid) {
      displayConfigError(iPType, "A valid IP address is required (e.g. 192.168.0.1)");
    } else {
      removeConfigError(iPType);
    }
  });

  // ethernet
  $macAddress.on('change', function (e) {
    var isValid = validateMac(e.target.value);
    displayValidationState($(this), isValid);
    if (!isValid) {
      displayConfigError(errorTypes.MAC, "A valid MAC address is required (DE:AA:BB:CC:DD:01)");
    } else {
      removeConfigError(errorTypes.MAC);
    }
  });

  $port.on('change', function (e) {
    var isValid = validatePort(e.target.value);
    displayValidationState($(this), isValid);
    if (!isValid) {
      displayConfigError(errorTypes.PORT, "A valid Port is required (0 - 65536)");
    } else {
      removeConfigError(errorTypes.PORT);
    }
  });

  $remoteHost.on('change', function (e) {
    enforceRemoteHostvsIp();
  });

  $remoteIp.on('change', function (e) {
    enforceRemoteHostvsIp();
  });

  $wifiConnectionType.on('change', function (e) {
    var type = e.target.value;
    if (type === "tcpClient") {
      $wifiServerIp.show();
    } else {
      $wifiServerIp.hide();
      $wifiServerIp.find('input').val("");
      removeConfigError("wifiServerIp");
    }
  });

  $featureCheckboxes.on('click', function (e) {
    if (getNumFeaturesChecked() > 0) {
      removeSubmitError(errorTypes.FEATURE);
    }
  });

  $form.on('submit', function (e) {

    if (connectionType === "ethernet" && !$remoteIp.val() && !$remoteHost.val()) {
      e.preventDefault();
      displaySubmitError(errorTypes.NO_REMOTE, "You must enter either a remote IP or remote host");
      return;
    }

    if ((connectionType === "ethernet" || connectionType === "wifi") && getErrorCount(configErrors) > 0) {
      e.preventDefault();
      displaySubmitError(errorTypes.CONFIG, "Correct configuration errors above");
      return;
    }

    if (!validateFeatureSelection($(this))) {
      e.preventDefault();
      displaySubmitError(errorTypes.FEATURE, "You must select at least one feature");
    }
  });

});