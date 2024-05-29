document.addEventListener("DOMContentLoaded", function () {
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    task.addEventListener("dragstart", () => {
      task.classList.add("dragging");
    });

    task.addEventListener("dragend", () => {
      task.classList.remove("dragging");
    });

    const optionsButton = task.querySelector(".task__options");
    const taskActions = task.querySelector(".task__actions");

    optionsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      taskActions.style.display =
        taskActions.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!task.contains(e.target)) {
        taskActions.style.display = "none";
      }
    });

    const editButton = task.querySelector(".edit-task");
    const deleteButton = task.querySelector(".delete-task");

    editButton.addEventListener("click", () => {
      const taskContent = task.querySelector("p");
      const newText = prompt("Edit task:", taskContent.textContent);
      if (newText) {
        taskContent.textContent = newText;
      }
    });

    deleteButton.addEventListener("click", () => {
      task.remove();
    });
  });

  const columns = document.querySelectorAll(".project-column");

  columns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(column, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        column.appendChild(draggable);
      } else {
        column.insertBefore(draggable, afterElement);
      }
    });
  });

  function getDragAfterElement(column, y) {
    const draggableElements = [
      ...column.querySelectorAll(".task:not(.dragging)"),
    ];

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
});

$(document).ready(function () {
  $("#start-date").daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: false,
      locale: {
        cancelLabel: "Clear",
      },
    },
    function (start) {
      $("#start-date").val(start.format("DD/MM/YYYY"));
    }
  );

  $("#end-date").daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: false,
      locale: {
        cancelLabel: "Clear",
      },
    },
    function (start) {
      $("#end-date").val(start.format("DD/MM/YYYY"));
    }
  );

  $("#start-date").on("apply.daterangepicker", function (ev, picker) {
    $(this).val(picker.startDate.format("DD/MM/YYYY"));
  });

  $("#start-date").on("cancel.daterangepicker", function (ev, picker) {
    $(this).val("");
  });

  $("#end-date").on("apply.daterangepicker", function (ev, picker) {
    $(this).val(picker.startDate.format("DD/MM/YYYY"));
  });

  $("#end-date").on("cancel.daterangepicker", function (ev, picker) {
    $(this).val("");
  });

  // Filter tasks based on date range
  $("#submit-dates").on("click", function () {
    let startDate = moment($("#start-date").val(), "DD/MM/YYYY");
    let endDate = moment($("#end-date").val(), "DD/MM/YYYY");

    if (!startDate.isValid() || !endDate.isValid()) {
      alert("Please select valid start and end dates.");
      return;
    }

    $(".task").each(function () {
      let taskDate = moment($(this).find("time").attr("datetime"));
      if (taskDate.isBetween(startDate, endDate, "days", "[]")) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // Show all tasks when clear button is clicked
  $(".ant-picker-clear").on("click", function () {
    $("#start-date").val("");
    $("#end-date").val("");
    $(".task").show();
  });
});
