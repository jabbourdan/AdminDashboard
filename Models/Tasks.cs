
namespace UI_USM_MVC.Models
{
    public class Tasks
    {
        public int TaskId { get; set; }
        public int? OrgId { get; set; }
        public int? CrewId { get; set; }
        public string? Section { get; set; }
        public string? SectionColor { get; set; }
        public string? Descriptions { get; set; }
        public DateTime? DataStart { get; set; }
        public DateTime? DateExpired { get; set; }
        public string? Status { get; set; } //I should change the Status to TaskStatus for problem in the syntax when add new task
    }
}
