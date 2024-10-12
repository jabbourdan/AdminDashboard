using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;

public class SettingsController : Controller
{
    private readonly ApplicationDbContext _context;

    public SettingsController(ApplicationDbContext context)
    {
            _context = context;
    }
    public IActionResult Index()
    {
        return View();
    }
}
