/**
 * Custom JS
 * Use this file to add your custom scripts
 */

(function ($) {
  var $earlyAccessContainer = $('#early_access_modal_container');
  var bindHideModal = function () {
    $(".modal-over-modal .close").click(function () {
      $('.modal-over-modal').modal('hide');
    });
  }
  // Dynamically load the extracted HTML of early_access_form into modal container
  $earlyAccessContainer.load('../early_access_form.html', function (responseText, textStatus, xhr) {
    // Add early_access script tag once form HTML is loaded
    var earlyAccessScript = document.createElement('script');
    // earlyAccessScript.async = true;
    earlyAccessScript.setAttribute('src', 'assets/js/main.js?v11');
    document.body.appendChild(earlyAccessScript);

    // Now, load recaptcha script
    var recaptchaScript = document.createElement('script');
    recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
    document.body.appendChild(recaptchaScript);

    // Add early_access script tag once form HTML is loaded
    var earlyAccessScript = document.createElement('script');
    // earlyAccessScript.async = true;
    earlyAccessScript.setAttribute('src', 'assets/js/main.js?v11');
    document.body.appendChild(earlyAccessScript);

    // Now, load recaptcha script
    var recaptchaScript = document.createElement('script');
    recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
    document.body.appendChild(recaptchaScript);
  });
  var $cosmatt_servo_course_container = $('#read_more_cosmatt_servo_container');

  $cosmatt_servo_course_container.load('../read_more_cosmatt_servo.html', function (responseText, textStatus, xhr) {
    bindHideModal();
  });

  var $cosmatt_accounting_course_container = $('#read_more_cosmatt_accounting_container');

  $cosmatt_accounting_course_container.load('../read_more_cosmatt_accounting.html', function (responseText, textStatus, xhr) {
    bindHideModal();
  });
  $('body').on('hidden.bs.modal', function () {
    if ($('.modal.in').length > 0) {
      $('body').addClass('modal-open');
    }
  });

  
  
})(jQuery);

var authConfig = {
  appID: "COSMATT",
  appENV: "STAGE",
  urls: {
    redirectSignIn: 'https://cosmatt-stg.comprodls.com/app/',
    redirectSignOut: 'https://cosmatt-stg.comprodls.com/app/'
  }
}
var identity = "https://identity-staging.comprodls.com"

var singup = function() {
  var URL = identity + "/"+"?client="+authConfig.appID+"&redirectSignIn="+authConfig.urls.redirectSignIn+"&page=signup";
  URL =  encodeURI(URL);
  window.open(URL);
  // "https://identity-staging.comprodls.com/?client=COSMATT&redirectSignIn=https%3A%2F%2Fcosmatt-stg.comprodls.com%2Fapp%2F&page=signup"
}