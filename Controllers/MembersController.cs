using Microsoft.AspNetCore.Mvc;

public class MembersController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
