using Hangfire;
using System;
using UI_USM_MVC.Data;
using UI_USM_MVC.Controllers; 

namespace UI_USM_MVC.ExternalService
{
    public class ReminderService
    {
        private readonly ApplicationDbContext _context;
        
        public ReminderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public void ScheduleReminder(string PhoneNumber, DateTime eventStartTime)
        {
            

            // Calculate the reminder time (1 hour before event start)
            DateTime reminderTime = eventStartTime.AddHours(-1);
            var clientPhoneNumber = !string.IsNullOrEmpty(PhoneNumber) ? FormatPhoneNumber(PhoneNumber): null; 

            // Schedule a Hangfire job to send the reminder at the calculated time
            BackgroundJob.Schedule(() => SendReminder(PhoneNumber), reminderTime);
        }

        // This method will be called by Hangfire
        public void SendReminder(string clientPhoneNumber)
        {
            var marketingController = new MarketingController(_context);
            marketingController.SendWhatsAppMessage(clientPhoneNumber, "This is your event reminder.");
        }

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
    }
}
