using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using UI_USM_MVC.Data;
using Hangfire;
using Hangfire.MySql;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

// Add services to the container.
builder.Services.AddControllersWithViews();

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
builder.Services.AddHangfire(config =>
    config.UseStorage(new MySqlStorage(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlStorageOptions
        {
             // Optional: prefix for the Hangfire-related tables in your database
        }
    ))
);

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

app.Run();
