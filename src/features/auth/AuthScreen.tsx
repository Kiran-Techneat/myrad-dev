import { Icon } from '@/components/common/Icon';
import { useAuthStore } from '@/store/authStore';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import { SignupForm } from './SignupForm';

function TrustBar() {
  return (
    <div
      className="trust-bar"
      style={{ justifyContent: 'center', background: 'none', border: 'none', padding: '16px 0 0' }}
    >
      <span className="tbadge">
        <Icon name="shield" />
        HIPAA Compliant
      </span>
      <span className="tbadge">
        <Icon name="checkCircle" />
        SOC 2 Type II
      </span>
      <span className="tbadge">
        <Icon name="lock" />
        256-bit Encrypted
      </span>
    </div>
  );
}

export function AuthScreen() {
  const auth = useAuthStore();
  const go = useNavStore((s) => s.go);
  const openDropdownReset = useDialogStore((s) => s.closeDropdown);

  const signIn = () => {
    openDropdownReset();
    auth.signIn();
    go('home');
  };

  const isSignup = auth.authView === 'signup';

  return (
    <div className="app">
      <div className="loginwrap">
        <div className="loginside">
          <div className="loginside-lockup">
            <div className="loginside-ic">
              <Icon name="grid" />
            </div>
            <span className="loginside-wordmark serif">MyRad Images</span>
          </div>
          <h1 className="serif">Your medical images, all in one place.</h1>
          <div className="loginside-feats">
            <div className="loginside-feat">
              <Icon name="clipboard" />
              Request studies or images from any imaging center
            </div>
            <div className="loginside-feat">
              <Icon name="clipboard" />
              See your reports as soon as they&apos;re ready
            </div>
            <div className="loginside-feat">
              <Icon name="share" />
              Share securely with family, friends, or healthcare provider
            </div>
          </div>
          <div className="loginside-bg">
            <Icon name="grid" />
          </div>
        </div>

        <div className="loginform-wrap">
          <div className={`logincard ${isSignup ? 'wide' : ''}`}>
            {isSignup ? (
              auth.signupDone ? (
                <>
                  <div className="lbrand" style={{ textAlign: 'center', alignItems: 'center' }}>
                    <div className="su-done-ic" style={{ margin: '0 auto 8px' }}>
                      <Icon name="check" sw={2.2} />
                    </div>
                    <h1 className="serif">Account created</h1>
                    <p>
                      Your account is ready. Sign in with the email and password you just created to
                      get started.
                    </p>
                  </div>
                  <button className="btn btn-primary btn-block btn-lg" onClick={auth.goToSignIn}>
                    Go to sign in
                  </button>
                </>
              ) : (
                <SignupForm />
              )
            ) : auth.otp ? (
              <OtpView onVerify={signIn} />
            ) : (
              <LoginView onSignIn={signIn} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onSignIn }: { onSignIn: () => void }) {
  const auth = useAuthStore();
  return (
    <>
      <div className="lbrand">
        <h1 className="serif">Welcome</h1>
        <p>Sign in to view and manage your medical images.</p>
      </div>
      <div className="seg">
        <button
          className={`seg-btn ${auth.loginTab === 'phone' ? 'on' : ''}`}
          onClick={() => auth.setLoginTab('phone')}
        >
          Phone
        </button>
        <button
          className={`seg-btn ${auth.loginTab === 'email' ? 'on' : ''}`}
          onClick={() => auth.setLoginTab('email')}
        >
          Email
        </button>
      </div>

      {auth.loginTab === 'phone' ? (
        <>
          <div className="field">
            <label>Mobile number</label>
            <input className="inp" type="tel" value="" placeholder="+1 (248) 737-6695" />
          </div>
          <div className="help-strip">
            <Icon name="bulb" sw={1.8} />
            <p>
              No password needed. We text you a <b>6-digit code</b> to sign in safely.
            </p>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={auth.goOtp}>
            Send my code
          </button>
        </>
      ) : (
        <>
          <div className="field">
            <label>Email address</label>
            <input className="inp" type="email" value="john.doe@example.com" readOnly />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="inp" type="password" value="123456" readOnly />
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={onSignIn}>
            Sign in
          </button>
        </>
      )}

      <div className="foot">
        New to MyRad? <a onClick={auth.goToSignUp}>Create an account</a>
      </div>
      <TrustBar />
    </>
  );
}

function OtpView({ onVerify }: { onVerify: () => void }) {
  const auth = useAuthStore();
  const preset = ['4', '8', '2', '', '', ''];
  return (
    <>
      <button className="backbtn" onClick={auth.backToLogin}>
        <Icon name="chevronLeft" />
        Back
      </button>
      <div className="lbrand" style={{ marginTop: 16 }}>
        <h1 className="serif">Enter your code</h1>
        <p>
          We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>+1 (248) 737-6695</b>
        </p>
      </div>
      <div className="otp-row">
        {preset.map((v, i) => (
          <input key={i} className="inp" maxLength={1} defaultValue={v} />
        ))}
      </div>
      <div className="foot" style={{ marginBottom: 20 }}>
        Didn&apos;t get it? <a>Resend code</a>
      </div>
      <button className="btn btn-primary btn-block btn-lg" onClick={onVerify}>
        Verify &amp; continue
      </button>
    </>
  );
}
