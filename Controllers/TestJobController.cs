using Hangfire;
using Microsoft.AspNetCore.Mvc;

namespace UI_USM_MVC.Controllers
{
    public class TestJobController : Controller
    {
        // This method enqueues a one-time background job
        public IActionResult Index()
        {
            Console.WriteLine("---------------------------------------");
            Console.WriteLine("---------------------------------------");
            // Enqueue a test background job
            BackgroundJob.Enqueue(() => Console.WriteLine("This is a test job!"));

            return View();
        }

        // This method schedules a recurring job
        public IActionResult ScheduleJob()
        {
            // Schedule a recurring job to run every minute
            RecurringJob.AddOrUpdate("test-job", () => Console.WriteLine("Recurring job test!"), Cron.Minutely);

            return View();
        }
    }
}
