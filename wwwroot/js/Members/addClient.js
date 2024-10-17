$(document).ready(function () {
  // Initialize
  init();

  function init() {
      handleNavigation();
      $('#profile-section').show(); // Show the profile section by default
      handleSaveClient();
      setDefaultNotificationPreference();
      handleNotificationCheckboxLogic();
  }

  // Handle the navigation between sections
  function handleNavigation() {
      $('.top-nav a').on('click', function (e) {
          e.preventDefault(); // Prevent default anchor click behavior
          $('.top-nav a').removeClass('active');
          $(this).addClass('active');
          $('.section').hide();
          $($(this).attr('href')).show();
      });

      var sectionLinks = document.querySelectorAll(".top-nav a");
      sectionLinks.forEach(function (link) {
          link.addEventListener("click", function (e) {
              e.preventDefault(); // Prevent default anchor behavior

              // Hide all sections
              document.querySelectorAll(".section").forEach(function (section) {
                  section.style.display = "none";
              });

              // Show the target section
              var targetSection = document.querySelector(link.getAttribute("href"));
              if (targetSection) {
                  targetSection.style.display = "block";

                  // Remove active class from all links
                  sectionLinks.forEach(function (link) {
                      link.classList.remove("active");
                  });

                  // Add active class to the clicked link
                  link.classList.add("active");
              }
          });
      });

      // Display the profile section by default
      var profileLink = document.querySelector('.top-nav a[href="#profile-section"]');
      if (profileLink) {
          profileLink.classList.add("active");
      }
  }

  // Function to handle saving a client
  function handleSaveClient() {
      $('#saveClient').on('click', function (e) {
          e.preventDefault();

          var mobile = $('#Mobile').val().replace(/\D/g, ''); // Remove any non-numeric characters
          if (mobile.startsWith('0')) {
              mobile = mobile.substring(1); // Remove leading '0'
          }
          var to = "whatsapp:+972" + mobile; // Format mobile number

          var clientName = $('#firstName').val();

          // Gather form data
          var formData = {
              FirstName: $('#firstName').val(),
              LastName: $('#lastName').val(),
              Day: $('#day').val() || null,
              Month: $('#month').val() || null,
              Year: $('#year').val() || null,
              Gender: $('#gender').val(),
              Email: $('#email').val(),
              Mobile: $('#Mobile').val(),
              Address1: $('#address1').val(),
              Address2: $('#address2').val(),
              City: $('#city').val(),
              State: $('#state').val(),
              Zip: $('#zip').val(),
              Country: $('#country').val(),
              orgId: 1
          };

          // Call saveClient function
          saveClient(formData, to, clientName);
      });
  }

  // Function to save client data
  function saveClient(formData, to, clientName) {
      $.ajax({
          url: '@Url.Action("AddClient", "Members")',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function (response) {
              if (response.success) {
                  // Check if the welcome message checkbox is checked
                  if ($('#send-welcome-message').is(':checked')) {
                      // Call the function to check if message sending is allowed
                      CheckAllowedMessage(1, to, clientName, 'WelcomeNewClient');
                  }
                  // Redirect to the client list (Index) if successful
                  window.location.href = response.redirectUrl;
              } else {
                  if (response.errors) {
                      var errorList = response.errors.join('\n');
                      alert('Validation Errors:\n' + errorList);
                  } else {
                      alert('An error occurred: ' + response.message);
                  }
              }
          },
          error: function (xhr, status, error) {
              alert('An error occurred while saving the client.');
          }
      });
  }

  // General function to check if message sending is allowed based on a specific field
  function CheckAllowedMessage(orgId, to, clientName, messageType) {
      $.ajax({
          type: "GET",
          url: "/Marketing/CheckAllowedMessage",  // General endpoint to check message permission
          data: { orgId: orgId, messageType: messageType },  // Pass the messageType dynamically
          success: function (response) {
              if (response.success && response.isAllowed) {
                  sendWhatsAppMessage(to, "Welcome to our service, " + clientName + "!");
              } else {
                  console.log(messageType + " is not allowed for this organization.");
              }
          },
          error: function (xhr, status, error) {
              console.log('Error while checking message permission: ' + error);
          }
      });
  }

  // Function to send WhatsApp message
  function sendWhatsAppMessage(to, message) {
      $.ajax({
          type: "POST",
          url: "/Marketing/SendWhatsAppMessage",
          data: {
              to: to, // Use the formatted phone number with +972
              message: message
          },
          success: function (response) {
              if (response.success) {
                  console.log("Message sent successfully, SID: " + response.sid);
              } else {
                  console.log("Error: " + response.error);
              }
          },
          error: function (xhr, status, error) {
              console.log('Error while sending WhatsApp message: ' + error);
          }
      });
  }

  // Set default notification preference to WhatsApp
  function setDefaultNotificationPreference() {
      var notificationPreferences = document.getElementById("notification-preferences");
      if (notificationPreferences) {
          notificationPreferences.value = "whatsapp"; // Set default notification preference
      }
  }

  // Handle notification checkbox logic
  function handleNotificationCheckboxLogic() {
      var sendEmailCheckbox = document.getElementById("send-email-notifications");
      var emailNotifications = document.getElementById("email-notifications");
      var smsNotifications = document.getElementById("sms-notifications");
      var whatsappNotifications = document.getElementById("whatsapp-notifications");

      if (sendEmailCheckbox) {
          sendEmailCheckbox.addEventListener("change", function () {
              if (!this.checked) {
                  if (emailNotifications) emailNotifications.checked = false;
                  if (smsNotifications) smsNotifications.checked = false;
                  if (whatsappNotifications) whatsappNotifications.checked = false;
              } else {
                  if (emailNotifications) emailNotifications.checked = true;
                  if (smsNotifications) smsNotifications.checked = true;
                  if (whatsappNotifications) whatsappNotifications.checked = true;
              }
          });
      }
  }
});
