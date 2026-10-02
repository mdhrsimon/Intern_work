namespace ReactFormApi.Constants;

public static class AuthConstants
{
    public const string AccessTokenCookie = "access_token";
    public const string RefreshTokenCookie = "refresh_token";

    public const string CookieRootPath = "/";
    public const string CookieAuthApiPath = "/api/auth";

    public const int DefaultAccessTokenExpiryMinutes = 15;
    public const int DefaultRefreshTokenExpiryDays = 7;
}
