import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import OTPInput from 'react-otp-input'
import Logo from '@/assets/logo.png'
import { Icon } from '@/components/common/Icon'
import '../scancenter.scss'

const ScanCenterNoToken = () => {
    const [token, setToken] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    const handleChange = (val: string) => setToken(val.toUpperCase())

    const handleContinue = () => {
        if (token.length === 9) {
            const prefix = location.pathname.startsWith('/u') ? 'u' : 'selfupload'
            navigate(`/${prefix}/${token}`, { replace: true })
        }
    }

    return (
        <div className="sc-notoken">
            <div className="sc-notoken-card">
                <img src={Logo} alt="MyRad Images" className="sc-notoken-logo" />

                <div className="sc-notoken-badge">
                    <Icon name="lock" sw={2} />
                    Secure Imaging Upload Portal
                </div>

                <h3 className="serif" style={{ margin: '0 0 6px', fontSize: 22 }}>Enter Your Upload Code</h3>
                <p className="sc-notoken-sub">
                    Enter the 9-character code you received via fax or email to access your patient&apos;s imaging upload session.
                </p>

                <div className="sc-otp">
                    <OTPInput
                        value={token}
                        onChange={handleChange}
                        numInputs={9}
                        inputType="text"
                        shouldAutoFocus
                        renderSeparator={<span className="sc-otp-sep" />}
                        renderInput={(props) => <input {...props} className="sc-otp-input" />}
                    />
                </div>

                <p className="sc-notoken-hint">Type or paste your code above — letters are automatically uppercased.</p>

                <button className="btn btn-primary btn-block" onClick={handleContinue} disabled={token.length < 9}>
                    Continue
                </button>

                <div className="sc-notoken-help">
                    <p className="sc-notoken-help-title">Where is my code?</p>
                    <div className="sc-notoken-help-item">
                        <Icon name="fax" sw={1.8} />
                        <span>Check the fax you received from the patient or their care provider — the code appears at the top of the document.</span>
                    </div>
                    <div className="sc-notoken-help-item">
                        <Icon name="mail" sw={1.8} />
                        <span>Check your email inbox for a message from MyRad Images — the code is displayed in the body of that email.</span>
                    </div>
                    <p className="sc-notoken-help-note">
                        Each code is unique to a patient and expires after use. If your code is not working, please contact the patient or their care provider to request a new one.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ScanCenterNoToken
