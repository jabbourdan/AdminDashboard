using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;

public class MarketingDealsController : Controller
{
    private readonly ApplicationDbContext _context;

    public MarketingDealsController(ApplicationDbContext context)
    {
            _context = context;
    }
    public IActionResult Index()
    {
        return View();
    }
}
