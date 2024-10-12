using Microsoft.AspNetCore.Mvc;
using UI_USM_MVC.Models;
using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Data;
using System.Threading.Tasks.Dataflow;

public class TasksController : Controller
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    public JsonResult GetTasksByOrgId()
    {
        var tasks = _context.Tasks
        .Where(t => t.OrgId == 1)
        .Select(t => new
        {
            t.TaskId,
            t.Descriptions,
            t.Section,
            t.SectionColor,
            t.Status,
            t.CrewId,
            t.DateExpired,
            CrewName = _context.Crew.Where(c => c.CrewId == t.CrewId).Select(c => c.FirstName + " " + c.LastName).FirstOrDefault()
        })
        .ToList();

        return Json(tasks);
    }

    [HttpGet]
    public JsonResult GetCrewMembers()
    {
        var crewMembers = _context.Crew
            .Select(c => new { c.CrewId, c.FirstName, c.LastName })
            .ToList();
        return Json(crewMembers);
    }

    [HttpPost]
    public IActionResult AddTask([FromBody] Tasks task)
    {
        try
        {
            // Make sure OrgId is always set to 1
            task.OrgId = 1;

            // Set the current date and time for DataStart
            task.DataStart = DateTime.Now;
            Console.WriteLine($"DataStart: {task.DataStart}");

            // Save task to the database
            _context.Tasks.Add(task);
            _context.SaveChanges();

            return Ok(new { success = true, message = "Task added successfully.", taskId = task.TaskId });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);  // Log the exception message
            return StatusCode(500, new { success = false, message = "An error occurred: " + ex.Message });
        }
    }

    [HttpGet]
    [Route("Tasks/GetTaskById/{taskId}")]
    public async Task<IActionResult> GetTaskById(int taskId)
    {
        try
        {
            // Fetch the task from the database
            var task = await _context.Tasks
                .Where(t => t.TaskId == taskId)
                .Select(t => new
                {
                    t.TaskId,
                    t.Descriptions,
                    t.CrewId,
                    CrewName = _context.Crew.Where(c => c.CrewId == t.CrewId).Select(c => c.FirstName + " " + c.LastName).FirstOrDefault(),
                    t.DateExpired,
                    t.Status,
                    t.SectionColor,
                    t.Section
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound(new { success = false, message = "Task not found" });
            }

            return Ok(task);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while fetching the task", error = ex.Message });
        }
    }
    [HttpPut]
    [Route("Tasks/UpdateTask/{taskId}")]
    public async Task<IActionResult> UpdateTask(int taskId, [FromBody] Tasks updatedTask)
    {
        try
        {
            // Find the task in the database
            var task = await _context.Tasks.FindAsync(taskId);

            if (task == null)
            {
                return NotFound(new { success = false, message = "Task not found" });
            }

            // Update all the task properties
            task.Descriptions = updatedTask.Descriptions;
            task.CrewId = updatedTask.CrewId;
            task.Status = updatedTask.Status;
            task.Section = updatedTask.Section;  // Ensure the Section is updated
            task.SectionColor = updatedTask.SectionColor; // Ensure SectionColor is updated
            task.DateExpired = updatedTask.DateExpired; // Ensure DateExpired is updated

            // Save changes to the database
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Task updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while updating the task", error = ex.Message });
        }
    }


    [HttpDelete]
    [Route("Tasks/DeleteTask/{taskId}")]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        try
        {
            // Find the task by taskId
            var task = await _context.Tasks.FindAsync(taskId);

            if (task == null)
            {
                return NotFound(new { success = false, message = "Task not found" });
            }

            // Remove the task from the database
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Task deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while deleting the task", error = ex.Message });
        }
    }


    [HttpPut]
    [Route("Tasks/UpdateTaskStatus/{taskId}")]
    public async Task<IActionResult> UpdateTaskStatus(int taskId, [FromBody] UpdateTaskStatusRequest request)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(taskId);

            if (task == null)
            {
                return NotFound(new { success = false, message = "Task not found" });
            }

            // Update the task's status
            task.Status = request.Status;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Task status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while updating the task status", error = ex.Message });
        }
    }

    // Model for the request body
    public class UpdateTaskStatusRequest
    {
        public string? Status { get; set; }
    }

    [HttpGet]
    public IActionResult GetTasksFilter(string filter)
    {
        var today = DateTime.Today;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);
        
        IQueryable<Tasks> tasksQuery = _context.Tasks;

        if (filter == "today")
        {
            tasksQuery = tasksQuery.Where(t => t.DateExpired == today);
        }
        else if (filter == "week")
        {
            tasksQuery = tasksQuery.Where(t => t.DateExpired >= startOfWeek && t.DateExpired < startOfWeek.AddDays(7));
        }
        else if (filter == "month")
        {
            tasksQuery = tasksQuery.Where(t => t.DateExpired >= startOfMonth && t.DateExpired < startOfMonth.AddMonths(1));
        }
        else if (filter == "3-months")
        {
            tasksQuery = tasksQuery.Where(t => t.DateExpired >= startOfMonth && t.DateExpired < startOfMonth.AddMonths(3));
        }

        var taskList = tasksQuery.Select(t => new
        {
            t.Section,
            t.DateExpired,
            t.Status
            
        }).ToList();

        return Json(taskList); // Return tasks as JSON
    }

}



