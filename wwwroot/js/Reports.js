document.addEventListener('DOMContentLoaded', function() {
    var categoryButtons = document.querySelectorAll('.btn-circle');
    var allReports = document.querySelectorAll('.list-group-item');
    var salesReports = document.querySelectorAll('.sales-reports');
    var financeReports = document.querySelectorAll('.finance-reports');
    var appointmentsReports = document.querySelectorAll('.appointments-reports');
    var teamReports = document.querySelectorAll('.team-reports');
    var clientsReports = document.querySelectorAll('.clients-reports');
    var inventoryReports = document.querySelectorAll('.inventory-reports');

    function showReports(reportsToShow) {
        allReports.forEach(function(report) {
            report.classList.remove('active');
        });
        reportsToShow.forEach(function(report) {
            report.classList.add('active');
        });
    }

    // Initially show all reports
    showReports(allReports);

    categoryButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove 'active' class from all buttons
            categoryButtons.forEach(function(btn) {
                btn.classList.remove('active');
                btn.style.color = 'black'; // Set text color to black for inactive buttons
            });
            // Add 'active' class to the clicked button
            this.classList.add('active');
            this.style.color = 'white'; // Set text color to white for the active button

            // Show the relevant reports based on the button clicked
            if (this.id === 'all-reports-btn') {
                showReports(allReports);
            } else if (this.id === 'sales-reports-btn') {
                showReports(salesReports);
            } else if (this.id === 'finance-reports-btn') {
                showReports(financeReports);
            } else if (this.id === 'appointments-reports-btn') {
                showReports(appointmentsReports);
            } else if (this.id === 'team-reports-btn') {
                showReports(teamReports);
            } else if (this.id === 'clients-reports-btn') {
                showReports(clientsReports);
            } else if (this.id === 'inventory-reports-btn') {
                showReports(inventoryReports);
            }
        });
    });
});