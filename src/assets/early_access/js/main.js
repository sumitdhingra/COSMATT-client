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
      role: $('#earlyAccessModel').find("#role").val(),
    },
    recaptcha_token: token
  }
  $.post(`${getDLSApiUrl()}/api/auth/signup`, JSON.stringify(user), function (resp) {
    $('#earlyAccessModel').find('#earlyAccessForm').hide();
    $('#earlyAccessModel').find('.success-message').show();
    $('#earlyAccessModel').find('.error-alert').hide();
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

function getDLSApiUrl() {
  const host = window.location.hostname;
  /**
   * TODO
   * 1. Find a better way to pass configuration to static JS file.
   */
  switch (host) {
    case 'cosmatt-dev.comprodls.com':
      return 'https://dls-api-cosmatt-dev.herokuapp.com';

    case 'cosmatt-stg.comprodls.com':
      return 'https://dls-api-cosmatt-stg.herokuapp.com';

    case 'cosmatt.comprodls.com':
      return 'https://dls-api-cosmatt.herokuapp.com';

    default:
      return 'https://dls-api-cosmatt-dev.herokuapp.com'
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

  // Early access form handler
  $("#earlyAccessForm").submit(function (e) {
    e.preventDefault();
    grecaptcha.execute();
  })

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

    $.post(`${getDLSApiUrl()}/api/marketing/send-message`, JSON.stringify(messageObject), function (resp) {

        $('#form_message').addClass('alert-success').html(resp.success.message).slideDown();
        
        setTimeout(function () {
            $('#form_message').slideUp("fast", function () {
                $(this).removeClass('alert-success').html('');
            });
        }, 4000);
        $('#form_sendemail')[0].reset();
    }, "json").fail(function (error) {

        // Error messages
        if ( error.code === 'JOI_ERROR' ) {
            switch(error.name) {
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
