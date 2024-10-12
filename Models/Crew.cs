using System.ComponentModel.DataAnnotations;
namespace UI_USM_MVC.Models
{
    public class Crew
    {
        public int CrewId { get; set; }
        
        [Required(ErrorMessage = "First name is required")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        public string? LastName { get; set; }

        [Required]
        public int? OrgId { get; set; }

        public int? Day { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public string? Gender { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        public string? Mobile { get; set; }

        public string? CountryCode { get; set; }
    }
}
