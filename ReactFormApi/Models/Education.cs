namespace ReactFormApi.Models
{
    public class Education
    {
        public int Id { get; set; }

        public string Degree { get; set; } = "";

        public string Institute { get; set; } = "";

        public string YearPassed { get; set; } = "";

        public int UserId { get; set; }
    }
}
