namespace HQ.Server.Data.Enumerations;

public enum QuoteStatus
{
    Draft = 1,
    WaitingForSale = 2,
    WaitingForClient = 3,
    WaitingForStaff = 4,
    InProduction = 5,
    Completed = 6,
    Closed = 7,
    Lost = 8
}
