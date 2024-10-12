const sideLinks = document.querySelectorAll(
  ".sidebar1 .side-menu li a:not(.logout), .sidebar1 .side-menu .dropdown-btn"
);
const sidebar1 = document.querySelector(".sidebar1");
const menuBar = document.querySelector(".content nav .bx.bx-menu-alt-left");

document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.getElementById("theme-toggle");
  const body = document.body;

  // Restore dropdown state from local storage
  const dropdownState = localStorage.getItem("dropdownState");
  if (dropdownState) {
    document.querySelectorAll(".dropdown-container").forEach((container) => {
      container.style.display = dropdownState;
      if (dropdownState === "block") {
        container.classList.add("active");
      }
    });
  }

  // Check the current theme from local storage or server-set class
  const currentTheme =
    localStorage.getItem("theme") ||
    (body.classList.contains("dark") ? "dark" : "light");
  toggler.checked = currentTheme === "dark";
  if (currentTheme === "dark") {
    body.classList.add("dark");
  } else {
    body.classList.remove("dark");
  }

  toggler.addEventListener("change", function () {
    const theme = this.checked ? "dark" : "light";
    localStorage.setItem("theme", theme); // Save theme preference locally
    body.classList.toggle("dark", this.checked); // Toggle dark class immediately

    // Perform a server update without reloading the page
    fetch(`/Home/SetTheme?theme=${theme}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log("Theme updated successfully");
      })
      .catch((error) => {
        console.error("Error updating theme:", error);
      });
  });
});


sideLinks.forEach((item) => {
  const li = item.parentElement;
  item.addEventListener("click", () => {
    // Open the sidebar1 if it is collapsed
    if (sidebar1.classList.contains("close")) {
      sidebar1.classList.remove("close");
    }

    // Remove active class from all links and buttons
    sideLinks.forEach((i) => {
      i.parentElement.classList.remove("active");
      i.classList.remove("active"); // Also remove active class from dropdown-btn
    });

    // Add active class to the clicked link or button
    li.classList.add("active");
    item.classList.add("active");

    // Show the dropdown content if the dropdown button is clicked
    if (item.classList.contains("dropdown-btn")) {
      const dropdownContent = item.nextElementSibling;
      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";
      dropdownContent.classList.toggle(
        "active",
        dropdownContent.style.display === "block"
      );

      // Save the dropdown state to local storage
      localStorage.setItem(
        "dropdownState",
        dropdownContent.style.display === "block" ? "block" : "none"
      );
    } else {
      // If a link inside the dropdown is clicked, make sure to keep the dropdown open
      const parentDropdown = item.closest(".dropdown-container");
      if (parentDropdown) {
        parentDropdown.style.display = "block";
        parentDropdown.classList.add("active");
      }
    }
  });
});

menuBar.addEventListener("click", () => {
  sidebar1.classList.toggle("close");
  // Hide all dropdown containers when the sidebar1 is collapsed
  if (sidebar1.classList.contains("close")) {
    document.querySelectorAll(".dropdown-container").forEach((container) => {
      container.style.display = "none";
      container.classList.remove("active");
    });
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sidebar1.classList.add("close");
    // Hide all dropdown containers when the sidebar1 is collapsed
    document.querySelectorAll(".dropdown-container").forEach((container) => {
      container.style.display = "none";
      container.classList.remove("active");
    });
  } else {
    sidebar1.classList.remove("close");
  }
  if (window.innerWidth > 576) {
    searchBtnIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});
