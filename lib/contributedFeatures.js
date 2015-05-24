/**
 * All Firmata features.
 * Newly added features need to be added to this file.
 *
 * Additional data will be necessary such as links to repositories
 * for Firmata device libraries as well as links to 3rd party dependencies
 */
var contributedFeatures = {
  "FirmataEncoder": {
    className: "FirmataEncoder",
    instanceName: "encoder",
    reporting: true,
    url: "https://github.com/firmata/FirmataEncoder",
    dependencies: [
      {
        url: "https://www.pjrc.com/teensy/td_libs_Encoder.html",
        className: "Encoder"
      }
    ]
  }
};

module.exports = contributedFeatures;
