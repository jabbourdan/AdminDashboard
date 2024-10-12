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
        resizable: true, // Allows resizing
        firstDay: 1,
        selectable: true,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        selectHelper: true,

        // Handle selecting a time slot
        select: function (start, end) {
            openSideMenu(start, end);
            $('#finishEditBtn').remove();
        },

        eventDrop: function (event, revertFunc) {

            var adjustedStart = moment(event.start).add(3, 'hours');
            var adjustedEnd = event.end ? moment(event.end).add(3, 'hours') : null;

            var updatedEvent = {
                eventId: event.eventId,
                title: event.title,
                clientName: event.clientName,
                start: adjustedStart,
                end: adjustedEnd ? adjustedEnd : null,
                allDay: event.allDay,
                className: event.className[0],
                color: event.color,
                orgId: event.orgId,
                clientId: event.clientId
            };

            $.ajax({
                url: '/Schedule/UpdateEvent',
                type: 'POST',
                data: JSON.stringify(updatedEvent),
                contentType: 'application/json',
                success: function () {
                    console.log('Event updated successfully.');
                },
                error: function () {
                    alert('Failed to update event.');
                    revertFunc(); // Revert the event to its original state if the update fails
                }
            });
        },

        eventRender: function (event, element) {
            // Attach the eventId as a data attribute to the rendered element
            element.attr('data-event-id', event.eventId);

            // Display additional details
            element.find('.fc-title').append("<br/>" + event.clientName);

            // Apply the event color
            if (event.color) {
                element.css('background-color', event.color);
            }

            // Add a double-click event listener to show the context menu
            element.on('dblclick', function (e) {
                e.preventDefault();
                showContextMenu(event, e.pageX, e.pageY);
            });
        },
        // Handle event resizing
        eventResize: function (event, delta, revertFunc) {
            debugger;
            var adjustedEnd = moment(event.end).add(3, 'hours');
            console.log(`Task "${event.title}" was extended to ${adjustedEnd.format('YYYY-MM-DD HH:mm')}`);

            var updatedEvent = {
                eventId: event.eventId,
                title: event.title,
                clientName: event.clientName,
                start: moment(event.start).add(3, 'hours'),
                end: adjustedEnd,
                allDay: event.allDay,
                className: event.className[0],
                color: event.color,
                orgId: event.orgId,
                clientId: event.clientId
            };

            $.ajax({
                url: '/Schedule/UpdateEvent',
                type: 'POST',
                data: JSON.stringify(updatedEvent),
                contentType: 'application/json',
                success: function () {
                    console.log('Event updated successfully.');
                },
                error: function () {
                    alert('Failed to update event.');
                    revertFunc(); // Revert the event to its original state if the update fails
                }
            });
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


    function showContextMenu(event, x, y) {
        var contextMenu = `
        <div id="contextMenu" class="context-menu" style="top:${y}px; left:${x}px;">
            <ul>
                <li class="edit-event">Edit</li>
                <li class="delete-event">Delete</li>
            </ul>
        </div>
        `;
        $('body').append(contextMenu);

        $('#contextMenu .edit-event').on('click', function () {
            // Open the side menu
            openSideMenu(event.start, event.end);
            window.pastEventId = event.eventId;
            // Set the clientId field in the select dropdown
            if (event.clientId) {
                $('#clientSelect').val(event.clientId); // Set the selected value based on clientId
            } else {
                $('#clientSelect').val(''); // Set to an empty value if clientId is not available
            }
            // Set the service type by matching the text
            $('#serviceType').find('option').each(function () {
                if ($(this).text() === event.className) {
                    $(this).prop('selected', true);
                }
            });

            // Set the available service by matching the text
            $('#serviceList').find('option').each(function () {
                if ($(this).text() === event.title) { // Assuming `event.title` holds the service name
                    $(this).prop('selected', true);
                }
            });
            // Set other fields similarly
            $('#pickDate').val(moment(event.start).format('YYYY-MM-DD'));
            $('#startTime').val(moment(event.start).format('HH:mm'));
            $('#endTime').val(event.end ? moment(event.end).format('HH:mm') : '');

            debugger;
            const finishEditBtn = $('<button id="finishEditBtn">Finish</button>');

            $('#finishBtn').remove();

            if ($('#finishEditBtn').length === 0) { // check if its already exsist
                $('.form-actions-bottom').append(finishEditBtn);
            }

            finishEditBtn.on('click', function () {

                var newEvent = finishEventCreation();

                addOrUpdate(newEvent, '/Schedule/updateEvent'); // here I can look at the EditBtn att and change the URL
            });

            // Remove the context menu
            $('#contextMenu').remove();
        });

        $('#contextMenu .delete-event').on('click', function () {
            if (confirm('Are you sure you want to delete this event?')) {
                debugger;
                $.ajax({
                    url: '/Schedule/DeleteEvent',
                    type: 'POST',
                    data: JSON.stringify(event.eventId),
                    contentType: 'application/json',
                    success: function () {
                        $('#calendar').fullCalendar('removeEvents', event._id);
                    },
                    error: function () {
                        alert('Failed to delete event.');
                    }
                });

            }
            $('#contextMenu').remove();
        });

        $(document).on('click', function () {
            $('#contextMenu').remove();
        });
    }
});



