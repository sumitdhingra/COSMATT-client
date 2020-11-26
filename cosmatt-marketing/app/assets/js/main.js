'use strict';
var launchedAccessForm;

function recaptchaCallback(token) {
  $('#earlyAccessModel').find('.btn-signup').prop('disabled', true);
  $('#earlyAccessModel').find('.spinner').show();
  var user = {
    first_name: $('#earlyAccessModel').find("#firstname").val(),
    last_name: $('#earlyAccessModel').find("#lastname").val(),
    email: $('#earlyAccessModel').find("#email").val(),
    password: $('#earlyAccessModel').find("#password").val(),
    meta: {
      phone: $('#earlyAccessModel').find("#phone").val(),
      company: $('#earlyAccessModel').find("#company").val(),
      role: $('#earlyAccessModel').find("#role").val()
    },
    recaptcha_token: token
  };
  var application = launchedAccessForm
  $.post(getDLSApiUrl(application) + '/api/auth/signup', JSON.stringify(user), function (resp) {
    $('#earlyAccessModel').find('#earlyAccessForm').hide();
    $('#earlyAccessModel').find('.success-message').show();
    $('#earlyAccessModel').find('.error-alert').hide();
    resetEarlyAccessFormData();
  }, "json").fail(function (error) {
    $('#earlyAccessModel').find(".alert").show();
    if (error.responseJSON && error.responseJSON.message.indexOf("User already Exists") === 0) {
      $('#earlyAccessModel').find(".errorMessage").text("Email address is already in use!");
    } else if (error.responseJSON) {
      $('#earlyAccessModel').find(".errorMessage").text(error.responseJSON.message);
    } else {
      $('#earlyAccessModel').find(".errorMessage").text('Server error! Please try again later');
    }
  }).always(function () {
    $('#earlyAccessModel').find('.btn-signup').prop('disabled', false);
    $('#earlyAccessModel').find('.spinner').hide();
    grecaptcha.reset();
    
  });
}

function resetEarlyAccessFormData (){
  $('#earlyAccessModel').find("#firstname").val(null);
  $('#earlyAccessModel').find("#lastname").val(null);
  $('#earlyAccessModel').find("#email").val(null);
  $('#earlyAccessModel').find("#password").val(null);
  $('#earlyAccessModel').find("#confirm_password").val(null);
  $('#earlyAccessModel').find("#phone").val(null);
  $('#earlyAccessModel').find("#company").val(null);
  $('#earlyAccessModel').find("#role").val(null);

}




function getDLSApiUrl(application) {
  var host = window.location.hostname;
  /**
   * TODO
   * 1. Find a better way to pass configuration to static JS file.
   */
  if (application == 'accounting') {

    switch (host) {
      case 'cosmatt-stg.comprodls.com':
        return 'https://leonardo-api-accounting-stg.herokuapp.com';

      case 'cosmatt.comprodls.com':
        return 'https://leonardo-accounting-api.herokuapp.com';

      default:
        return 'https://leonardo-api-accounting-stg.herokuapp.com';
    }
  }

  if (application == 'cosmatt') {
    switch (host) {
      case 'cosmatt-dev.comprodls.com':
        return 'https://dls-api-cosmatt-dev.herokuapp.com';

      case 'cosmatt-stg.comprodls.com':
        return 'https://dls-api-cosmatt-stg.herokuapp.com';

      case 'cosmatt.comprodls.com':
        return 'https://dls-api-cosmatt.herokuapp.com';

      default:
        return 'https://dls-api-cosmatt-dev.herokuapp.com';
    }

  }
}
function getAppHeadingText(application) {
  if (application == 'accounting') {
    return "Financial Accounting";
  }
  else if (application == 'cosmatt') {
    return "Servo Engineering";
  }
}

(function ($) {
  "use strict"; // Start of use strict
  $('#earlyAccessModel').find('.success-message').hide();
  $('#earlyAccessModel').find('.spinner').hide();
  $('#earlyAccessForm').show();
  $('#earlyAccessModel').find(".alert").hide();
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8"
  });

  var password = document.getElementById("password"),
    confirm_password = document.getElementById("confirm_password");

  function validatePassword() {
    if (password.value != confirm_password.value) {
      confirm_password.setCustomValidity("Passwords didn't match");
    } else if (password.value == '' || password.value == undefined || password.value == null) {
      password.setCustomValidity("Passwords must not be empty");
    } else {
      password.setCustomValidity('');
      confirm_password.setCustomValidity('');
    }
  }
  password.onchange = validatePassword;
  confirm_password.onkeyup = validatePassword;

  // Early access form handler
  $("#earlyAccessForm").submit(function (e) {
    e.preventDefault();
    var confirm_password = document.getElementById("confirm_password");
    confirm_password.reportValidity();
    grecaptcha.execute();
  });

  $( ".earlyAccessFormLauncher" ).click(function() {
    $('#earlyAccessModel').find('.success-message').hide();
    $('#earlyAccessModel').find('.spinner').hide();
    $('#earlyAccessForm').show();
    $('#earlyAccessModel').find(".alert").hide();
    
    launchedAccessForm = $(this).data().id;
    $('#earlyAccessModel').find('.label_access_header').text("For Early Access - "+ getAppHeadingText(launchedAccessForm)); 
  });
  
  // Send message form handler
  $('#form_sendemail').submit(function (e) {
    e.preventDefault();

    // Before send
    $('#form_sendemail .has-error').removeClass('has-error');
    $('#form_sendemail .help-block').html('').hide();
    $('#form_message').removeClass('alert-success').html('');

    var messageObject = {
      name: $('#form_sendemail').find("#name2").val(),
      email: $('#form_sendemail').find("#email2").val(),
      subject: $('#form_sendemail').find("#subject").val(),
      message: $('#form_sendemail').find("#message").val()
    };

    $.post(getDLSApiUrl('cosmatt') + '/api/marketing/send-message', JSON.stringify(messageObject), function (resp) {

      $('#form_message').addClass('alert-success').html(resp.success.message).slideDown();

      setTimeout(function () {
        $('#form_message').slideUp("fast", function () {
          $(this).removeClass('alert-success').html('');
        });
      }, 4000);
      $('#form_sendemail')[0].reset();
    }, "json").fail(function (error) {

      // Error messages
      if (error.code === 'JOI_ERROR') {
        switch (error.name) {
          case 'name':
            $('#form_sendemail input[name="name2"]').parent().addClass('has-error');
            $('#form_sendemail input[name="name2"]').next('.help-block').html(error.message).slideDown();
            break;

          case 'email':
            $('#form_sendemail input[name="email2"]').parent().addClass('has-error');
            $('#form_sendemail input[name="email2"]').next('.help-block').html(error.message).slideDown();
            break;

          case 'message':
            $('#form_sendemail input[name="message"]').parent().addClass('has-error');
            $('#form_sendemail input[name="message"]').next('.help-block').html(error.message).slideDown();
            break;

          case 'subject':
            $('#form_sendemail textarea[name="subject"]').parent().addClass('has-error');
            $('#form_sendemail textarea[name="subject"]').next('.help-block').html(error.message).slideDown();
            break;
        }
      } else {
        $('#form_message').addClass('alert-danger').html('Something went wrong. Please try later.').slideDown();

        setTimeout(function () {
          $('#form_message').slideUp("fast", function () {
            $(this).removeClass('alert-danger').html('');
          });
        }, 4000);
      }
    }).always(function () {
      // do nothing.
    });
  });
})(jQuery); // End of use strict
