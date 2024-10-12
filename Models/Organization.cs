using System.ComponentModel.DataAnnotations;

namespace UI_USM_MVC.Models
{
    public class Organization
    {
        public int OrgId { get; set; }
        public string? OrgName { get; set; }
        public string? Status { get; set; }
        public string? Twillo { get; set; } // for SMS
        public bool OneHourReminder  { get; set; }
        public bool TwentyFourHourReminder { get; set; }
        public bool NewAppointment { get; set; }
        public bool CancelledAppointment { get; set; }
        public bool CelebrateBirthday { get; set; }
        public bool WelcomeNewClient { get; set; }


        // Navigation property
        public ICollection<Client>? Client { get; set; }
    }
}
