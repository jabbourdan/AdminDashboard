using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;
using System.Threading.Tasks.Dataflow;
using System.Globalization;
using UI_USM_MVC.ExternalService;

namespace UI_USM_MVC.Controllers
{
    public class ScheduleController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ReminderService _reminderService;

        public ScheduleController(ApplicationDbContext context,IConfiguration configuration, ReminderService reminderService)
        {
            _context = context;
            _configuration = configuration;
            _reminderService = reminderService;
        }

        public IActionResult Index()
        {
            return View();
        }

        // API endpoint to get Events for FullCalendar
        [HttpGet]
        public async Task<JsonResult> GetEvents()
        {
            var events = await _context.Events.Select(e => new
            {
                eventId = e.EventId,
                title = e.Title,
                start = e.Start,
                end = e.End,
                allDay = e.AllDay,
                className = e.ClassName,
                color = e.Color,
                clientName = e.ClientName,
                clientId = e.ClientId
            }).ToListAsync();

            return new JsonResult(events);
        }

        // get events wih the filter of the date:
        public IActionResult GetEventsFilter(string filter)
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek); // Start of the week (Sunday)
            var startOfMonth = new DateTime(today.Year, today.Month, 1); // Start of the month

            IQueryable<Events> eventsQuery = _context.Events;

            if (filter == "today")
            {
                // Filter events for today
                eventsQuery = eventsQuery.Where(e => e.Start.Date == today);
            }
            else if (filter == "week")
            {
                // Filter events for this week
                eventsQuery = eventsQuery.Where(e => e.Start >= startOfWeek && e.Start < startOfWeek.AddDays(7));
            }
            else if (filter == "month")
            {
                // Filter events for this month
                eventsQuery = eventsQuery.Where(e => e.Start >= startOfMonth && e.Start < startOfMonth.AddMonths(1));
            }

            var eventList = eventsQuery.Select(e => new
            {
                e.Title,
                e.ClientName,
                Start = e.Start.ToString("yyyy-MM-dd HH:mm"), // Format the date as string
                End = e.End.HasValue ? e.End.Value.ToString("yyyy-MM-dd HH:mm") : null,
                e.Color
            }).ToList();

            return Json(eventList); // Return the events as JSON
        }


        // API endpoint to add a new event
        [HttpPost]
        public async Task<IActionResult> AddEvent([FromBody] Events newEvent)
        {
            Console.WriteLine("-------------------------------------------------------------------");

            if (ModelState.IsValid)
            {
                newEvent.OrgId = 1; // Assuming orgId is static for now
                await SaveEvent(newEvent);  // Save event to the database
                await HandleEventMessaging(newEvent, false);  // Handle the message sending logic

                return Ok(newEvent);
            }

            return BadRequest(ModelState);
        }

        // 1. Save the event to the database
        private async Task SaveEvent(Events newEvent)
        {
            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            // Log to confirm the event has been created
            Console.WriteLine($"New Event: {newEvent}");
        }

        // 2. Handle messaging logic for event creation
        private async Task HandleEventMessaging(Events eventObj, bool isUpdate)
        {
            var crewMember = await _context.Client.FirstOrDefaultAsync(c => c.ClientId == eventObj.ClientId);
            if (crewMember != null)
            {
                // Check if Mobile is null and handle the case
                var clientPhoneNumber = !string.IsNullOrEmpty(crewMember.Mobile) ? FormatPhoneNumber(crewMember.Mobile) : null;  // Handle null case
                var clientName = crewMember.FirstName ?? "Client";  // Assuming `FirstName` is the client name field, fallback to 'Client' if null

                if (!string.IsNullOrEmpty(clientPhoneNumber))
                {
                    // Create the message for either creation or update
                    var message = isUpdate ? CreateUpdateEventMessage(eventObj, clientName) // Message for updating an event
                        : CreateEventMessage(eventObj, clientName);      // Message for creating an event

                    CheckAndSendMessage(eventObj, clientPhoneNumber, message);
                }
                else
                {
                    Console.WriteLine("Client phone number is missing. Message not sent.");
                }
            }
        }


        // 3. Check if the message is allowed and send if applicable
        private void CheckAndSendMessage(Events obj, string clientPhoneNumber, string message)
        {
            var marketingController = new MarketingController(_context);

            // Await the CheckAllowedMessage since it might involve asynchronous database checks
            var isAllowedToSendMessage = marketingController.CheckAllowedMessage(obj.OrgId ?? 1, "NewAppointment"); // change the org id

            var responseCheckAllowed = isAllowedToSendMessage as JsonResult;
            if (responseCheckAllowed != null)
            {
                var jsonResponseCheckAllowed = responseCheckAllowed.Value as dynamic;
                if (jsonResponseCheckAllowed?.success == true && jsonResponseCheckAllowed?.isAllowed == true)
                {
                    // Await the SendWhatsAppMessage call
                    var result = marketingController.SendWhatsAppMessage(clientPhoneNumber, message);
                    var responseSendMessage = result as JsonResult;
                    var jsonSendMessage = responseSendMessage?.Value as dynamic;

                    if (jsonSendMessage != null && jsonSendMessage?.success == true)
                    {
                        Console.WriteLine("Message sent successfully.");

                        // Schedule a reminder 1 hour before the event start time using Hangfire
                         _reminderService.ScheduleReminder(clientPhoneNumber, obj.Start);
                    }
                    else
                    {
                        Console.WriteLine("Failed to send message.");
                    }
                }
                else
                {
                    Console.WriteLine("Not allowed to send message in this org.");
                }
            }
            else
            {
                Console.WriteLine("Failed to check message allowance.");
            }
        }



        // Helper function to create the update event message
        private string CreateUpdateEventMessage(Events updatedEvent, string clientName)
        {
            string formattedStartTime = updatedEvent.Start.ToString("MMMM dd, yyyy HH:mm", new CultureInfo("en-US"));
            return $"Hello {clientName}, your event '{updatedEvent.Title}' has been successfully updated! The updated event is now scheduled on {formattedStartTime}.";
        }

        // Helper function to create the event message
        private string CreateEventMessage(Events newEvent, string clientName)
        {
            string formattedStartTime = newEvent.Start.ToString("MMMM dd, yyyy HH:mm", new CultureInfo("en-US"));
            return $"Hello {clientName}, your event '{newEvent.Title}' has been successfully created! The event is scheduled on {formattedStartTime}.";
        }

        // Helper function to format the phone number
        private string FormatPhoneNumber(string mobile)
        {
            // Check if the phone number starts with '0'
            if (mobile.StartsWith("0"))
            {
                // Remove the leading '0' and add the prefix for WhatsApp and country code
                return $"whatsapp:+972{mobile.Substring(1)}";
            }

            // If it doesn't start with '0', assume it's already in the correct format
            return $"whatsapp:+972{mobile}";
        }




        // API endpoint to update an existing event
        [HttpPost]
        public async Task<IActionResult> UpdateEvent([FromBody] Events updatedEvent)
        {
            if (ModelState.IsValid)
            {
                var existingEvent = await _context.Events.FindAsync(updatedEvent.EventId);
                if (existingEvent != null)
                {
                    // Update properties as needed
                    existingEvent.Title = updatedEvent.Title;
                    existingEvent.ClientName = updatedEvent.ClientName;
                    existingEvent.Start = updatedEvent.Start;
                    existingEvent.End = updatedEvent.End;
                    existingEvent.AllDay = updatedEvent.AllDay;
                    existingEvent.ClassName = updatedEvent.ClassName;
                    existingEvent.Color = updatedEvent.Color;
                    existingEvent.OrgId = 1;

                    await _context.SaveChangesAsync();

                    await HandleEventMessaging(updatedEvent, true);

                    return Ok(existingEvent); // Return the updated event object
                }
                return NotFound();
            }
            return BadRequest(ModelState);
        }



        // API endpoint to delete an event
        [HttpPost]
        public async Task<IActionResult> DeleteEvent([FromBody] int eventId)
        {
            // Log to check if the method is called and the eventId received
            Console.WriteLine($"DeleteEvent called with EventId: {eventId}");
            var eventToDelete = await _context.Events.FindAsync(eventId);
            if (eventToDelete != null)
            {
                // Log to confirm the event was found
                Console.WriteLine($"Event found: {eventToDelete.Title}");

                _context.Events.Remove(eventToDelete);
                await _context.SaveChangesAsync();

                // Handle messaging for the canceled event
                await HandleCancelMessaging(eventToDelete); // Add this function to handle message sending

                // Log to confirm successful deletion
                Console.WriteLine("Event deleted successfully.");
                return Ok();
            }

            // Log when the event is not found
            Console.WriteLine("Event not found.");
            return NotFound();
        }

        // Handle messaging logic for event cancellation
        private async Task HandleCancelMessaging(Events eventObj)
        {
            var crewMember = await _context.Client.FirstOrDefaultAsync(c => c.ClientId == eventObj.ClientId);
            if (crewMember != null)
            {
                // Check if Mobile is null and handle the case
                var clientPhoneNumber = !string.IsNullOrEmpty(crewMember.Mobile) ? FormatPhoneNumber(crewMember.Mobile) : null;
                var clientName = crewMember.FirstName ?? "Client";

                if (!string.IsNullOrEmpty(clientPhoneNumber))
                {
                    var message = CreateCancelMessage(eventObj, clientName);
                    CheckAndSendCancelMessage(eventObj.OrgId, clientPhoneNumber, message);
                }
                else
                {
                    Console.WriteLine("Client phone number is missing. Cancellation message not sent.");
                }
            }
        }

        // Helper function to create the cancel message
        private string CreateCancelMessage(Events eventObj, string clientName)
        {
            return $"Hello {clientName}, your event '{eventObj.Title}' scheduled for {eventObj.Start.ToString("MMMM dd, yyyy HH:mm", new CultureInfo("en-US"))} has been canceled.";
        }

        // Check if the cancellation message is allowed and send if applicable
        private void CheckAndSendCancelMessage(int? orgId, string clientPhoneNumber, string message)
        {
            var marketingController = new MarketingController(_context);

            // Check if CancelledAppointment is allowed
            var isAllowedToSendMessage = marketingController.CheckAllowedMessage(orgId ?? 1, "CancelledAppointment");

            var responseCheckAllowed = isAllowedToSendMessage as JsonResult;
            if (responseCheckAllowed != null)
            {
                var jsonResponseCheckAllowed = responseCheckAllowed.Value as dynamic;
                if (jsonResponseCheckAllowed?.success == true && jsonResponseCheckAllowed?.isAllowed == true)
                {
                    var result = marketingController.SendWhatsAppMessage(clientPhoneNumber, message);
                    var responseSendMessage = result as JsonResult;
                    var jsonSendMessage = responseSendMessage?.Value as dynamic;

                    if (jsonSendMessage != null && jsonSendMessage?.success == true)
                    {
                        Console.WriteLine("Cancellation message sent successfully.");
                    }
                    else
                    {
                        Console.WriteLine("Failed to send cancellation message.");
                    }
                }
                else
                {
                    Console.WriteLine("Not allowed to send cancellation message in this org.");
                }
            }
            else
            {
                Console.WriteLine("Failed to check message allowance.");
            }
        }




        // // Test connection to the database and seed static events
        // public IActionResult TestConnection()
        // {
        //     try
        //     {
        //         // Check if any events exist in the database

        //         var events = _context.Events.ToList();

        //         if (events.Any())
        //         {
        //             var eventDetails = events.Select(e => $"Title: {e.Title}, Client: {e.ClientName}, Start: {e.Start}, End: {e.End}");
        //             return Content("Connection successful! Data retrieved from the database:\n" + string.Join("\n", eventDetails));
        //         }
        //         else
        //         {
        //             return Content("Connection successful! But no data found in the table.");
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         return Content($"Connection failed: {ex.Message}");
        //     }
        // }
    }
}
