// Tasks.js

document.addEventListener("DOMContentLoaded", function () {
  const columns = document.querySelectorAll(".project-column");

  // Fetch tasks from the server and display them
  fetchTasks();

  // Initialize dragover events for columns
  columns.forEach((column) => {
    column.addEventListener("dragover", (e) => handleDragOver(e, column));
  });

  // Function to fetch tasks from the server
  function fetchTasks() {
    $.ajax({
      url: '/Tasks/GetTasksByOrgId', // Ensure this URL matches your route
      method: 'GET',
      data: {}, // Send OrgId as a query parameter
      success: function (tasks) {
        tasks.forEach(task => {
          addTaskToColumn(task);
        });
      },
      error: function (error) {
        console.error("Error fetching tasks:", error);
        alert('An error occurred while fetching tasks. Please try again.');
      }
    });
  }

  // Function to add a task to the correct column based on status
  function addTaskToColumn(task) {

    let columnSelector;
    switch (task.status) {
      case "To Do":
        columnSelector = '.project-column:has(.project-column-heading__title:contains("To Do"))';
        break;
      case "In Progress":
        columnSelector = '.project-column:has(.project-column-heading__title:contains("In Progress"))';
        break;
      case "Done":
        columnSelector = '.project-column:has(.project-column-heading__title:contains("Done"))';
        break;
    }

    // Create task HTML
    const taskHtml = `
      <div class='task' draggable='true' data-task-id="${task.taskId}">
        <div class='task__tags'>
          <span class='task__tag' style='background-color: ${task.sectionColor};'>${task.section}</span>
          <button class='task__options'><i class="fas fa-ellipsis-h"></i></button>
          <div class="task__actions">
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>
          </div>
        </div>
        <p>${task.descriptions}</p>
        <div class='task__stats'>
          <span><time datetime="${task.dateExpired}"><i class="fas fa-flag"></i>${moment(task.dateExpired).format("DD/MM/YYYY HH:mm")}</time></span>
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

  // Function to set up drag events
  function setupDragEvents(task) {
    task.addEventListener("dragstart", () => task.classList.add("dragging"));
    task.addEventListener("dragend", () => task.classList.remove("dragging"));
    task.addEventListener("dragend", () => handleDragEnd(task));
  }

  // Function to set up task options (edit, delete, toggle options menu)
  function setupTaskOptions(task) {
    const optionsButton = task.querySelector(".task__options");
    const taskActions = task.querySelector(".task__actions");
    const editButton = task.querySelector(".edit-task");
    const deleteButton = task.querySelector(".delete-task");

    optionsButton.addEventListener("click", (e) => toggleTaskActions(e, taskActions));
    document.addEventListener("click", (e) => closeTaskActions(e, task, taskActions));

    // Modify this part to add the console log
    editButton.addEventListener("click", () => {
      console.log("Edit button clicked"); // Log to the console
      editTask(task);
    });

    deleteButton.addEventListener("click", () => deleteTask(task));
  }

  // Function to handle deleting a task
  function deleteTask(task) {
    debugger;
    const taskId = task.getAttribute('data-task-id');
    if (confirm('Are you sure you want to delete this task?')) {
      $.ajax({
        url: `/Tasks/DeleteTask/${taskId}`, // Ensure this URL matches your route
        method: 'DELETE',
        success: function (response) {
          if (response.success) {
            task.remove();
            alert('Task deleted successfully.');
          } else {
            alert('Failed to delete task: ' + response.message);
          }
        },
        error: function (error) {
          console.error("Error deleting task:", error);
          alert('An error occurred while deleting the task. Please try again.');
        }
      });
    }
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




  // Function to handle dragover events for columns
  function handleDragOver(e, column) {
    e.preventDefault();
    const afterElement = getDragAfterElement(column, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (afterElement == null) {
      column.appendChild(draggable);
    } else {
      column.insertBefore(draggable, afterElement);
    }
  }

  // Function to get the element after which to place the dragged item
  function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll(".task:not(.dragging)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
  $(document).on('click', '#cancelEdit', function () {
    debugger;
    closeEditSlider();
  });  

});

// Function to handle drag end events and update the status in the database
function handleDragEnd(task) {
  task.classList.remove("dragging");

  // Find the column the task was dropped into
  const newColumn = task.closest('.project-column');
  const newStatus = newColumn.querySelector('.project-column-heading__title').textContent.trim();

  // Get the current status
  const currentStatus = $(task).find('.task__tag').text();

  // Check if the status has changed
  if (currentStatus !== newStatus) {
      // Confirm with the user if they want to change the status
      if (confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
        
          // Get taskId
          const taskId = task.getAttribute('data-task-id');

          // Make an AJAX call to update the task's status in the database
          $.ajax({
              url: `/Tasks/UpdateTaskStatus/${taskId}`, // Backend endpoint to update status
              method: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({ status: newStatus }),
              success: function (response) {
                  if (response.success) {
                      console.log('Task status updated successfully');
                  } else {
                      alert('Failed to update task status: ' + response.message);
                  }
              },
              error: function (error) {
                  console.error('Error updating task status:', error);
                  alert('An error occurred while updating the task status. Please try again.');
              }
          });
      } else {
          // If the user cancels, move the task back to its original column
          const originalColumnSelector = `.project-column:has(.project-column-heading__title:contains("${currentStatus}"))`;
          $(task).detach().appendTo(originalColumnSelector);
      }
  }
}

// Open the edit form with pre-filled data
// Open the edit form with pre-filled data
function editTask(task) {
  const taskId = task.getAttribute('data-task-id');

  // Fetch task details using AJAX
  $.ajax({
    url: `/Tasks/GetTaskById/${taskId}`, // Adjust this URL to match your backend route
    method: 'GET',
    success: function (data) {
      console.log(data);

      // Populate the form with task details
      $('#editTaskForm #taskTitle').val(data.descriptions); // Set the task description
      $('#editTaskForm #taskEndTime').val(moment(data.dateExpired).format("YYYY-MM-DDTHH:mm")); // Format the date
      $('#editTaskForm #taskStatus').val(data.status); // Set the status
      $('#editTaskForm #taskCategory').val(data.Section);
      $('#editTaskForm #taskColor').val(data.sectionColor);
      $('#editTaskForm').attr('data-task-id', taskId); // Store taskId in the form

      // Fetch all crew members
      $.ajax({
        url: '/Tasks/GetCrewMembers', // Make sure this route returns all crew members
        method: 'GET',
        success: function (crewData) {
          const assignToSelect = $('#editTaskForm #taskAssignTo');
          assignToSelect.empty();
          assignToSelect.append(new Option("Select Crew Member", "")); // Add default option

          // Populate the dropdown with crew members
          crewData.forEach(member => {
            const fullName = `${member.firstName} ${member.lastName}`;
            assignToSelect.append(new Option(fullName, member.crewId));
          });

          // Set the selected value to the current crew member of the task
          assignToSelect.val(data.crewName);
        },
        error: function (error) {
          console.error("Error fetching crew members:", error);
          alert('An error occurred while fetching crew members.');
        }
      });

      // Open the slider form
      $('#editTaskSlider').fadeIn().addClass('active');
      $('.project').addClass('shrink');
    },
    error: function (error) {
      console.error("Error fetching task details:", error);
      alert('An error occurred while fetching task details.');
    }
  });
}

// Handle edit form submission
$('#editTaskForm').on('submit', function (e) {
  e.preventDefault();

  const taskId = $(this).attr('data-task-id'); // Get taskId from the form's data attribute

  // Construct the updated task object
  const updatedTask = {
    TaskId: taskId,
    Descriptions: $('#editTaskForm #taskTitle').val(),
    CrewId: $('#editTaskForm #taskAssignTo').val(),
    CrewName: $('#editTaskForm #taskAssignTo option:selected').text(),
    Status: $('#editTaskForm #taskStatus').val(),
    Section: $('#editTaskForm #taskCategory').val(),
    SectionColor: $('#editTaskForm #taskColor').val(),
    DateExpired: $('#editTaskForm #taskEndTime').val()
  };
  
  debugger;
  // Send the updated task data to the server
  $.ajax({
    url: `/Tasks/UpdateTask/${taskId}`, // Ensure this URL matches your backend route
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(updatedTask),
    success: function (response) {
      if (response.success) {
        console.log('Task updated successfully:', response);

        // Close the edit slider
        $('#editTaskForm')[0].reset();
        closeEditSlider();

        // Update the task in the UI without refreshing
        updateTaskInUI(updatedTask);
      } else {
        alert('Failed to update task: ' + response.message);
      }
    },
    error: function (error) {
      console.error('Error updating task:', error);
      alert('An error occurred while updating the task. Please try again.');
    }
  });
});

// Function to update the task in the UI
function updateTaskInUI(updatedTask) {
  // Find the existing task element using its data-task-id attribute
  const taskElement = $(`.task[data-task-id='${updatedTask.TaskId}']`);

  if (taskElement.length) {
    // Update the task details in the UI
    taskElement.find('.task__tag').css('background-color', updatedTask.SectionColor).text(updatedTask.Section);
    taskElement.find('p').text(updatedTask.Descriptions);
    taskElement.find('time').attr('datetime', updatedTask.DateExpired).html(`<i class="fas fa-flag"></i>${moment(updatedTask.DateExpired).format("DD/MM/YYYY HH:mm")}`);
    taskElement.find('.task__owner').text(updatedTask.CrewName.charAt(0));

    // Move the task to the appropriate column if the status has changed
    let newColumnSelector;
    switch (updatedTask.Status) {
      case "To Do":
        newColumnSelector = '.project-column:has(.project-column-heading__title:contains("To Do"))';
        break;
      case "In Progress":
        newColumnSelector = '.project-column:has(.project-column-heading__title:contains("In Progress"))';
        break;
      case "Done":
        newColumnSelector = '.project-column:has(.project-column-heading__title:contains("Done"))';
        break;
    }

    // If the task status has changed, move it to the correct column
    if (!taskElement.closest(newColumnSelector).length) {
      taskElement.detach().appendTo(newColumnSelector);
    }
  }
}


// Function to handle closing the slider
function closeEditSlider() {
  debugger;
  $('#editTaskSlider').fadeOut().removeClass('active');
  $('.project').removeClass('shrink');
  $('#editTaskForm')[0].reset(); // Reset the form fields
}
