$(function () {

  var $tooltip = $('[data-toggle="tooltip"]');
  var $form = $('form');

  $tooltip.on('click', function (e) {
    e.preventDefault();
  });
  $tooltip.tooltip();

  $form.on('submit', function (e) {
    //console.log("submit form");
    //e.preventDefault();
  });

});