using System;

namespace HQ.Library.Models
{
    /// <summary>
    /// POCO of a time entry in the system
    /// </summary>
    public class TimeEntry
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public int CodeId { get; set; }
        public DateTime DatePerformed { get; set; }
        public decimal NumberOfHours { get; set; }
        public string Note { get; set; }
        public DateTime CreatedTS { get; set; }
        public DateTime ModifiedTS { get; set; }
    }
}
