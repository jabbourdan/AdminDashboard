using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;

public class DashboardController : Controller
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }
    public IActionResult Index()
    {
        var clientCount = _context.Client.Count();

        var crewCount = _context.Crew.Count();

        var servicesCount = _context.Services.Where(s => s.Package == false).Count();

        var eventCount = _context.Events.Count();

        // Print the counts in the console
        // Console.WriteLine($"Client Count: {clientCount}");
        // Console.WriteLine($"Crew Count: {crewCount}");

        // Pass the counts to the view
        ViewBag.ClientCount = clientCount;
        ViewBag.CrewCount = crewCount;
        ViewBag.ServicesCount = servicesCount;
        ViewBag.EventCount = eventCount;
        
        return View();
    }


    public IActionResult ShopAnalytics()
    {

        return View();  // Uses Views/Home/Analytics.cshtml
    }
}
