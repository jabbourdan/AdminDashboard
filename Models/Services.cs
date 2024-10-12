using System.Collections.Generic;

namespace UI_USM_MVC.Models
{
    public class Services
    {
        public int ServicesId { get; set; }
        public int? OrgId { get; set; }
        public string? ServiceName { get; set; }
        public string? ServiceColor { get; set; }
        public string? Category { get; set; }
        public string? Descriptions { get; set; }
        public double? Price { get; set; }
        public string? Duration { get; set; }
        public string? Sale { get; set; }
        public bool? Package { get; set; }
        public string? ConnectedServiceIds { get; set; }
    }

}
