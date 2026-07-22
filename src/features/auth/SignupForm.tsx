import { Icon } from '@/components/common/Icon';
import { Dropdown } from '@/components/common/Dropdown';
import { useAuthStore } from '@/store/authStore';
import { fmtMDY, formatUSPhone, isValidEmail } from '@/utils/format';

export function SignupForm() {
  const { signup, patchSignup, completeSignup, goToSignIn } = useAuthStore();

  const pwd = signup.pwd;
  const ruleLen = pwd.length >= 8;
  const ruleUpper = /[A-Z]/.test(pwd);
  const ruleNum = /[0-9]/.test(pwd);
  const ruleSpecial = /[^A-Za-z0-9]/.test(pwd);
  const emailOk = !signup.email || isValidEmail(signup.email);
  const pwdMismatch = !!signup.pwd2 && signup.pwd2 !== pwd;
  const valid =
    signup.first.trim() &&
    signup.last.trim() &&
    signup.email.trim() &&
    emailOk &&
    ruleLen &&
    ruleUpper &&
    ruleNum &&
    ruleSpecial &&
    signup.pwd2 === pwd;

  return (
    <>
      <div className="lbrand">
        <h1 className="serif">Create your account</h1>
        <p>A few details to set up secure access to your images.</p>
      </div>

      <div className="signup-grid">
        <div className="field">
          <label>First name</label>
          <input
            className="inp"
            type="text"
            placeholder="John"
            value={signup.first}
            onChange={(e) => patchSignup({ first: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Last name</label>
          <input
            className="inp"
            type="text"
            placeholder="Doe"
            value={signup.last}
            onChange={(e) => patchSignup({ last: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label>Email</label>
        <input
          className="inp"
          type="email"
          placeholder="john.doe@example.com"
          value={signup.email}
          onChange={(e) => patchSignup({ email: e.target.value })}
        />
        {signup.email && !emailOk && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            Enter a valid email address
          </div>
        )}
      </div>

      <div className="signup-grid">
        <div className="field">
          <label>Sex assigned at birth</label>
          <Dropdown
            ddKey="signupSex"
            value={signup.sex}
            placeholder="Select…"
            size="h58"
            options={['Male', 'Female', 'Intersex'].map((v) => ({ value: v, label: v }))}
            onPick={(sex) => patchSignup({ sex })}
          />
        </div>
        <div className="field">
          <label>Date of birth</label>
          <div className="datepick">
            <input
              className="inp"
              type="date"
              value={signup.dob}
              onChange={(e) => patchSignup({ dob: e.target.value })}
            />
            <span className={`datepick-txt ${signup.dob ? '' : 'ph'}`}>
              {fmtMDY(signup.dob) || 'MM/DD/YYYY'}
            </span>
          </div>
        </div>
      </div>

      <div className="signup-grid">
        <div className="field">
          <label>Phone number</label>
          <input
            className="inp"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={signup.phone}
            onChange={(e) => patchSignup({ phone: formatUSPhone(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>ZIP code</label>
          <input
            className="inp"
            type="text"
            placeholder="10001"
            maxLength={10}
            value={signup.zip}
            onChange={(e) => patchSignup({ zip: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          />
        </div>
      </div>

      <div className="field">
        <label>Password</label>
        <input
          className="inp"
          type="password"
          placeholder="Create a password"
          value={signup.pwd}
          onChange={(e) => patchSignup({ pwd: e.target.value })}
        />
      </div>

      <div className="pwd-guide">
        <div className={`pwd-rule ${ruleLen ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          At least 8 characters
        </div>
        <div className={`pwd-rule ${ruleUpper ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One uppercase letter
        </div>
        <div className={`pwd-rule ${ruleNum ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One number
        </div>
        <div className={`pwd-rule ${ruleSpecial ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One special character
        </div>
      </div>

      <div className="field">
        <label>Confirm password</label>
        <input
          className="inp"
          type="password"
          placeholder="Re-enter your password"
          value={signup.pwd2}
          onChange={(e) => patchSignup({ pwd2: e.target.value })}
        />
        {pwdMismatch && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            Passwords don&apos;t match
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        disabled={!valid}
        onClick={() => valid && completeSignup()}
        style={{ marginTop: 6 }}
      >
        Create account
      </button>
      <div className="foot">
        Already have an account? <a onClick={goToSignIn}>Sign in</a>
      </div>
    </>
  );
}
