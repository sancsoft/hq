using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Holiday : Base
{
    public DateOnly Date { get; set; }
    public string Name { get; set; } = null!;
    public Jurisdiciton Jurisdiciton { get; set; }
}