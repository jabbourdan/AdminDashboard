using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;

namespace UI_USM_MVC.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult SetTheme(string theme, string returnUrl = "/")
    {
        Response.Cookies.Append("Theme", theme, new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1), HttpOnly = true });
        return Redirect(returnUrl);
    }
    public IActionResult Index()
    {
        return View();
    }


}
