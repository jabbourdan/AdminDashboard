using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;

public class MembersCrewController : Controller
{
    private readonly ApplicationDbContext _context;

    public MembersCrewController(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        // Fetch only crew members where OrgId = 1
        var crews = _context.Crew.Where(c => c.OrgId == 1).ToList();

        // Pass the filtered list to the view
        return View(crews ?? new List<Crew>());
    }

    [HttpGet]
    public IActionResult AddCrew()
    {
        return View(new Crew());
    }

    // Action to handle the AddCrew form submission
    [HttpPost]
    public IActionResult AddCrew([FromBody] Crew model)
    {
        if (ModelState.IsValid)
        {
            try
            {
                // Ensure the OrgId is set to 1 when adding a new crew member
                model.OrgId = 1;
                _context.Crew.Add(model);
                _context.SaveChanges(); // Save changes to the database

                // Redirect to the Index action after successful save
                return Json(new { success = true, message = "Crew saved successfully", redirectUrl = Url.Action("Index", "MembersCrew") });
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
                return Json(new { success = false, message = "An error occurred while saving the Crew." });
            }
        }

        return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList() });
    }
}
