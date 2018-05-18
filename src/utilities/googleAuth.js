import { parse } from 'url';
import { remote } from 'electron';
import axios from 'axios';
import qs from 'qs';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me';
const GOOGLE_REDIRECT_URI = 'com.svey.sveymail:/oauth2redirect';
const GOOGLE_CLIENT_ID = '584544526950-fc7kon6bhfin6nbsif30kt0pgdas2d9o.apps.googleusercontent.com';

export function signInWithPopup() {
  return new Promise((resolve, reject) => {
    const authWindow = new remote.BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    });

    const urlParams = {
      response_type: 'code',
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email',
    };

    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`;

    function handleNavigation(url) {
      const query = parse(url, true).query;
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`));
        } else if (query.code) {
          // Login is complete
          authWindow.removeAllListeners('closed');
          setImmediate(() => authWindow.close());

          // This is the authorization code we need to request tokens
          resolve(query.code);
        }
      }
    }

    authWindow.on('closed', () => {
      throw new Error('Auth window was closed by user');
    });

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url);
    });

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleNavigation(newUrl);
    });

    authWindow.loadURL(authUrl);
  });
}

export async function fetchAccessTokens(code) {
  const response = await axios.post(GOOGLE_TOKEN_URL, qs.stringify({
    code,
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export async function fetchGoogleProfile(accessToken) {
  const response = await axios.get(GOOGLE_PROFILE_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function googleSignIn() {
  const code = await signInWithPopup();
  const tokens = await fetchAccessTokens(code);
  const { id, email, name } = await fetchGoogleProfile(tokens.access_token);
  const providerUser = {
    uid: id,
    email,
    displayName: name,
    idToken: tokens.id_token,
  };
  console.log(providerUser);
  // return mySignInFunction(providerUser); // eslint-disable-line no-undef
}
