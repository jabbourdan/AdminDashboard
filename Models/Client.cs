using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UI_USM_MVC.Models
{
    public class Client
    {
        public int ClientId { get; set; }
        public int? OrgId { get; set; }

        [Required(ErrorMessage = "First name is required")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        public string? LastName { get; set; }

        public int? Day { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public string? Gender { get; set; }

        public string? Email { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        public string? Mobile { get; set; }

        public string? CountryCode { get; set; }

        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public bool Notification { get; set; }
        public string? PreferedNottification { get; set; }

        [ForeignKey("OrgId")]
        public Organization? Organization { get; set; } // Reference to the Organization model
    }
}
