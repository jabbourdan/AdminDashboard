// Function to show the appropriate tab content
function showTab(tabId, event) {
    // Remove the 'active' class from all tab buttons and content
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add the 'active' class to the clicked button and associated content
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Document ready function
document.addEventListener("DOMContentLoaded", function () {
    // Handle 'select all' checkbox functionality if needed
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Handle the search input for filtering
    const searchInput = document.getElementById("serviceSearchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll("#serviceTableBody tr");

            rows.forEach(row => {
                const serviceName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
                const category = row.querySelector("td:nth-child(3)").textContent.toLowerCase();

                // Check if the search term matches either the service name or category
                if (serviceName.includes(searchTerm) || category.includes(searchTerm)) {
                    row.style.display = ""; // Show row
                } else {
                    row.style.display = "none"; // Hide row
                }
            });
        });
    }
});


function toggleOptions(button) {
    // Close all other open dropdowns
    document.querySelectorAll('.dropdown-options').forEach(function (options) {
        if (options !== button.nextElementSibling) {
            options.style.display = 'none';
        }
    });

    // Toggle visibility of the dropdown options for the clicked button
    const options = button.nextElementSibling;
    options.style.display = options.style.display === 'none' || options.style.display === '' ? 'block' : 'none';
}

// Close dropdown if clicking outside
document.addEventListener('click', function (event) {
    const target = event.target;
    if (!target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-options').forEach(function (options) {
            options.style.display = 'none';
        });
    }
});

// Dummy functions for edit and delete actions
function editService(serviceId) {
    alert('Edit service with ID: ' + serviceId);
    window.location.href = `/Catalog/EditService/${serviceId}`;
}

function editPackege(serviceId) {
    alert('Edit service with ID: ' + serviceId);
    window.location.href = `/Catalog/editPackege/${serviceId}`;
}
// Function to delete a service
function deleteService(serviceId) {
    // Show confirmation prompt
    const confirmed = confirm("Are you sure you want to delete this service?");
    if (!confirmed) return;

    // If confirmed, make an AJAX call to delete the service from the database
    $.ajax({
        url: `/Catalog/DeleteService/${serviceId}`, // Adjust this URL to match your controller's route
        type: 'DELETE',
        success: function (response) {
            if (response.success) {
                alert('Service deleted successfully');

                // Remove the deleted row from the table using data-service-id
                $(`tr[data-service-id="${serviceId}"]`).remove();
            } else {
                alert('Failed to delete service');
            }
        },
        error: function () {
            alert('An error occurred while deleting the service.');
        }
    });
}

