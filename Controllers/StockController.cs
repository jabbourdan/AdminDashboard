using Microsoft.AspNetCore.Mvc;

public class StockController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
