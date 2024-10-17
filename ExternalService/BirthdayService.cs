using Hangfire;
using UI_USM_MVC.Data;
using UI_USM_MVC.Models;
using UI_USM_MVC.Controllers;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;



public class BirthdayService
{
    private readonly ApplicationDbContext _context;
    private readonly CouponService _couponService;

    public BirthdayService(ApplicationDbContext context, CouponService couponService)
    {
        _context = context;
        _couponService = couponService;
    }

    public void ScheduleMonthlyBirthdayCheck()
    {
        // Schedule the job to run on the first day of each month
        RecurringJob.AddOrUpdate("birthday-coupon-job", () => SendBirthdayCoupons(), Cron.Monthly(1));
    }

    public void SendBirthdayCoupons()
    {
        var today = DateTime.Today;

        // Verify that today is the first day of the month (this may already be handled by Hangfire, but we double-check)
        // comment it just for test
        // if (today.Day != 1)
        // {
        //     Console.WriteLine("This job should only run on the 1st of the month. Aborting...");
        //     return; // Exit the method if it's not the first day of the month /
        // }

        // Get the start and end of the next month
        var startOfNextMonth = new DateTime(today.Year, today.Month, 1).AddMonths(1); // 1st day of next month
        var endOfNextMonth = startOfNextMonth.AddMonths(1).AddDays(-1); // Last day of next month

        // Get all unique OrgIds from clients who have birthdays in the next month
        var clientsWithBirthdayNextMonth = _context.Client
            .Where(c => c.Month == startOfNextMonth.Month) // Filter by next month
            .ToList();

        var orgIds = clientsWithBirthdayNextMonth.Select(c => c.OrgId).Distinct();

        foreach (var orgId in orgIds)
        {
            var marketingController = new MarketingController(_context);

            // Check if sending messages is allowed for the OrgId
            var isAllowedToSendMessage = marketingController.CheckAllowedMessage(orgId ?? 1, "CelebrateBirthday");
            var responseCheckAllowed = isAllowedToSendMessage as JsonResult;

            if (responseCheckAllowed != null){

                var jsonResponseCheckAllowed = responseCheckAllowed.Value as dynamic;
                // Assuming `CheckAllowedMessage` returns a boolean, if not allowed, skip this OrgId
                if (jsonResponseCheckAllowed?.success == true && jsonResponseCheckAllowed?.isAllowed == true)
                {
                    // Send coupons for clients with this OrgId
                    SendCouponsForOrgId(orgId, clientsWithBirthdayNextMonth);
                }
                else
                {
                    Console.WriteLine($"Not allowed to send birthdat messages messages for OrgId: {orgId}");
                }
            }
            
        }
    }

    private void SendCouponsForOrgId(int? orgId, List<Client> clientsWithBirthdayNextMonth)
    {
        var clientsInOrg = clientsWithBirthdayNextMonth.Where(c => c.OrgId == orgId).ToList();

        foreach (var client in clientsInOrg)
        {
            // Generate a unique coupon code
            string couponCode = _couponService.GenerateCouponCode();

            // Save coupon to the database with an expiration date set to two months after their birthday month
            var coupon = new Coupons
            {
                ClientId = client.ClientId,
                CouponCode = couponCode,
                Discount = 20.00M, // Example discount of 20%
                ExpirationDate = DateTime.Today.AddMonths(2) // Coupon valid for 2 months from today
            };

            _context.Coupons.Add(coupon);
            _context.SaveChanges();

            // Send the coupon to the client via email or SMS
            SendCouponToClient(client, couponCode,DateTime.Today.AddMonths(2));
        }
    }

    public void SendCouponToClient(Client client, string couponCode,DateTime expired)
    {
        // Logic to send the coupon via email or SMS
        string message = $"Hello {client.FirstName}, happy early birthday! Here is your gift: a discount coupon with code {couponCode}. Expired in {expired}" +
                         $" please Use it before it expires!";
        // Example: log the message to the console for now
        Console.WriteLine("------------------------------------");
        Console.WriteLine(message);
        Console.WriteLine("------------------------------------");
    }
}
