let allServices = [];

$(document).ready(function () {
    // Initialize FullCalendar
    $('#calendar').fullCalendar({
        timeZone: 'UTC',
        header: {
            left: 'title',
            center: 'agendaDay,agendaWeek,month',
            right: 'prev,next today'
        },
        editable: true,
        firstDay: 1,
        selectable: true,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        selectHelper: true,

        // Handle selecting a time slot
        select: function (start, end, allDay) {
            openSideMenu();
        }
    });

    // Fetch existing events
    $.ajax({
        url: '/Schedule/GetEvents',
        type: 'GET',
        success: function (data) {
            $('#calendar').fullCalendar('addEventSource', data);
        },
        error: function () {
            alert('There was an error while fetching events.');
        }
    });

    // Get the clients in the list 
    $.ajax({
        url: '/Members/GetClients', // Update with your actual controller route if different
        type: 'GET',
        success: function (clients) {
            // Populate the #clientSelect dropdown
            const clientSelect = $('#clientSelect');
            clientSelect.empty(); // Clear any existing options
            clientSelect.append('<option value="">Select Client</option>'); // Default option

            clients.forEach(client => {
                clientSelect.append(`<option value="${client.clientId}">${client.fullName}</option>`);
            });
        },
        error: function () {
            alert('There was an error while fetching clients.');
        }
    });

    $.ajax({
        url: '/Catalog/GetAllServices', // Make sure this endpoint exists
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                allServices = response.data; // Store all services
                console.log(allServices);
                populateServiceList(); // Populate all services in the dropdown
                filterServices(); // Filter services initially based on the current selection
            } else {
                alert('Failed to fetch services.');
            }
        },
        error: function () {
            alert('Error fetching services.');
        }
    });

    // When the service type dropdown changes
    $('#serviceType').on('change', function () {
        filterServices(); // Call the filter function on change
    });
});

// Function to handle the next step logic
function nextStep() {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    let currentStep = Array.from(stepContents).findIndex(content => content.style.display !== 'none');

    // Call the validateStep function before proceeding to the next step
    if (!validateStep(currentStep)) {
        return; // Stop the next step process if validation fails
    }

    // Mark the current step as completed
    steps[currentStep + 1].classList.add('completed');

    // Move to the next step
    if (currentStep < stepContents.length - 1) {
        stepContents[currentStep].style.display = 'none';
        stepContents[currentStep + 1].style.display = 'block';
        currentStep++;

        // Enable the previous button if we're not on the first step
        document.getElementById('prevBtn').style.display = currentStep > 0 ? 'inline-block' : 'none';
    }

    // Check if this is the last step
    if (currentStep === steps.length - 1) {
        document.getElementById('nextBtn').style.display = 'none'; // Hide the "Next" button
        const finishBtn = document.createElement('button'); // Create the "Finish" button
        finishBtn.innerText = 'Finish';
        finishBtn.id = 'finishBtn';
        finishBtn.onclick = closeSideMenu;
        document.querySelector('.form-actions-bottom').appendChild(finishBtn);
    }
}

function openSideMenu() {
    document.getElementById("taskSideMenu").classList.add('active');
    document.querySelector('.step-content').style.display = 'block';
}

function closeSideMenu() {
    document.getElementById("taskSideMenu").classList.remove('active');
    const stepContents = document.querySelectorAll('.step-content');

    stepContents.forEach((content, index) => {
        content.style.display = index === 0 ? 'block' : 'none';
    });

    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index !== 0) {
            step.classList.remove('completed');
        }
    });

    document.getElementById('nextBtn').style.display = 'inline-block';
    const finishBtn = document.getElementById('finishBtn');
    if (finishBtn) {
        finishBtn.remove();
    }

    document.getElementById('prevBtn').style.display = 'none';

    document.getElementById('clientSelect').value = '';
    document.getElementById('pickDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('serviceType').value = 'service';
    document.getElementById('serviceList').value = 'service1';
}

function PrevSideMenu() {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    let currentStep = Array.from(stepContents).findIndex(content => content.style.display !== 'none');

    if (currentStep > 0) {
        steps[currentStep].classList.remove('completed');
        stepContents[currentStep].style.display = 'none';
        stepContents[currentStep - 1].style.display = 'block';
        document.getElementById('nextBtn').disabled = false;
    }
}

function addNewClient() {
    window.location.href = '/Members/AddClient'; 
}

function addNewService() {
    window.location.href = '/Catalog/AddNewService'; 
}

function addNewPackage() {
    window.location.href = '/Catalog/addNewPackage'; 
}

// Function to filter services based on the selected type
function filterServices() {
    const selectedType = $('#serviceType').val();

    // Show or hide the options based on the selected type
    $('#serviceList option').each(function () {
        const isPackage = $(this).attr('data-package') === 'true'; // Access the data-package attribute directly

        // Display the option only if it matches the selected type
        if ((selectedType === 'package' && isPackage) || (selectedType === 'service' && !isPackage)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    // Optionally reset the selection when the type changes
    $('#serviceList').val('');
}



function populateServiceList() {
    $('#serviceList').empty(); // Clear any existing options
    debugger;
    allServices.forEach(service => {
        // Ensure ServiceName and ServicesId are present
        console.log("Service Name: " + service.serviceName + " | Service ID: " + service.servicesId);

        // Create an option element manually
        const option = $('<option></option>')
            .val(service.servicesId) // Set the value attribute
            .text(service.serviceName) // Set the text content
            .attr('data-package', service.package ? 'true' : 'false'); // Set data-package attribute

        // Append the option to the select list
        $('#serviceList').append(option);
    });
}

// Function to validate the current step
function validateStep(currentStep) {
    switch (currentStep) {
        case 0: // Client step
            const clientSelect = document.getElementById('clientSelect').value;
            if (clientSelect === "" || clientSelect === "Select Client") {
                alert('Please select a valid client name.');
                return false;
            }
            break;

        case 1: // Time step
            const pickDate = document.getElementById('pickDate').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;

            if (pickDate === "" || startTime === "" || endTime === "") {
                alert('Please select a date, start time, and end time.');
                return false;
            }

            // Ensure start time is before end time
            if (startTime >= endTime) {
                alert('The start time must be earlier than the end time.');
                return false;
            }
            break;

        case 2: // Service step
            const serviceType = document.getElementById('serviceType').value;
            const selectedService = document.getElementById('serviceList').value;

            // Validate service type and selected service
            if (serviceType === "" || (serviceType !== "service" && serviceType !== "package")) {
                alert('Please select a valid service type.');
                return false;
            }

            if (selectedService === "" || selectedService === "Select Service") {
                alert('Please select an available service.');
                return false;
            }
            break;

        default:
            break;
    }

    return true; // If all validations pass
}
