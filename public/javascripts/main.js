$(function () {

  var $tooltip = $('[data-toggle="tooltip"]');
  var $form = $('form');
  var $submitBtn = $('#submit');
  var $features = $('.features');
  var $featureCheckboxes = $features.find("input:checkbox");
  var $featureAlert = $('.feature-alert');

  function getNumFeaturesChecked() {
    return $features.find("input:checkbox:checked").length;
  }

  function validateFeatureSelection($formData) {
    numSelected = getNumFeaturesChecked();
    if (numSelected > 0) {
      return true;
    } else {
      return false;
    }
  }

  $tooltip.on('click', function (e) {
    e.preventDefault();
  });
  $tooltip.tooltip();

  $featureCheckboxes.on('click', function (e) {
    // if the user selects a feature when the feature alert is visible, hide the alert
    if (getNumFeaturesChecked() > 0) {
      if (!$featureAlert.is(':hidden')) {
        $featureAlert.hide();
      }
    }
  });

  $form.on('submit', function (e) {

    if (!validateFeatureSelection($(this))) {
      e.preventDefault();
      $featureAlert.show();
    }
  });

});