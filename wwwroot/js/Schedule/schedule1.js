// combinedSchedule.js

$(document).ready(function () {
    // Initialize variables
    let allServices = [];

    // Initialize FullCalendar
    $('#calendar').fullCalendar({
        timeZone: 'UTC', // Adjust the timeZone as needed
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
        },

        // Handle event drag and drop
        eventDrop: function (event, delta, revertFunc) {
            updateEvent(event, revertFunc);
        },

        // Customize event rendering
        eventRender: function (event, element) {
            renderEvent(event, element);
        }
    });

    // Fetch existing events
    fetchEvents();

    // Fetch clients
    fetchClients();

    // Fetch services
    fetchServices();

    // Event listeners
    $('#serviceType').on('change', function () {
        filterServices();
    });

    // Function to fetch events from the server
    function fetchEvents() {
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
    }

    // Function to fetch clients
    function fetchClients() {
        $.ajax({
            url: '/Members/GetClients',
            type: 'GET',
            success: function (clients) {
                const clientSelect = $('#clientSelect');
                clientSelect.empty();
                clientSelect.append('<option value="">Select Client</option>');

                clients.forEach(client => {
                    clientSelect.append(`<option value="${client.clientId}">${client.fullName}</option>`);
                });
            },
            error: function () {
                alert('There was an error while fetching clients.');
            }
        });
    }

    // Function to fetch services
    function fetchServices() {
        $.ajax({
            url: '/Catalog/GetAllServices',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    allServices = response.data;
                    populateServiceList();
                    filterServices();
                } else {
                    alert('Failed to fetch services.');
                }
            },
            error: function () {
                alert('Error fetching services.');
            }
        });
    }

    // Function to open the side menu
    function openSideMenu() {
        $('#taskSideMenu').addClass('active');
        $('.step-content').first().show();
    }

    // Function to close the side menu and reset form
    function closeSideMenu() {
        $('#taskSideMenu').removeClass('active');
        resetSideMenu();
    }

    // Function to reset the side menu
    function resetSideMenu() {
        const stepContents = $('.step-content');
        stepContents.hide().first().show();

        const steps = $('.step');
        steps.removeClass('completed').first().addClass('completed');

        $('#nextBtn').show();
        $('#finishBtn').remove();
        $('#prevBtn').hide();

        // Reset form fields
        $('#clientSelect').val('');
        $('#pickDate').val('');
        $('#startTime').val('');
        $('#endTime').val('');
        $('#serviceType').val('service');
        $('#serviceList').val('');
    }

    // Function to handle the next step logic
    function nextStep() {
        const steps = $('.step');
        const stepContents = $('.step-content');
        let currentStep = stepContents.index(stepContents.filter(':visible'));

        if (!validateStep(currentStep)) {
            return;
        }

        steps.eq(currentStep).addClass('completed');

        if (currentStep < stepContents.length - 1) {
            stepContents.eq(currentStep).hide();
            stepContents.eq(currentStep + 1).show();

            $('#prevBtn').css('display', currentStep > 0 ? 'inline-block' : 'none');
        }

        if (currentStep === steps.length - 2) {
            $('#nextBtn').hide();
            const finishBtn = $('<button id="finishBtn">Finish</button>');
            finishBtn.on('click', finishEventCreation);
            $('.form-actions-bottom').append(finishBtn);
        }
    }

    // Function to go back to the previous step
    function PrevSideMenu() {
        const steps = $('.step');
        const stepContents = $('.step-content');
        let currentStep = stepContents.index(stepContents.filter(':visible'));

        if (currentStep > 0) {
            steps.eq(currentStep).removeClass('completed');
            stepContents.eq(currentStep).hide();
            stepContents.eq(currentStep - 1).show();
            $('#nextBtn').show();
            $('#finishBtn').remove();
        }

        $('#prevBtn').css('display', currentStep > 1 ? 'inline-block' : 'none');
    }

    // Function to add a new client
    function addNewClient() {
        window.location.href = '/Members/AddClient';
    }

    // Function to add a new service
    function addNewService() {
        window.location.href = '/Catalog/AddNewService';
    }

    // Function to add a new package
    function addNewPackage() {
        window.location.href = '/Catalog/AddNewPackage';
    }

    // Function to filter services based on selected type
    function filterServices() {
        const selectedType = $('#serviceType').val();

        $('#serviceList option').each(function () {
            const isPackage = $(this).attr('data-package') === 'true';

            if ((selectedType === 'package' && isPackage) || (selectedType === 'service' && !isPackage)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        $('#serviceList').val('');
    }

    // Function to populate the service list
    function populateServiceList() {
        $('#serviceList').empty();

        allServices.forEach(service => {
            const option = $('<option></option>')
                .val(service.servicesId)
                .text(service.serviceName)
                .attr('data-package', service.package ? 'true' : 'false');

            $('#serviceList').append(option);
        });
    }

    // Function to validate inputs at each step
    function validateStep(currentStep) {
        switch (currentStep) {
            case 0:
                const clientSelect = $('#clientSelect').val();
                if (!clientSelect) {
                    alert('Please select a valid client name.');
                    return false;
                }
                break;

            case 1:
                const pickDate = $('#pickDate').val();
                const startTime = $('#startTime').val();
                const endTime = $('#endTime').val();

                if (!pickDate || !startTime || !endTime) {
                    alert('Please select a date, start time, and end time.');
                    return false;
                }

                if (startTime >= endTime) {
                    alert('The start time must be earlier than the end time.');
                    return false;
                }
                break;

            case 2:
                const serviceType = $('#serviceType').val();
                const selectedService = $('#serviceList').val();

                if (!serviceType || !['service', 'package'].includes(serviceType)) {
                    alert('Please select a valid service type.');
                    return false;
                }

                if (!selectedService) {
                    alert('Please select an available service.');
                    return false;
                }
                break;

            default:
                break;
        }

        return true;
    }

    // Function to update an event
    function updateEvent(event, revertFunc) {
        const updatedEvent = {
            eventId: event.eventId,
            title: event.title,
            clientName: event.clientName,
            start: event.start,
            end: event.end ? event.end : null,
            allDay: event.allDay,
            className: event.className ? event.className[0] : ''
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
                revertFunc();
            }
        });
    }

    // Function to customize event rendering
    function renderEvent(event, element) {
        element.find('.fc-title').append("<br/>" + event.clientName);

        element.on('dblclick', function (e) {
            e.preventDefault();
            showContextMenu(event, e.pageX, e.pageY);
        });
    }

    // Function to show context menu for event options
    function showContextMenu(event, x, y) {
        $('#contextMenu').remove();

        const contextMenu = `
        <div id="contextMenu" class="context-menu" style="top:${y}px; left:${x}px;">
            <ul>
                <li class="edit-event">Edit</li>
                <li class="delete-event">Delete</li>
            </ul>
        </div>
        `;
        $('body').append(contextMenu);

        $('#contextMenu .edit-event').on('click', function () {
            // Handle event editing
            // Optionally open the side menu with pre-filled data
            $('#contextMenu').remove();
        });

        $('#contextMenu .delete-event').on('click', function () {
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(event);
            }
            $('#contextMenu').remove();
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('#contextMenu').length) {
                $('#contextMenu').remove();
            }
        });
    }

    // Function to delete an event
    function deleteEvent(event) {
        $.ajax({
            url: '/Schedule/DeleteEvent',
            type: 'POST',
            data: JSON.stringify({ eventId: event.eventId }),
            contentType: 'application/json',
            success: function () {
                $('#calendar').fullCalendar('removeEvents', event._id);
            },
            error: function () {
                alert('Failed to delete event.');
            }
        });
    }

    // Function to finalize event creation
    function finishEventCreation() {
        const clientId = $('#clientSelect').val();
        const pickDate = $('#pickDate').val();
        const startTime = $('#startTime').val();
        const endTime = $('#endTime').val();
        const serviceId = $('#serviceList').val();

        const newEvent = {
            // eventId: // Assign if necessary
            title: "Event Title", // Modify as needed
            clientId: clientId,
            start: moment(pickDate + ' ' + startTime),
            end: moment(pickDate + ' ' + endTime),
            allDay: false,
            className: 'custom-class',
            serviceId: serviceId
        };

        $.ajax({
            url: '/Schedule/AddEvent',
            type: 'POST',
            data: JSON.stringify(newEvent),
            contentType: 'application/json',
            success: function (response) {
                $('#calendar').fullCalendar('renderEvent', response, true);
                closeSideMenu();
            },
            error: function () {
                alert('Failed to add event.');
            }
        });
    }
});
