import { useEffect } from 'react';
import { useSocialAuth } from './useSocialAuth';
import { SocialCompleteModal } from './SocialCompleteModal';

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
const FB_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';

/** Loads and initialises the Facebook JS SDK once, shared across mounts. */
function loadFacebookSdk(): Promise<any> {
  const w = window as any;
  if (w.__fbSdkPromise) return w.__fbSdkPromise;

  w.__fbSdkPromise = new Promise((resolve, reject) => {
    if (!FB_APP_ID) {
      reject(new Error('Missing VITE_FACEBOOK_APP_ID'));
      return;
    }
    w.fbAsyncInit = () => {
      w.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
      resolve(w.FB);
    };
    if (document.getElementById('facebook-jssdk')) return;
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = FB_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(script);
  });

  return w.__fbSdkPromise;
}

export function FacebookAuthButton() {
  const social = useSocialAuth('facebook');

  useEffect(() => {
    // Warm up the SDK so the first click is fast; ignore load failures here.
    loadFacebookSdk().catch(() => undefined);
  }, []);

  const handleClick = async () => {
    try {
      const FB = await loadFacebookSdk();
      FB.login(
        (response: any) => {
          const accessToken = response?.authResponse?.accessToken;
          if (accessToken) social.startFacebook(accessToken);
        },
        { scope: 'email,public_profile' },
      );
    } catch {
      /* SDK failed to load — button is a no-op */
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost social-btn"
        onClick={handleClick}
        disabled={social.submitting}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
        </svg>
        Facebook
      </button>

      {social.modalOpen && (
        <SocialCompleteModal
          provider="facebook"
          needEmail
          submitting={social.submitting}
          onCancel={social.closeModal}
          onSubmit={social.submitComplete}
        />
      )}
    </>
  );
}
