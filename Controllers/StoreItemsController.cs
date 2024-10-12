using Microsoft.AspNetCore.Mvc;

public class StoreItemsController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
