document.addEventListener("DOMContentLoaded", function () {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const clientsTableBody = document.getElementById("clientsTableBody");
  const clientCheckboxes = clientsTableBody.querySelectorAll(".client-checkbox");
  const searchInput = document.getElementById("searchInput");
  const rows = clientsTableBody.getElementsByTagName("tr");
  const clientCount = document.getElementById("clientCount");

  // Handle select all checkboxes
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const isChecked = this.checked;
      const visibleCheckboxes = clientsTableBody.querySelectorAll(
        'tr:not([style*="display: none"]) .client-checkbox'
      );
      visibleCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
    });
  }

  // Handle checkbox change
  if (clientsTableBody) {
    clientsTableBody.addEventListener("change", function (event) {
      if (event.target.classList.contains("client-checkbox")) {
        updateSelectAllCheckbox();
      }
    });
  }

  // Handle search
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const filter = this.value.toLowerCase();
      Array.from(rows).forEach((row) => {
        const name = row
          .querySelector(".client-name")
          .textContent.toLowerCase();
        const email = row
          .querySelector(".client-email")
          .textContent.toLowerCase();
        const mobile = row
          .querySelector(".client-mobile")
          .textContent.toLowerCase();
        row.style.display =
          name.includes(filter) ||
          email.includes(filter) ||
          mobile.includes(filter)
            ? ""
            : "none";
      });
      updateClientCount();
      updateSelectAllCheckbox();
    });
  }

  // Update the count of visible clients
  function updateClientCount() {
    const visibleRows = clientsTableBody.querySelectorAll(
      'tr:not([style*="display: none"])'
    ).length;
    clientCount.textContent = visibleRows;
  }

  // Update select all checkbox state
  function updateSelectAllCheckbox() {
    const visibleCheckboxes = clientsTableBody.querySelectorAll(
      'tr:not([style*="display: none"]) .client-checkbox'
    );
    const checkedVisibleBoxes = clientsTableBody.querySelectorAll(
      'tr:not([style*="display: none"]) .client-checkbox:checked'
    );
    selectAllCheckbox.checked =
      visibleCheckboxes.length === checkedVisibleBoxes.length &&
      visibleCheckboxes.length > 0;
    selectAllCheckbox.indeterminate =
      checkedVisibleBoxes.length > 0 &&
      visibleCheckboxes.length !== checkedVisibleBoxes.length;
  }

  // Show and hide dropdown on click
  clientsTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("three-dots")) {
      const dropdown = event.target.nextElementSibling;
      dropdown.classList.toggle("show-dropdown");
    }
  });

  // Handle delete client click
  clientsTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-client")) {
      const clientId = event.target.getAttribute("data-client-id");
      debugger;
      if (confirm("Are you sure you want to delete this client?")) {
        deleteClient(clientId, event.target.closest('tr'));
      }
    }
  });

  // Delete client function with AJAX call to backend
  function deleteClient(clientId, row) {
    debugger;
    $.ajax({
      url: '/Members/DeleteClient', // Replace with your actual delete endpoint
      type: 'POST',
      data: { clientId: clientId }, // Send the clientId to the server
      success: function (response) {
        if (response.success) {
          row.remove(); // Remove the row from the table
          alert('Client deleted successfully.');
          updateClientCount(); // Update the client count
          updateSelectAllCheckbox(); // Update the select all checkbox state
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: function (xhr, status, error) {
        alert('An error occurred while deleting the client.');
      }
    });
  }

  // Initialize
  updateClientCount();
  updateSelectAllCheckbox();
});
