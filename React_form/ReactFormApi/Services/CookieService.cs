using Microsoft.AspNetCore.Http;
using ReactFormApi.Constants;

namespace ReactFormApi.Services;

// SameSite=Lax is used because localhost:5173 and localhost:5070 share the same site in development.
// Note: If the app is ever deployed with frontend and API on different registrable domains,
// SameSite=None plus an X-Requested-With header check would be needed.
public class CookieService
{
    public void SetAccessTokenCookie(HttpResponse response, string token, DateTime expires)
    {
        response.Cookies.Append(
            AuthConstants.AccessTokenCookie,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = AuthConstants.CookieRootPath,
                Expires = expires,
                IsEssential = true
            });
    }

    public void SetRefreshTokenCookie(HttpResponse response, string token, DateTime expires)
    {
        response.Cookies.Append(
            AuthConstants.RefreshTokenCookie,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = AuthConstants.CookieAuthApiPath,
                Expires = expires,
                IsEssential = true
            });
    }

    public void ClearAuthCookies(HttpResponse response)
    {
        var expiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = AuthConstants.CookieRootPath,
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        response.Cookies.Delete(AuthConstants.AccessTokenCookie, expiredOptions);

        var refreshExpiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = AuthConstants.CookieAuthApiPath,
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        response.Cookies.Delete(AuthConstants.RefreshTokenCookie, refreshExpiredOptions);
    }
}
