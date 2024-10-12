document.addEventListener("DOMContentLoaded", function () {
  // Handle section navigation
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
  var profileSection = document.querySelector("#profile-section");
  if (profileSection) {
    profileSection.style.display = "block";
  }

  // Make the profile link active by default
  var profileLink = document.querySelector('.top-nav a[href="#profile-section"]');
  if (profileLink) {
    profileLink.classList.add("active");
  }

  // Set default notification preference to WhatsApp
  var notificationPreferences = document.getElementById("notification-preferences");
  if (notificationPreferences) {
    notificationPreferences.value = "whatsapp"; // Set default notification preference
  }

  // Handle notification checkbox logic
  var sendEmailCheckbox = document.getElementById("send-email-notifications");
  var emailNotifications = document.getElementById("email-notifications");
  var smsNotifications = document.getElementById("sms-notifications");
  var whatsappNotifications = document.getElementById("whatsapp-notifications");

  if (sendEmailCheckbox) {
    sendEmailCheckbox.addEventListener("change", function () {
      if (!this.checked) {
        // Uncheck all notifications if email notifications are turned off
        if (emailNotifications) emailNotifications.checked = false;
        if (smsNotifications) smsNotifications.checked = false;
        if (whatsappNotifications) whatsappNotifications.checked = false;
      } else {
        // Check all notifications if email notifications are turned on
        if (emailNotifications) emailNotifications.checked = true;
        if (smsNotifications) smsNotifications.checked = true;
        if (whatsappNotifications) whatsappNotifications.checked = true;
      }
    });
  }
});
