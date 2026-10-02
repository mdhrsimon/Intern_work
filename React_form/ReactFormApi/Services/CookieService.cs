using Microsoft.AspNetCore.Http;
using ReactFormApi.Constants;

namespace ReactFormApi.Services;

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
                Secure = true, // Always true for modern secure auth
                SameSite = SameSiteMode.None, // Required for cross-origin/cross-port SPA cookie transmission
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
                SameSite = SameSiteMode.None,
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
            SameSite = SameSiteMode.None,
            Path = AuthConstants.CookieRootPath,
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        response.Cookies.Delete(AuthConstants.AccessTokenCookie, expiredOptions);

        var refreshExpiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = AuthConstants.CookieAuthApiPath,
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        response.Cookies.Delete(AuthConstants.RefreshTokenCookie, refreshExpiredOptions);
    }
}
