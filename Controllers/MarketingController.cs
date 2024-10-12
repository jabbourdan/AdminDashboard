using Microsoft.AspNetCore.Mvc;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using System;
using System.Linq;
using UI_USM_MVC.Data;
using System.Threading.Tasks.Dataflow;
using DotNetEnv;

public class MarketingController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly string accountSid;
    private readonly string authToken;
    
    
    public MarketingController(ApplicationDbContext context)
    {
        _context = context;
        // Access the Twilio settings from environment variables
        accountSid = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID") ?? throw new ArgumentNullException("Twilio Account SID is missing from environment variables");
        authToken = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN") ?? throw new ArgumentNullException("Twilio Auth Token is missing from environment variables");
        
    }
    public IActionResult Index()
    {
        // Assuming we have OrgId = 1 for this example (you can make this dynamic)
        int orgId = 1;

        var organization = _context.Organization.FirstOrDefault(o => o.OrgId == orgId);

        if (organization != null)
        {
            // Pass the status of each reminder to the view
            ViewBag.OneHourReminder = organization.OneHourReminder ? "Enabled" : "Disabled";
            ViewBag.TwentyFourHourReminder = organization.TwentyFourHourReminder ? "Enabled" : "Disabled";
            ViewBag.NewAppointment = organization.NewAppointment ? "Enabled" : "Disabled";
            ViewBag.CancelledAppointment = organization.CancelledAppointment ? "Enabled" : "Disabled";
            ViewBag.CelebrateBirthday = organization.CelebrateBirthday ? "Enabled" : "Disabled";
            // ViewBag.RewardLoyalClients = organization.RewardLoyalClients ? "Enabled" : "Disabled"; 
            ViewBag.WelcomeNewClient = organization.WelcomeNewClient ? "Enabled" : "Disabled";
        }
        return View();
    }

    [HttpPost]
    // Ignore CSRF token validation
    public IActionResult SendWhatsAppMessage(string to, string message)
    {
        try
        {
            // Initialize Twilio client
            TwilioClient.Init(accountSid, authToken);

            var messageToSend = MessageResource.Create(
                body: message,  // Use the message parameter as the message content
                from: new PhoneNumber("whatsapp:+14155238886"),  // Your Twilio WhatsApp number
                to: new PhoneNumber(to)  // The recipient's phone number
            );

            // Return a JSON response with success and the message SID
            return Json(new { success = true, sid = messageToSend.Sid });
        }
        catch (Exception ex)
        {
            // Return an error message if something goes wrong
            return Json(new { success = false, error = ex.Message });
        }
    }

    // Action to update a specific reminder status
    [HttpPost]
    public IActionResult UpdateReminderStatus([FromBody] UpdateReminderStatusRequest request)
    {
        try
        {
            var organization = _context.Organization.FirstOrDefault(o => o.OrgId == request.OrgId);

            if (organization != null)
            {
                switch (request.ReminderType)
                {
                    case "OneHourReminder":
                        organization.OneHourReminder = request.Status == 1;
                        break;
                    case "TwentyFourHourReminder":
                        organization.TwentyFourHourReminder = request.Status == 1;
                        break;
                    case "NewAppointment":
                        organization.NewAppointment = request.Status == 1;
                        break;
                    case "CancelledAppointment":
                        organization.CancelledAppointment = request.Status == 1;
                        break;
                    case "CelebrateBirthday":
                        organization.CelebrateBirthday = request.Status == 1;
                        break;
                    case "WelcomeNewClient":
                        organization.WelcomeNewClient = request.Status == 1;
                        break;
                    default:
                        return Json(new { success = false, error = "Invalid reminder type" });
                }

                _context.SaveChanges();
                return Json(new { success = true });
            }

            return Json(new { success = false, error = "Organization not found" });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, error = ex.Message });
        }
    }

    [HttpGet]
    public JsonResult CheckAllowedMessage(int orgId, string messageType)
    {

        
        // Find the organization based on the orgId
        var organization = _context.Organization.FirstOrDefault(o => o.OrgId == orgId);

        Console.Write("----------------------------" + organization);
        if (organization != null)
        {
            bool isAllowed = false; // Default to not allowed

            // Check the relevant flag based on the messageType parameter
            switch (messageType)
            {
                case "WelcomeNewClient":
                    isAllowed = organization.WelcomeNewClient;
                    break;
                case "CancelledAppointment":
                    isAllowed = organization.CancelledAppointment;
                    break;
                case "NewAppointment":
                    isAllowed = organization.NewAppointment;
                    break;
                case "OneHourReminder":
                    isAllowed = organization.OneHourReminder;
                    break;
                case "TwentyFourHourReminder":
                    isAllowed = organization.TwentyFourHourReminder;
                    break;
                    // Add more cases here if needed
            }

            // Return true if allowed, otherwise false
            return Json(new { success = true, isAllowed = isAllowed });
        }

        // If no organization was found, return false
        return Json(new { success = false, isAllowed = false });
    }

}
