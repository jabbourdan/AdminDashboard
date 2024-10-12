$(document).ready(function () {
    // Handle the Save button click
    $('#saveButton').on('click', function () {
        debugger;
        const serviceId = $('.container').data('service-id');
        // Collect the form data
        const updatedService = {
            ServicesId: serviceId,
            ServiceName: $('#serviceName').val(),
            Category: $('#menuCategory').val(),
            Descriptions: $('#description').val(),
            Duration: $('#duration').val(),
            Price: parseFloat($('#price').val()),
            Sale: $('#sale').val(),
            package: false
        };

        // Check if the price conversion is successful
        if (isNaN(updatedService.Price)) {
            alert('Please enter a valid price.');
            return; // Stop further execution if the price is not valid
        }

        debugger;
        // Send the data to the server via AJAX
        $.ajax({
            url: `/Catalog/UpdateService`, // Controller action for updating
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedService),
            success: function (response) {
                if (response.success) {
                    alert('Service updated successfully');
                    window.location.href = '/Catalog/Index'; // Redirect back to the index page
                } else {
                    alert('Failed to update service');
                }
            },
            error: function () {
                alert('An error occurred while updating the service.');
            }
        });
    });

    // Handle the Cancel button click
    $('#cancelButton').on('click', function () {
        window.location.href = '/Catalog/Index'; // Redirect to the index page
    });
});
