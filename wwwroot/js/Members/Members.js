document.addEventListener("DOMContentLoaded", function () {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const clientsTableBody = document.getElementById("clientsTableBody");
  const clientCheckboxes =
    clientsTableBody.querySelectorAll(".client-checkbox");
  const searchInput = document.getElementById("searchInput");
  const rows = clientsTableBody.getElementsByTagName("tr");
  const clientCount = document.getElementById("clientCount");

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

  if (clientsTableBody) {
    clientsTableBody.addEventListener("change", function (event) {
      if (event.target.classList.contains("client-checkbox")) {
        updateSelectAllCheckbox();
      }
    });
  }

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

  function updateClientCount() {
    const visibleRows = clientsTableBody.querySelectorAll(
      'tr:not([style*="display: none"])'
    ).length;
    clientCount.textContent = visibleRows;
  }

  updateClientCount();
  updateSelectAllCheckbox();
});
