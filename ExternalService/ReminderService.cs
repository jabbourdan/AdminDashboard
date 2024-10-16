using Hangfire;
using System;
using UI_USM_MVC.Data;
using UI_USM_MVC.Controllers;
using System.Globalization;


namespace UI_USM_MVC.ExternalService
{
    public class ReminderService
    {
        private readonly ApplicationDbContext _context;

        public ReminderService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Schedule a reminder to be sent 1 hour before the event
        public void ScheduleReminder(string clientName, string phoneNumber, DateTime eventStartTime, int hours)
        {
            // Calculate the reminder time (1 hour before event start)
            DateTime reminderTime = eventStartTime.AddHours(-hours);
            // Schedule a Hangfire job to send the reminder at the calculated time
            BackgroundJob.Schedule(() => SendReminder(phoneNumber, clientName, eventStartTime), reminderTime);
        }

        // This method will be called by Hangfire to send the personalized reminder
        public void SendReminder(string clientPhoneNumber, string clientName, DateTime eventStartTime)
        {
            // Set the culture to English (United States)
            var culture = new CultureInfo("en-US");

            // Format the event start time in English
            string formattedEventTime = eventStartTime.ToString("f", culture); // e.g., "Saturday, October 14, 2024 3:00 PM"

            // Personalized message with client's name, event time, and reminder type (1 hour or 24 hours)
            string personalizedMessage = $"Hello {clientName}, this is a reminder that your event is scheduled at {formattedEventTime}. We look forward to seeing you!";

            // Use MarketingController to send the WhatsApp message
            var marketingController = new MarketingController(_context);
            marketingController.SendWhatsAppMessage(clientPhoneNumber, personalizedMessage);
        }
    }
}
