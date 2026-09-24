'use client';

// app/(auth)/login/page.tsx — Phone OTP Authentication (Dual-Mode Adapter)
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendOtp, useVerifyOtp } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = React.useState('0908123456');
  const [otp, setOtp] = React.useState(['8', '4', '2', '1', '9', '0']);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [countdown, setCountdown] = React.useState(45);
  const [error, setError] = React.useState('');
  const [successInfo, setSuccessInfo] = React.useState('');

  const otpInputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số)');
      return;
    }
    setError('');

    try {
      const result = await sendOtp.mutateAsync(cleanPhone);
      if (result.success) {
        setSuccessInfo(result.message);
        if (result.defaultOtp) {
          setOtp(result.defaultOtp.split(''));
        }
        setStep('otp');
        setCountdown(45);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }
    setError('');

    try {
      const result = await verifyOtp.mutateAsync({
        phone: phone.replace(/\s+/g, ''),
        otp: fullOtp,
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi xác thực. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-[12px] bg-indigo-600 items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
          T
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Troly</h1>
        <p className="text-sm text-slate-500 mt-1">
          Hệ thống Quản lý Thuê phòng & Điện nước Thông minh
        </p>
      </div>

      {/* Main Form Container (16px Radius, Level 1 Elevation) */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[16px] p-6 sm:p-8 shadow-sm">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Đăng nhập tài khoản</h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhập số điện thoại chủ nhà để nhận mã xác thực OTP qua SMS/Zalo
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-[10px] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số điện thoại chủ nhà
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-slate-500">
                  🇻🇳 +84
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0908 123 456"
                  className="w-full h-11 pl-16 pr-4 rounded-[10px] border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 tabular-nums"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-[4px] border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập trên thiết bị này (30 ngày)
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={sendOtp.isPending}
            >
              <span>Nhận mã xác thực OTP</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Nhập mã xác thực</h2>
              <p className="text-xs text-slate-500 mt-1">
                Mã 6 chữ số đã được gửi tới số <span className="font-semibold text-slate-800">{phone}</span>
              </p>
            </div>

            {successInfo && (
              <div className="p-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[10px] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Mã xác thực mẫu: <strong className="font-mono">842190</strong> (Tự động điền)</span>
              </div>
            )}

            {error && (
              <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-[10px] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 6 High-Contrast OTP Digit Boxes */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold text-slate-900 border border-slate-200 rounded-[10px] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 tabular-nums bg-slate-50 focus:bg-white transition-all"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {countdown > 0 ? (
                  `Gửi lại mã sau ${countdown}s`
                ) : (
                  <button
                    type="button"
                    onClick={handlePhoneSubmit}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Gửi lại mã ngay
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Đổi số điện thoại
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={verifyOtp.isPending}
            >
              Xác thực & Vào hệ thống
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Bảo mật dữ liệu chuẩn mã hóa ngân hàng 256-bit</span>
        </div>
      </div>
    </div>
  );
}
