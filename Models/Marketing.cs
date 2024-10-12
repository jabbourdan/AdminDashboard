using System.ComponentModel.DataAnnotations;
namespace UI_USM_MVC.Models
{
    public class Marketing
    {
        public int AutoId { get; set; }
        public string? OrgId { get; set; }
        public string? Section { get; set; }
        public string? Title { get; set; }
        public string? Descriptions { get; set; }
        public string? Status { get; set; }
    }
}
