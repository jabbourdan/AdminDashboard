$(document).ready(function () {
    // Handle the Save button click
    $('#saveButton').on('click', function () {
        // Collect the form data
        const newService = {
            ServiceName: $('#serviceName').val(),
            Category: $('#menuCategory').val(),
            Descriptions: $('#description').val(),
            Duration: $('#duration').val(),
            Price: parseFloat($('#price').val()),
            Sale: $('#sale').val(),
            Package: false,
            ServiceColor: $('#color').val()
        };
        debugger;
        // Check if the price conversion is successful
        if (isNaN(newService.Price)) {
            alert('Please enter a valid price.');
            return; // Stop further execution if the price is not valid
        }
        debugger;
        // Send the data to the server via AJAX
        $.ajax({
            url: '/Catalog/AddService', // Make sure the controller has an action to handle this
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newService),
            success: function (response) {
                if (response.success) {
                    alert('Service added successfully');
                    window.location.href = '/Catalog/Index'; // Redirect back to the index page
                } else {
                    alert('Failed to add service');
                }
            },
            error: function () {
                alert('An error occurred while saving the service.');
            }
        });
    });

    // Handle the Cancel button click
    $('#cancelButton').on('click', function () {
        window.location.href = '/Catalog/Index'; // Redirect to the index page
    });
});

// Update character counters
document.getElementById('serviceName').addEventListener('input', function () {
    document.getElementById('serviceNameCounter').textContent = `${this.value.length}/255`;
});

document.getElementById('description').addEventListener('input', function () {
    document.getElementById('descriptionCounter').textContent = `${this.value.length}/1000`;
});