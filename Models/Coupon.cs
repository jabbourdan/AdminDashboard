namespace UI_USM_MVC.Models
{
    public class Coupon
    {
        public int CouponId { get; set; }
        public int ClientId { get; set; }  // Foreign key to Client
        public string? CouponCode { get; set; }
        public decimal Discount { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsRedeemed { get; set; } = false;  // Default to false

    }
}