using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using UI_USM_MVC.Data;

public class CatalogController : Controller
{
    private readonly ApplicationDbContext _context;

    public CatalogController(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        var services = _context.Services.ToList(); // Fetch services from the database
        return View(services);
    }

    public IActionResult AddNewService()
    {
        return View();
    }

    public IActionResult AddNewPackage()
    {
        return View();
    }


    [HttpPost]
    public JsonResult AddService([FromBody] Services service)
    {
        try
        {
            if (ModelState.IsValid)
            {
                service.OrgId = 1;
                _context.Services.Add(service);
                _context.SaveChanges();
                return Json(new { success = true });
            }
            else
            {
                return Json(new { success = false, message = "Invalid data received" });
            }
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while saving the service." });
        }
    }

    // Action to handle deleting a service
    [HttpDelete]
    public JsonResult DeleteService(int id)
    {
        try
        {
            var service = _context.Services.FirstOrDefault(s => s.ServicesId == id);
            if (service != null)
            {
                _context.Services.Remove(service);
                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false, message = "Service not found" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while deleting the service." });
        }
    }

    // Action to show the Edit form
    public IActionResult EditService(int id)
    {
        var service = _context.Services.FirstOrDefault(s => s.ServicesId == id);
        if (service == null)
        {
            return NotFound();
        }
        return View(service);
    }


    // Action to handle updating a service
    [HttpPost]
    public JsonResult EditService([FromBody] Services updatedService)
    {
        try
        {
            var service = _context.Services.FirstOrDefault(s => s.ServicesId == updatedService.ServicesId);
            if (service != null && ModelState.IsValid)
            {
                service.ServiceName = updatedService.ServiceName;
                service.Category = updatedService.Category;
                service.Descriptions = updatedService.Descriptions;
                service.Price = updatedService.Price;
                service.Duration = updatedService.Duration;
                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false, message = "Service not found or invalid data" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while updating the service." });
        }
    }

    [HttpGet]
    public JsonResult GetService(bool IsPackage)
    {
        try
        {
            var services = _context.Services.Where(s => s.Package == IsPackage).ToList();
            Console.WriteLine($"Fetched {services.Count} services successfully");
            return Json(new { success = true, data = services });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message} - {ex.StackTrace}");
            return Json(new { success = false, message = "An error occurred while fetching services." });
        }
    }


    [HttpPut]
    public JsonResult UpdateService([FromBody] Services updatedService)
    {
        try
        {
            var existingService = _context.Services.FirstOrDefault(s => s.ServicesId == updatedService.ServicesId);
            if (existingService != null)
            {
                existingService.ServiceName = updatedService.ServiceName;
                existingService.Category = updatedService.Category;
                existingService.Descriptions = updatedService.Descriptions;
                existingService.Duration = updatedService.Duration;
                existingService.Price = updatedService.Price;
                existingService.Sale = updatedService.Sale;

                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false, message = "Service not found" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while updating the service." });
        }
    }


    [HttpPost]
    public JsonResult UpdatePackage([FromBody] Services updatedPackage)
    {
        try
        {
            var existingPackage = _context.Services.FirstOrDefault(s => s.ServicesId == updatedPackage.ServicesId);
            if (existingPackage != null)
            {
                existingPackage.ServiceName = updatedPackage.ServiceName;
                existingPackage.Category = updatedPackage.Category;
                existingPackage.Descriptions = updatedPackage.Descriptions;
                existingPackage.Duration = updatedPackage.Duration;
                existingPackage.Price = updatedPackage.Price;
                existingPackage.Sale = updatedPackage.Sale;
                existingPackage.ConnectedServiceIds = updatedPackage.ConnectedServiceIds;

                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false, message = "Package not found" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while updating the package." });
        }
    }

    [HttpGet]
    public JsonResult GetAllServices()
    {
        try
        {
            var services = _context.Services.Where(s => s.OrgId == 1).ToList();
            return Json(new { success = true, data = services });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return Json(new { success = false, message = "An error occurred while fetching services." });
        }
    }



}


