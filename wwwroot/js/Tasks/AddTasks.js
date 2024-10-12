// AddTasks.js

$(document).ready(function () {
    initializeDatePickers();
    setupDateFilter();

    // Function to initialize date pickers
    function initializeDatePickers() {
        setupDatePicker("#start-date");
        setupDatePicker("#end-date");

        function setupDatePicker(selector) {
            $(selector).daterangepicker(
                {
                    singleDatePicker: true,
                    showDropdowns: true,
                    autoUpdateInput: false,
                    locale: {
                        cancelLabel: "Clear",
                    },
                },
                function (start) {
                    $(selector).val(start.format("DD/MM/YYYY"));
                }
            );

            $(selector).on("apply.daterangepicker", function (ev, picker) {
                $(this).val(picker.startDate.format("DD/MM/YYYY"));
            });

            $(selector).on("cancel.daterangepicker", function () {
                $(this).val("");
            });
        }
    }

    // Function to set up date range filtering for tasks
    function setupDateFilter() {
        $("#submit-dates").on("click", filterTasksByDate);
        $(".ant-picker-clear").on("click", clearDateFilter);

        function filterTasksByDate() {
            const startDate = moment($("#start-date").val(), "DD/MM/YYYY");
            const endDate = moment($("#end-date").val(), "DD/MM/YYYY");

            if (!startDate.isValid() || !endDate.isValid()) {
                alert("Please select valid start and end dates.");
                return;
            }

            $(".task").each(function () {
                const taskDate = moment($(this).find("time").attr("datetime"));
                if (taskDate.isBetween(startDate, endDate, "days", "[]")) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }

        function clearDateFilter() {
            $("#start-date").val("");
            $("#end-date").val("");
            $(".task").show();
        }
    }

    // Fetch and populate crew members when the page loads
    $.ajax({
        url: '/Tasks/GetCrewMembers',
        method: 'GET',
        success: function (data) {
            const assignToSelect = $('#taskAssignTo');
            assignToSelect.empty();
            assignToSelect.append(new Option("Select Crew Member", "")); // Add default option

            data.forEach(member => {
                const fullName = `${member.firstName} ${member.lastName}`;
                assignToSelect.append(new Option(fullName, member.crewId));
            });
        },
        error: function (error) {
            console.error("Error fetching crew members:", error);
        }
    });

    // Show the slider when 'Add Task' button is clicked
    $('.project-participants__add').on('click', function (e) {
        e.stopPropagation();
        $('#addTaskSlider').fadeIn().addClass('active');
        $('.project').addClass('shrink');
    });

    // Hide the slider when 'Cancel' button is clicked
    $('#closeSlider').on('click', function () {
        closeSlider();
    });

    // Function to handle closing the slider
    function closeSlider() {
        $('#addTaskSlider').fadeOut().removeClass('active');
        $('.project').removeClass('shrink');
    }

    // Hide the slider on form submission and reset form fields
    // Initialize an empty object to store crew members and their IDs
    const crewMemberMap = {};

    // Fetch and populate crew members when the user opens the 'Add Task' form
    $('.project-participants__add').on('click', function (e) {
        e.stopPropagation();

        // Fetch crew members only if the list is empty (ensures you fetch once)
        if ($.isEmptyObject(crewMemberMap)) {
            $.ajax({
                url: '/Tasks/GetCrewMembers',
                method: 'GET',
                success: function (data) {
                    const assignToSelect = $('#taskAssignTo');
                    assignToSelect.empty();
                    assignToSelect.append(new Option("Select Crew Member", "")); // Add default option

                    // Populate the dropdown and the crewMemberMap
                    data.forEach(member => {
                        const fullName = `${member.firstName} ${member.lastName}`;
                        assignToSelect.append(new Option(fullName)); // Add only names to the dropdown
                        crewMemberMap[fullName] = member.crewId; // Store the mapping between name and ID
                    });
                },
                error: function (error) {
                    console.error("Error fetching crew members:", error);
                }
            });
        }

        $('#addTaskSlider').fadeIn().addClass('active');
        $('.project').addClass('shrink');
    });

    // Function to handle closing the slider
    function closeSlider() {
        $('#addTaskSlider').fadeOut().removeClass('active');
        $('.project').removeClass('shrink');
    }

    // Function to handle form submission
    // Function to handle form submission
    $('#addTaskForm').on('submit', function (e) {
        e.preventDefault();

        const selectedCrewName = $('#taskAssignTo').val();
        const crewId = crewMemberMap[selectedCrewName]; // Get the CrewId from the map
        debugger;
        // Construct the new task object, ensuring all required properties are included
        const newTask = {
            OrgId: 1,
            Descriptions: $('#taskTitle').val(),
            Section: $('#taskCategory').val(),
            SectionColor: $('#taskColor').val(),
            Status: $('#taskStatus').val(),
            crewName: selectedCrewName,
            DateExpired: $('#taskEndTime').val(),
            CrewId: crewId
        };

        // Send the new task data to the server
        $.ajax({
            url: '/Tasks/AddTask',  // Ensure this URL is correct for your routing
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newTask),  // Convert the task data to JSON
            success: function (response) {
                if (response.success) {
                    console.log('Task added successfully:', response);
                    
                    // Add the task to the UI
                    addTaskToColumn(newTask,response.taskId); // Ensure addTaskToColumn is expecting the correct structure

                    // Clear form and close the slider
                    $('#addTaskForm')[0].reset();
                    closeSlider();
                } else {
                    alert('Failed to add task: ' + response.message);
                }
            },
            error: function (error) {
                console.error('Error adding task:', error);
                alert('An error occurred while adding the task. Please try again.');
            }
        });
    });

    // Function to add a new task to the correct column based on status
    function addTaskToColumn(task,taskId) {
        let columnSelector;
        debugger;
        switch (task.Status) {
          case "To Do":
            columnSelector = '.project-column:has(.project-column-heading__title:contains("To Do"))';
            break;
          case "In Progress":
            columnSelector = '.project-column:has(.project-column-heading__title:contains("In Progress"))';
            break;
          case "Done":
            columnSelector = '.project-column:has(.project-column-heading__title:contains("Done"))';
            break;
          default:
            alert('Invalid status');
            return;
        }
    
        // Create task HTML
        const taskHtml = `
          <div class='task' draggable='true' data-task-id="${taskId}">
            <div class='task__tags'>
              <span class='task__tag' style='background-color: ${task.SectionColor};'>${task.Section}</span>
              <button class='task__options'><i class="fas fa-ellipsis-h"></i></button>
              <div class="task__actions">
                <button class="edit-task">Edit</button>
                <button class="delete-task">Delete</button>
              </div>
            </div>
            <p>${task.Descriptions}</p>
            <div class='task__stats'>
              <span><time datetime="${task.DateExpired}"><i class="fas fa-flag"></i>${moment(task.DateExpired).format("DD/MM/YYYY HH:mm")}</time></span>
              <span class='task__owner' style="display: flex; align-items: center; justify-content: center; font-weight: bold; height: 30px; width: 30px; background-color: #e0e0e0; border-radius: 50%;">${task.crewName ? task.crewName.charAt(0) : ''}</span>
            </div>
          </div>`;
    
        // Append the task to the appropriate column
        $(columnSelector).append(taskHtml);
    
        // Reinitialize events for the new task
        const newTaskElement = $(columnSelector).find('.task').last()[0];
        setupDragEvents(newTaskElement);
        setupTaskOptions(newTaskElement);
      }


    // Initialize events for existing tasks
    function initializeTaskEvents() {
        const tasks = document.querySelectorAll(".task");

        tasks.forEach((task) => {
            setupDragEvents(task);
            setupTaskOptions(task);
        });
    }

    // Function to set up drag events
    function setupDragEvents(task) {
        task.addEventListener("dragstart", () => task.classList.add("dragging"));
        task.addEventListener("dragend", () => task.classList.remove("dragging"));
    }

    // Function to set up task options (edit, delete, toggle options menu)
    function setupTaskOptions(task) {
        const optionsButton = task.querySelector(".task__options");
        const taskActions = task.querySelector(".task__actions");
        const editButton = task.querySelector(".edit-task");
        const deleteButton = task.querySelector(".delete-task");

        optionsButton.addEventListener("click", (e) => toggleTaskActions(e, taskActions));
        document.addEventListener("click", (e) => closeTaskActions(e, task, taskActions));
        editButton.addEventListener("click", () => editTask(task));
        deleteButton.addEventListener("click", () => task.remove());
    }

    // Function to toggle task actions display
    function toggleTaskActions(e, taskActions) {
        e.stopPropagation();
        taskActions.style.display = taskActions.style.display === "block" ? "none" : "block";
    }

    // Function to close task actions when clicking outside
    function closeTaskActions(e, task, taskActions) {
        if (!task.contains(e.target)) {
            taskActions.style.display = "none";
        }
    }
    
});


