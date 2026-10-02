using System.Security.Cryptography;

namespace ReactFormApi.Services;

public class RefreshTokenService
{
    public string GenerateToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
