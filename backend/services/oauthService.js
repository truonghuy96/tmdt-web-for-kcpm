const { oauthConfig } = require("../config/oauth");

/**
 * Trao đổi Authorization Code lấy Google Tokens (access_token, id_token)
 */
async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri, tokenUrl } = oauthConfig.google;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth credentials are not fully configured in environment variables.");
  }

  const requestBody = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google token exchange error: ${response.status} - ${errText}`);
  }

  return response.json();
}

/**
 * Truy vấn Google User Info Endpoint để lấy thông tin cá nhân cơ bản
 */
async function fetchGoogleUserProfile(accessToken) {
  const { userInfoUrl } = oauthConfig.google;

  const response = await fetch(userInfoUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Google profile: ${response.status} - ${errText}`);
  }

  return response.json();
}

module.exports = {
  exchangeCodeForTokens,
  fetchGoogleUserProfile,
};
