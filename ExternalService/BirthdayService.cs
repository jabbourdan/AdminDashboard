using Hangfire;
using UI_USM_MVC.Data;
using UI_USM_MVC.Models;

public class BirthdayService
{
    private readonly ApplicationDbContext _context;
    private readonly CouponService _couponService;

    public BirthdayService(ApplicationDbContext context, CouponService couponService)
    {
        _context = context;
        _couponService = couponService;
    }

    public void ScheduleDailyBirthdayCheck()
    {
        // Schedule a daily job to check for birthdays
        RecurringJob.AddOrUpdate("birthday-coupon-job", () => SendBirthdayCoupons(), Cron.Weekly());
    }

    public void SendBirthdayCoupons()
    {
        var today = DateTime.Today;
        

        // Get clients who have a birthday today
        var clientsWithBirthday = _context.Client.Where(c => c.Month == today.Month && c.Day == today.Day).ToList();

        Console.WriteLine("------------------------------------");
        Console.WriteLine(clientsWithBirthday);
        Console.WriteLine("Today ---- Day: " + today.Day + " Month: " + today.Month);
        Console.WriteLine("------------------------------------");

        foreach (var client in clientsWithBirthday)
        {
            // Generate a unique coupon code
            string couponCode = _couponService.GenerateCouponCode();

            // Save coupon to database
            var coupon = new Coupon
            {
                ClientId = client.ClientId,
                CouponCode = couponCode,
                Discount = 20.00M, // Example discount of 20%
                ExpirationDate = DateTime.Today.AddMonths(1) // Expires in one month
            };
            //_context.Coupons.Add(coupon);
            //_context.SaveChanges();

            // Send the coupon to the client via email or SMS
            SendCouponToClient(client, couponCode);
        }
    }

    public void SendCouponToClient(Client client, string couponCode)
    {
        // Logic to send the coupon via email or SMS
        string message = $"Hello {client.FirstName}, happy birthday! Here is your gift: a discount coupon with code {couponCode}. Use it before it expires!";
        // Example: send via email or SMS
        Console.WriteLine("------------------------------------");
        Console.WriteLine(message);
        Console.WriteLine("------------------------------------");
    }

    
}
