using Microsoft.AspNetCore.Mvc;

public class DashboardController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult GeneralAnalytics()
    {

        return View();  // Uses Views/Home/Shop.cshtml
    }

    public IActionResult ShopAnalytics()
    {

        return View();  // Uses Views/Home/Analytics.cshtml
    }
}
