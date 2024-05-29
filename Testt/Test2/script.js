$(document).ready(function () {
  $("#filter-tasks-btn").on("click", function () {
    $("#datepicker-container").toggle();
  });

  $("#datepicker").daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: "Clear",
      format: "YYYY-MM-DD",
    },
  });

  $("#datepicker").on("apply.daterangepicker", function (ev, picker) {
    $(this).val(
      picker.startDate.format("YYYY-MM-DD") +
        " → " +
        picker.endDate.format("YYYY-MM-DD")
    );
  });

  $("#datepicker").on("cancel.daterangepicker", function (ev, picker) {
    $(this).val("");
  });
});
