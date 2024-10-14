using Hangfire;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using System;

namespace UI_USM_MVC.ExternalService
{
    public class ReminderService
    {
        public void ScheduleReminder(string clientPhoneNumber, DateTime eventStartTime)
        {
            // Calculate the reminder time (1 hour before event start)
            DateTime reminderTime = eventStartTime.AddHours(-1);

            // Schedule a Hangfire job to send the reminder at the calculated time
            BackgroundJob.Schedule(() => Console.WriteLine("its a test for schdule time by hangfire"), reminderTime);
        }

    }
}
