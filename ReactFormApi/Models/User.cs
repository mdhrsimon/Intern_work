namespace ReactFormApi.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";

        public string Email { get; set; } = "";

        public string Phone { get; set; } = "";

        public string DateOfBirth { get; set; } = "";

        public string Address { get; set; } = "";

        public string Gender { get; set; } = "";

        public List<Education> Education { get; set; } = new();
    }
}