// Function to handle the next step logic
function nextStep() {
    const steps = $('.step');
    const stepContents = $('.step-content');
    let currentStep = stepContents.index(stepContents.filter(':visible'));

    if (!validateStep(currentStep)) {
        return;
    }

    steps.eq(currentStep).addClass('completed');
    debugger;
    if (currentStep < stepContents.length - 1) {
        stepContents.eq(currentStep).hide();
        stepContents.eq(currentStep + 1).show();

        //$('#prevBtn').css('display', currentStep > 0 ? 'inline-block' : 'none');

        // Show the previous button after the first step
        $('#prevBtn').show();
    }

    
    if (currentStep === steps.length - 2) {
        $('#nextBtn').hide();
        debugger;
        if ($('#finishEditBtn').length === 0) {
            const finishBtn = $('<button id="finishBtn">Finish</button>');
            $('.form-actions-bottom').append(finishBtn);

            finishBtn.on('click', function () {
                var newEvent = finishEventCreation();
                addOrUpdate(newEvent, '/Schedule/AddEvent');
            });
        }
    }

}

function finishEventCreation(existingEvent = {}) {
    // Collect data from the form
    const clientId = $('#clientSelect').val();
    const clientName = $('#clientSelect option:selected').text();
    const pickDate = $('#pickDate').val();
    const startTime = $('#startTime').val();
    const endTime = $('#endTime').val();
    const serviceId = $('#serviceList').val();
    const serviceName = $('#serviceList option:selected').text();

    // Combine date and time to create start and end moments
    const startDateTime = moment(pickDate + ' ' + startTime);
    const endDateTime = moment(pickDate + ' ' + endTime);

    // Determine the color based on some logic
    let eventColor = '';
    const selectedService = allServices.find(service => service.servicesId == serviceId);
    if (selectedService && selectedService.serviceColor) {
        eventColor = selectedService.serviceColor;
    } else {
        eventColor = '#1E90FF'; // Default color (DodgerBlue) if no color is found
    }

    // Create the new or updated event object
    const newEvent = {
        title: serviceName,
        clientName: clientName,
        clientId: clientId,
        start: startDateTime.format(), // Convert to ISO string
        end: endDateTime.format(),
        allDay: false,
        className: 'custom-class',
        serviceId: serviceId,
        color: eventColor // Add the color property here
    };

    return newEvent;
}


function addOrUpdate(newEvent, url) {
    if (url != '/Schedule/AddEvent') {
        newEvent.eventId = pastEventId; // Make sure pastEventId is set correctly
    }
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(newEvent),
        contentType: 'application/json',
        success: function (response) {
            // Ensure you capture the returned eventId from the response
            const eventId = response.eventId;
            debugger;
            if (eventId && eventId > 0) {
                newEvent.eventId = eventId; // Update your newEvent object with the returned eventId
            } else {
                console.error('Failed to retrieve the eventId from the response.');
                return;
            }

            // First, remove all events with the given eventId
            $('#calendar').fullCalendar('removeEvents', function (event) {
                return event.eventId === eventId;
            });

            // Then add or update the event in FullCalendar
            $('#calendar').fullCalendar('renderEvent', response, true);

            closeSideMenu(); // Close the side menu if it is open
        },
        error: function () {
            alert('Failed to add/update event.');
        }
    });
}


function openSideMenu(start, end) {
    $('#taskSideMenu').addClass('active');
    $('.step-content').first().show();
    $('#prevBtn').hide();

    // Store the start and end times for later use
    window.selectedStart = start;
    window.selectedEnd = end;

    // Pre-fill the date and time fields
    const startDate = moment(start).format('YYYY-MM-DD');
    const startTime = moment(start).format('HH:mm');
    const endTime = moment(end).format('HH:mm');

    $('#pickDate').val(startDate);
    $('#startTime').val(startTime);
    $('#endTime').val(endTime);
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
