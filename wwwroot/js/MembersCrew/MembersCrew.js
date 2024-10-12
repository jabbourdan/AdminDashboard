function showTab(tabId, event) {
  // Hide all tab contents
  var tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(function (tab) {
    tab.classList.remove("active");
  });

  // Remove active class from all buttons
  var buttons = document.querySelectorAll(".tab-button");
  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  // Show the selected tab content
  document.getElementById(tabId).classList.add("active");

  // Add active class to the corresponding button
  event.currentTarget.classList.add("active");

  // Show or hide the week controls based on the active tab
  var weekControls = document.getElementById("week-controls");
  if (tabId === "Shifts") {
    weekControls.style.display = "flex";
    updateWeekDates(); // Initialize the week dates
  } else {
    weekControls.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var weekControls = {
    dateRangeElement: document.getElementById("week-dates"),
    prevWeekBtn: document.getElementById("prev-week"),
    nextWeekBtn: document.getElementById("next-week"),
    thisWeekBtn: document.getElementById("this-week"),
  };

  var currentWeekStart = new Date();
  currentWeekStart.setDate(
    currentWeekStart.getDate() - currentWeekStart.getDay()
  );

  function formatDate(date) {
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();
    return day + "/" + month + "/" + year;
  }

  function updateWeekDates() {
    var startDate = new Date(currentWeekStart);
    var endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    weekControls.dateRangeElement.textContent =
      formatDate(startDate) + " - " + formatDate(endDate);

    var datesRow = document.getElementById("dates-row");
    datesRow.innerHTML = "";
    for (var i = 0; i < 7; i++) {
      var date = new Date(startDate);
      date.setDate(date.getDate() + i);
      var th = document.createElement("th");
      th.textContent = formatDate(date);
      datesRow.appendChild(th);
    }
  }

  function changeWeek(offset) {
    currentWeekStart.setDate(currentWeekStart.getDate() + offset * 7);
    updateWeekDates();
  }

  weekControls.prevWeekBtn.addEventListener("click", function () {
    changeWeek(-1);
  });

  weekControls.nextWeekBtn.addEventListener("click", function () {
    changeWeek(1);
  });

  weekControls.thisWeekBtn.addEventListener("click", function () {
    currentWeekStart = new Date();
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay()
    );
    updateWeekDates();
  });

  updateWeekDates(); // Initialize the week dates

  // Initially hide the week controls
  document.getElementById("week-controls").style.display = "none";
});
