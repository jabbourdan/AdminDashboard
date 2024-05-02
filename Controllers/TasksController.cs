using Microsoft.AspNetCore.Mvc;

public class TasksController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
