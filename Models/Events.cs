using System.ComponentModel.DataAnnotations;

namespace UI_USM_MVC.Models
{
    public class Events
    {
        public int EventId { get; set; }
        public int? ClientId { get; set; }
        public int? OrgId { get; set; }
        public int? CrewId { get; set; }
        public string? Title { get; set; }
        public string? ClientName { get; set; }
        public DateTime Start { get; set; }
        public DateTime? End { get; set; }
        public bool AllDay { get; set; }
        public string? ClassName { get; set; }
        public string? Url { get; set; }
        public string? Color { get; set; }
    }
}
