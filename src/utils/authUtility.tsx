import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";

interface JwtPayload { exp: number; iat?: number; sub?: string; }

const SESSION_KEY = "myRadImage";

const refreshPage = () => { window.location.reload(); };

const setSession = (user: any) => {
  if (user) { localStorage.setItem(SESSION_KEY, user); } else localStorage.clear();
};

const encryptData = (data: any) => {
  let salt = import.meta.env.VITE_APP_SALT;
  if (data && salt) return CryptoJS.AES.encrypt(data, salt).toString();
  else return null;
};

const clearSession = () => { localStorage.clear(); refreshPage(); };

const decryptData = (data: any) => {
  let salt = import.meta.env.VITE_APP_SALT;
  if (data && salt) {
    try {
      let bytes = CryptoJS.AES.decrypt(data, salt);
      let decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  } else {
    return null;
  }
};

const refreshToken = async (): Promise<string | null> => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const refreshKey = getUserData('refreshKey');
  if (!refreshKey) return null;
  try {
    const { data } = await import('axios').then(m => m.default.post(
      `${BASE_URL}/users-service/auth/refresh`,
      { refreshKey },
    ));
    const newAccessToken: string | undefined = data?.accessToken;
    if (!newAccessToken) return null;
    const existing = getLoggedInUser() ?? {};
    const updated = encryptData(JSON.stringify({
      ...existing,
      accessToken: newAccessToken,
      ...(data?.refreshKey ? { refreshKey: data.refreshKey } : {}),
    }));
    if (updated) setSession(updated);
    return newAccessToken;
  } catch {
    return null;
  }
};

const getLoggedInUser = () => {
  const user = localStorage.getItem(SESSION_KEY);
  if (!user) return null;

  try {
    let jsonData = decryptData(user);
    if (!jsonData) return null;
    return typeof jsonData === "object" ? jsonData : JSON.parse(jsonData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Clear corrupted data
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const getUserData = (key: any) => {
  let user = getLoggedInUser();
  return user ? user[key] : null;
};

const isUserAuthenticated = () => {
  const user = getLoggedInUser();
  if (!user?.accessToken) { return false; }
  try {
    const decoded = jwtDecode<JwtPayload>(user.accessToken);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return false;
    }
    return true;
  } catch (err) {
    console.error("Invalid token", err);
    return false;
  }
};

export { getLoggedInUser, encryptData, decryptData, getUserData, setSession, clearSession, isUserAuthenticated, refreshToken, };