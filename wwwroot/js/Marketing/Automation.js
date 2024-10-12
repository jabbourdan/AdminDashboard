function setDropdownValue(event, value) {
    event.stopPropagation();

    // Find the button and set its text content to the selected value
    var button = event.currentTarget.closest('.dropdown').querySelector('button');
    button.textContent = value + ' ';
    button.insertAdjacentHTML('beforeend', '<i class="fas fa-chevron-down"></i>');

    // Get the reminderType from the clicked element
    var reminderType = event.currentTarget.getAttribute('data-reminder-type');
    var status = value === 'Enabled' ? 1 : 0;

    // Log values for debugging
    console.log("ReminderType:", reminderType, "Status:", status);

    // Send the AJAX request to update the reminder status using form data
    $.ajax({
        url: '/Marketing/UpdateReminderStatus',
        type: 'POST',
        contentType: 'application/json', // Send JSON data
        data: JSON.stringify({
            orgId: 1,  // Replace with the actual orgId
            reminderType: reminderType,
            status: status
        }),
        success: function (response) {
            if (response.success) {
                console.log("Status updated successfully.");
                // Close the dropdown after success
                hideAllDropdowns();
            } else {
                console.error("Failed to update status:", response.error);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error updating status:", error);
        }
    });
}

// Function to hide all open dropdowns
function hideAllDropdowns() {
    // Find all dropdown-content elements and remove the 'show' class from all
    var dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove('show');
    });
}

// Function to toggle the dropdown display
function toggleDropdown(event) {
    event.stopPropagation();
    var dropdownContent = event.currentTarget.nextElementSibling;
    dropdownContent.classList.toggle('show');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.btn-primary')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}