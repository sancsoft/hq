
using HQ.Abstractions.Staff;
using HQ.Abstractions.Times;

namespace HQ.Abstractions.Emails
{
    public class EmployeeHoursEmail : NotificationEmail
    {
        //This will contain staff name and hours 
        public List<StaffHoursModel> Staff { get; set; } = null!;
        public DateOnly Date { get; set; }

        public DateOnly PeriodBegin { get; set; }
        public DateOnly PeriodEnd { get; set; }

        public static new EmployeeHoursEmail Sample = new()
        {
            Heading = "Staff Hours",
            Message = "Staff with red signify they have less working hours than expected",
            Date = new DateOnly(2024, 7, 17),
            PeriodBegin = new DateOnly(2024, 7, 17),
            PeriodEnd = new DateOnly(2024, 7, 23),

            Staff = new List<StaffHoursModel>{
                new StaffHoursModel{
                    StaffName = "Amr",
                    HoursLastWeek= 0,
                    HoursLastMonth = 0,
                    HoursThisMonth = 4,
                    WorkHours = 40,
                },
                new StaffHoursModel{
                    StaffName = "Ryan",
                    HoursLastWeek= 55,
                    HoursLastMonth = 6,
                    HoursThisMonth = 7,
                    WorkHours = 40,
                },
                new StaffHoursModel{
                    StaffName = "Pri",
                    HoursLastWeek= 32,
                    HoursLastMonth = 9,
                    WorkHours = 40,
                    HoursThisMonth = 10
                }
            }

        };
        public class StaffHoursModel
        {
            public decimal HoursLastWeek { get; set; }
            public decimal HoursLastMonth { get; set; }
            public decimal HoursThisMonth { get; set; }
            public string? StaffName { get; set; }
            public string? StaffDashboardURL { get; set; }
            public bool MissingHours { get; set; }
            public bool LessThanExpectedHours { get; set; }
            public int WorkHours { get; set; }
            public int PercentageWorkedHours { get; set; }

        }
    }
}