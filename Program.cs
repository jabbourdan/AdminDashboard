using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using UI_USM_MVC.Data;
using Hangfire;
using Hangfire.MySql;
using DotNetEnv;
using UI_USM_MVC.ExternalService;  // Add the namespace where ReminderService and BirthdayService are located

var builder = WebApplication.CreateBuilder(args);

Env.Load();

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register the services as Scoped since they rely on ApplicationDbContext (which is also Scoped)
builder.Services.AddScoped<ReminderService>();
builder.Services.AddScoped<BirthdayService>();
builder.Services.AddScoped<CouponService>(); // Assuming CouponService handles coupon logic

// Configure MySQL and Hangfire storage
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 23))
    )
    .EnableSensitiveDataLogging() // Enables logging of sensitive data in SQL queries
    .EnableDetailedErrors()       // Provides detailed error messages from the database
);

// Configure Hangfire with MySQL storage
builder.Services.AddHangfire((sp, config) =>
{
    var connectionString = sp.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection");
    config.UseStorage(new MySqlStorage(connectionString, new MySqlStorageOptions
    {
        TablesPrefix = "Hangfire_"  // Optional, specify the table prefix if needed
    }));
});

// Add the Hangfire server for background job processing
builder.Services.AddHangfireServer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Hangfire Dashboard - Optional (requires authentication in production)
app.UseHangfireDashboard("/hangfire"); // Access the dashboard via /hangfire

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}");

// Trigger the SendBirthdayCoupons job immediately when the application starts by creating a new scope
using (var scope = app.Services.CreateScope())
{
    var birthdayService = scope.ServiceProvider.GetRequiredService<BirthdayService>();
    BackgroundJob.Enqueue(() => birthdayService.SendBirthdayCoupons());
}

app.Run();
