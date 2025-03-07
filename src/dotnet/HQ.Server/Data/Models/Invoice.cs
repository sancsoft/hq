﻿namespace HQ.Server.Data.Models;

public class Invoice : Base
{
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public DateOnly Date { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public ICollection<Time> Times { get; set; } = new List<Time>();
    // Invoice PDF link
    public decimal Total { get; set; }
    public decimal TotalApprovedHours { get; set; }
}