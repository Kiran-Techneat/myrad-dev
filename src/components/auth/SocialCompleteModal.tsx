import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatUSPhone } from '@/utils/format';

const muiTheme = createTheme({ palette: { primary: { main: '#345d55' } } });

export interface SocialCompleteValues {
  email: string;
  phone: string;
  dob: string;
  zip: string;
}

interface SocialCompleteModalProps {
  provider: 'google' | 'facebook';
  // Facebook needs email collected; Google already has it from the id token.
  needEmail: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: SocialCompleteValues) => void;
}

const buildSchema = (needEmail: boolean): yup.ObjectSchema<SocialCompleteValues> =>
  yup.object({
    email: needEmail
      ? yup
          .string()
          .trim()
          .required('Email is required')
          .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address')
      : yup.string().default(''),
    phone: yup
      .string()
      .required('Phone number is required')
      .test('len', 'Enter a valid mobile number', (v) => (v || '').replace(/\D/g, '').length >= 10),
    dob: yup.string().required('Date of birth is required'),
    zip: yup
      .string()
      .required('ZIP code is required')
      .matches(/^\d{5}$/, 'Enter a valid 5-digit ZIP code'),
  }) as yup.ObjectSchema<SocialCompleteValues>;

export function SocialCompleteModal({
  provider,
  needEmail,
  submitting,
  onCancel,
  onSubmit,
}: SocialCompleteModalProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SocialCompleteValues>({
    resolver: yupResolver(buildSchema(needEmail)),
    mode: 'onTouched',
    defaultValues: { email: '', phone: '', dob: '', zip: '' },
  });

  const phoneReg = register('phone');

  return (
    <div className="getsheet-scrim" onClick={onCancel}>
      <div className="getsheet-card" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Finish setting up your account</h3>
        <p>
          Just a few more details to link your {provider === 'google' ? 'Google' : 'Facebook'}{' '}
          account and keep it secure.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {needEmail && (
            <div className="af-field">
              <label>Email</label>
              <input
                className="af-inp"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
              />
              {errors.email && (
                <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
                  {errors.email.message}
                </div>
              )}
            </div>
          )}

          <div className="af-row">
            <div className="af-field">
              <label>Phone number</label>
              <input
                className="af-inp"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...phoneReg}
                onChange={(e) =>
                  setValue('phone', formatUSPhone(e.target.value), { shouldValidate: true })
                }
              />
              {errors.phone && (
                <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
                  {errors.phone.message}
                </div>
              )}
            </div>
            <div className="af-field">
              <label>ZIP code</label>
              <input
                className="af-inp"
                type="text"
                placeholder="10001"
                maxLength={5}
                {...register('zip')}
                onChange={(e) =>
                  setValue('zip', e.target.value.replace(/\D/g, '').slice(0, 5), {
                    shouldValidate: true,
                  })
                }
              />
              {errors.zip && (
                <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
                  {errors.zip.message}
                </div>
              )}
            </div>
          </div>

          <div className="af-field">
            <label>Date of birth</label>
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <ThemeProvider theme={muiTheme}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) => field.onChange(d && d.isValid() ? d.format('YYYY-MM-DD') : '')}
                      disableFuture
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </ThemeProvider>
              )}
            />
            {errors.dob && (
              <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
                {errors.dob.message}
              </div>
            )}
          </div>

          <div className="af-btns">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !watch('phone')}>
              {submitting ? 'Please wait…' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
