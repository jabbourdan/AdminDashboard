using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;


public class MembersController : Controller
{
    private readonly ApplicationDbContext _context;

    public MembersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Action to display the list of members
    public IActionResult Index()
    {
        // Ensure that the _context.Client is properly fetched
        var clients = _context.Client.Where(c => c.OrgId == 1).ToList();

        // Check if clients are retrieved and pass the list to the view
        return View(clients ?? new List<Client>());
    }

    [HttpGet]
    public IActionResult GetClients()
    {
        try
        {
            // Fetch clients where OrgId = 1
            var clients = _context.Client
                .Where(c => c.OrgId == 1)
                .Select(c => new { c.ClientId, FullName = $"{c.FirstName} {c.LastName}" }) // Adjust the property names based on your Client model
                .ToList();

            return Json(clients);
        }
        catch (Exception ex)
        {
            // Log any errors and return an empty list or error message
            Console.WriteLine($"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
            return Json(new List<object>());
        }
    }

    // Action to display the AddClient form
    [HttpGet]
    public IActionResult AddClient()
    {
        return View(new Client());
    }

    // Action to handle the AddClient form submission
    [HttpPost]
    public IActionResult AddClient([FromBody] Client model)
    {
        // Log the received model for debugging
        Console.WriteLine($"Received model: {Newtonsoft.Json.JsonConvert.SerializeObject(model)}");

        if (ModelState.IsValid)
        {
            try
            {
                _context.Client.Add(model);
                _context.SaveChanges(); // Save changes to the database

                // Redirect to the Index action after successful save
                return Json(new { success = true, message = "Client saved successfully", redirectUrl = Url.Action("Index", "Members") });
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
                return Json(new { success = false, message = "An error occurred while saving the client." });
            }
        }

        return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList() });
    }


    [HttpPost]
    public JsonResult DeleteClient(int clientId)
    {
        try
        {
            // Find the client by clientId in the database
            var client = _context.Client.FirstOrDefault(c => c.ClientId == clientId);

            if (client == null)
            {
                return Json(new { success = false, message = "Client not found." });
            }

            // Remove the client from the database
            _context.Client.Remove(client);
            _context.SaveChanges(); // Save the changes to the database

            // Return success response
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            // Return failure response with the error message
            return Json(new { success = false, message = ex.Message });
        }
    }

}
