$(document).ready(function () {
    console.log("start the JS");
    // Fetch services when the page loads
    fetchServices();

    // Show the modal to select a service when "Add service" button is clicked
    $('#addServiceButton').on('click', function () {
        $('#serviceModal').show();
    });

    // Close the modal when clicking the 'close' button in the modal
    $('.close').on('click', function () {
        $('#serviceModal').hide();
    });

    // Redirect to Catalog/Index when clicking the "Cancel" button
    $('#cancelPackageButton').on('click', function () {
        window.location.href = '/Catalog/Index'; // Redirect to the Catalog/Index page
    });

    // Add the selected service from the dropdown to the service list
    $('#addSelectedServiceButton').on('click', function () {
        addSelectedService();
    });

    // Handle the save functionality when clicking the 'Save Package' button
    $('#savePackageButton').on('click', function () {
        savePackage();
    });
});

// Function to fetch services that are not part of any package
function fetchServices() {
    console.log("fetchServices function is called");
    $.ajax({
        url: '/Catalog/GetService', // Ensure your URL matches your controller action
        type: 'GET',
        data: { IsPackage: false }, // Ensure you're passing the correct boolean value
        success: function (response) {
            if (response.success && response.data.length > 0) {
                populateServiceDropdown(response.data);
            } else {
                alert(response.message || 'No available services found.');
            }
        },
        error: function () {
            alert('An error occurred while fetching services.');
        }
    });
}

// Populate the service dropdown
function populateServiceDropdown(services) {
    var $serviceSelect = $('#serviceSelect');
    $serviceSelect.empty(); // Clear any existing options
    $serviceSelect.append('<option value="">Select a service...</option>'); // Default option

    services.forEach(service => {
        $serviceSelect.append(`<option value="${service.servicesId}">${service.serviceName}</option>`);
    });
}

// Add the selected service to the package list
function addSelectedService() {
    var selectedServiceId = $('#serviceSelect').val();
    var selectedServiceName = $('#serviceSelect option:selected').text();

    if (selectedServiceId) {
        var serviceRow = `
            <div class="service-row" data-service-id="${selectedServiceId}">
                <span>${selectedServiceName}</span>
                <button class="remove-service-btn" onclick="removeService(${selectedServiceId})">Remove</button>
            </div>`;

        $('#serviceList').append(serviceRow);
        $('#serviceModal').hide();
    } else {
        alert('Please select a service to add.');
    }
}

// Remove a service from the package list
function removeService(serviceId) {
    $(`div[data-service-id="${serviceId}"]`).remove();
}


// Save the package details to the database
function savePackage() {
    var packageDetails = {
        ServiceName: $('#packageName').val(),
        Category : $('#packageCategory').val(),
        Descriptions: $('#packageDescription').val(),
        Duration: $('#packageDuration').val(),
        Price: parseFloat($('#packagePrice').val()),
        Sale: $('#packageSale').val(),
        package: true,
        connectedServiceIds: []
    };
    debugger;
    // Collect selected service IDs and names
    $('#serviceList .service-row').each(function () {
        var serviceName = $(this).find('.service-name').text(); // Assuming service names are stored in an element with class 'service-name'
        
        packageDetails.connectedServiceIds.push(serviceName);
    });

    // Convert the array to a comma-separated string
    packageDetails.connectedServiceIds = packageDetails.connectedServiceIds.join(',');

    // Validate input fields
    if (!packageDetails.ServiceName || !packageDetails.Category || packageDetails.connectedServiceIds.length === 0) {
        alert('Please fill in all required fields and select at least one service.');
        return;
    }

    // Send data to the server
    $.ajax({
        url: '/Catalog/AddService', // Ensure your controller URL is correct
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(packageDetails),
        success: function (response) {
            if (response.success) {
                alert('Package added successfully');
                window.location.href = '/Catalog/Index'; // Redirect to the index page
            } else {
                alert('Failed to add package: ' + response.message);
            }
        },
        error: function () {
            alert('An error occurred while saving the package.');
        }
    });
}