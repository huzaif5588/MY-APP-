import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ConfirmationResult } from 'firebase/auth';
import { 
  loginWithPortal, 
  loginWithGooglePortal, 
  loginWithApplePortal, 
  loginWithPhoneOtp, 
  initPhoneRecaptcha,
  sendFirebasePhoneOtp,
  confirmFirebasePhoneOtp,
  resetUserPassword 
} from '../../firebase/services/authService';
import { 
  ArrowLeft, Lock, Mail, ShieldCheck, Key, 
  AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, Loader2,
  Phone, RefreshCw, Shield, Smartphone, Check
} from 'lucide-react';

interface LoginScreenProps {
  portal: UserRole;
  onBack: () => void;
  onLoginSuccess: (userProfile: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ portal, onBack, onLoginSuccess }) => {
  const { lang, db, t } = useApp();

  // Mode: 'email' | 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP form state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [expectedSimulatedOtp, setExpectedSimulatedOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [smsNoticeMessage, setSmsNoticeMessage] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  // Captcha Verification state
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Generate dynamic captcha code
  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
    setIsCaptchaVerified(false);
    setCaptchaError('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, [portal, authMethod]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Role-Specific Styling & Configuration
  const portalConfig = {
    super_admin: {
      title: 'Administrator Login',
      titleUrdu: 'ایڈمنسٹریٹر لاگ ان',
      badge: 'Principal & Super Admin (Sir Noman)',
      themeColor: 'amber',
      accentText: 'text-amber-400',
      borderGlow: 'border-amber-500/50 shadow-amber-500/10',
      activeTabBg: 'bg-amber-500 text-slate-950 font-bold',
      btnBg: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold',
      cardBg: 'from-amber-950/20 via-slate-900 to-[#0B192C]',
      defaultEmail: 'admin@indusacademy.pk',
      defaultPass: 'IndusAdmin@2026',
      defaultPhone: '+92 300 5559988',
    },
    principal: {
      title: 'Principal Login',
      titleUrdu: 'پرنسپل لاگ ان',
      badge: 'Director & Principal (Sir Noman)',
      themeColor: 'amber',
      accentText: 'text-amber-400',
      borderGlow: 'border-amber-500/50 shadow-amber-500/10',
      activeTabBg: 'bg-amber-500 text-slate-950 font-bold',
      btnBg: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold',
      cardBg: 'from-amber-950/20 via-slate-900 to-[#0B192C]',
      defaultEmail: 'principal@indusacademy.pk',
      defaultPass: 'SirNoman@2026',
      defaultPhone: '+92 300 5559988',
    },
    teacher: {
      title: 'Faculty & Teacher Login',
      titleUrdu: 'اساتذہ کرام لاگ ان',
      badge: 'Senior Faculty Member',
      themeColor: 'blue',
      accentText: 'text-blue-400',
      borderGlow: 'border-blue-500/50 shadow-blue-500/10',
      activeTabBg: 'bg-blue-600 text-white font-bold',
      btnBg: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold',
      cardBg: 'from-blue-950/25 via-slate-900 to-[#0B192C]',
      defaultEmail: 'teacher@indusacademy.pk',
      defaultPass: 'Teacher@2026',
      defaultPhone: '+92 300 7891234',
    },
    accountant: {
      title: 'Accountant & Finance Login',
      titleUrdu: 'اکاؤنٹس و فیس لاگ ان',
      badge: 'Cashier & Treasury Department',
      themeColor: 'emerald',
      accentText: 'text-emerald-400',
      borderGlow: 'border-emerald-500/50 shadow-emerald-500/10',
      activeTabBg: 'bg-emerald-600 text-white font-bold',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold',
      cardBg: 'from-emerald-950/25 via-slate-900 to-[#0B192C]',
      defaultEmail: 'accountant@indusacademy.pk',
      defaultPass: 'Accounts@2026',
      defaultPhone: '+92 302 4443322',
    },
    parent: {
      title: 'Parent & Guardian Login',
      titleUrdu: 'والدین و سرپرست لاگ ان',
      badge: 'Guardian & Family Access',
      themeColor: 'purple',
      accentText: 'text-purple-400',
      borderGlow: 'border-purple-500/50 shadow-purple-500/10',
      activeTabBg: 'bg-purple-600 text-white font-bold',
      btnBg: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-extrabold',
      cardBg: 'from-purple-950/25 via-slate-900 to-[#0B192C]',
      defaultEmail: 'parent@indusacademy.pk',
      defaultPass: 'Parent@2026',
      defaultPhone: '+92 301 5551234',
    },
  }[portal] || {
    title: 'Portal Login',
    titleUrdu: 'پورٹل لاگ ان',
    badge: 'Authorized User',
    themeColor: 'amber',
    accentText: 'text-amber-400',
    borderGlow: 'border-amber-500/50 shadow-amber-500/10',
    activeTabBg: 'bg-amber-500 text-slate-950 font-bold',
    btnBg: 'bg-amber-500 text-slate-950 font-bold',
    cardBg: 'from-slate-900 via-slate-900 to-[#0B192C]',
    defaultEmail: 'user@indusacademy.pk',
    defaultPass: 'Pass@2026',
    defaultPhone: '+92 300 0000000',
  };

  // Quick fill handler
  const handleQuickFill = () => {
    if (authMethod === 'email') {
      setEmail(portalConfig.defaultEmail);
      setPassword(portalConfig.defaultPass);
    } else {
      setPhone(portalConfig.defaultPhone);
    }
    setErrorMessage('');
    // Auto solve captcha for quick tester ease
    setUserCaptchaInput(captchaCode);
    setIsCaptchaVerified(true);
  };

  // Check captcha submission
  const verifyCaptchaBeforeSubmit = (): boolean => {
    if (userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('Incorrect Security Captcha code. Please try again.');
      refreshCaptcha();
      return false;
    }
    setCaptchaError('');
    setIsCaptchaVerified(true);
    return true;
  };

  // Handle Email & Password Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!verifyCaptchaBeforeSubmit()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginWithPortal(email, password, portal);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send Phone OTP with Firebase signInWithPhoneNumber
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (+92 3XX XXXXXXX).');
      return;
    }

    if (!verifyCaptchaBeforeSubmit()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const verifier = initPhoneRecaptcha('firebase-recaptcha-container');
      const result = await sendFirebasePhoneOtp(phone, verifier);

      setConfirmationResult(result.confirmationResult);
      if (result.simulatedCode) {
        setGeneratedOtp(result.simulatedCode);
        setExpectedSimulatedOtp(result.simulatedCode);
        setOtpInputs(result.simulatedCode.split(''));
      } else {
        setGeneratedOtp('••••••');
        setExpectedSimulatedOtp('');
        setOtpInputs(['', '', '', '', '', '']);
      }

      setSmsNoticeMessage(result.message);
      setOtpSent(true);
      setResendTimer(60);
    } catch (err: any) {
      console.error('Firebase Phone Auth send error:', err);
      setErrorMessage(err.message || 'Failed to dispatch phone verification OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpBoxChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpInputs];
    next[index] = val.slice(-1);
    setOtpInputs(next);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle Phone + OTP Verification Submit
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpInputs.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await confirmFirebasePhoneOtp(
        phone, 
        enteredOtp, 
        portal, 
        confirmationResult,
        expectedSimulatedOtp || generatedOtp
      );
      onLoginSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const response = await loginWithGooglePortal(portal);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Apple / Mac Sign In
  const handleAppleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const response = await loginWithApplePortal(portal);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Apple / Mac Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await resetUserPassword(resetEmail);
      setResetSuccessMessage('Password reset link has been dispatched to your email address.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccessMessage('');
      }, 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative select-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,62,98,0.3)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ur' ? 'تمام پورٹلز پر واپس جائیں' : 'All Portals'}</span>
        </button>

        <span className={`text-[11px] font-mono font-bold ${portalConfig.accentText}`}>
          {portalConfig.badge}
        </span>
      </div>

      {/* Center Dynamic Card */}
      <div className="my-auto w-full max-w-lg mx-auto z-10">
        <div className={`bg-gradient-to-b ${portalConfig.cardBg} rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-md ${portalConfig.borderGlow}`}>
          
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/90 p-2 border border-slate-700 mx-auto flex items-center justify-center shadow-lg mb-3">
              <img 
                src="/indus-logo.svg" 
                alt="Emblem" 
                className="w-12 h-12 object-contain" 
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              {lang === 'ur' ? portalConfig.titleUrdu : portalConfig.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              INDUS ACADEMY – KALABAGH • Secure RBAC Gateway
            </p>
          </div>

          {/* Authentication Method Selector Tabs: Email vs Phone */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                authMethod === 'email' ? portalConfig.activeTabBg : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setErrorMessage(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                authMethod === 'phone' ? portalConfig.activeTabBg : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone & OTP</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick-fill Pre-registered Test Credentials Helper */}
          <div className="mb-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-300 font-semibold block">Official Test Credentials:</span>
              <div className="font-mono text-slate-300 text-[10px] space-y-0.5 mt-0.5">
                {authMethod === 'email' ? (
                  <>
                    <div>Email: <span className="text-white font-bold">{portalConfig.defaultEmail}</span></div>
                    <div>Pass: <span className="text-amber-300 font-bold">{portalConfig.defaultPass}</span></div>
                  </>
                ) : (
                  <>
                    <div>Phone: <span className="text-white font-bold">{portalConfig.defaultPhone}</span></div>
                    <div>SMS OTP: <span className="text-emerald-300 font-bold">Auto-dispatched via Gateway</span></div>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition active:scale-95 shadow-xs"
            >
              Fill Credentials
            </button>
          </div>

          {/* TAB 1: EMAIL & PASSWORD FORM */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@indusacademy.pk"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Captcha Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bot Protection • Security Captcha</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                    title="Refresh Captcha Code"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono font-black text-base text-amber-300 tracking-widest select-none line-through">
                    {captchaCode}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter code above"
                    value={userCaptchaInput}
                    onChange={e => setUserCaptchaInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-amber-400"
                  />
                </div>
                {captchaError && (
                  <p className="text-[10px] text-rose-400 font-semibold">{captchaError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 mt-2 ${portalConfig.btnBg}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In with Email</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: MOBILE PHONE & OTP FORM */}
          {authMethod === 'phone' && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Registered Mobile Number (Pakistan)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+92 3XX XXXXXXX"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono transition"
                      />
                    </div>
                  </div>

                  {/* Security Captcha Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Bot Protection • Security Captcha</span>
                      </div>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono font-black text-base text-amber-300 tracking-widest select-none line-through">
                        {captchaCode}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter code above"
                        value={userCaptchaInput}
                        onChange={e => setUserCaptchaInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    {captchaError && (
                      <p className="text-[10px] text-rose-400 font-semibold">{captchaError}</p>
                    )}
                  </div>

                  {/* Firebase reCAPTCHA Invisible/Visible Anchor Container */}
                  <div id="firebase-recaptcha-container" className="flex justify-center my-1"></div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSendOtp}
                    className={`w-full py-3 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 ${portalConfig.btnBg}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Security & Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit Verification Code (OTP)</span>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  {/* SMS Gateway notification / confirmation banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{smsNoticeMessage || `Firebase SMS Gateway Dispatched to ${phone}`}</span>
                    </div>
                    {generatedOtp && generatedOtp !== '••••••' ? (
                      <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
                        <span>OTP code: <strong className="text-amber-300 text-sm font-black tracking-widest">{generatedOtp}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtpInputs(generatedOtp.split(''))}
                          className="text-[10px] text-amber-400 underline font-sans hover:text-amber-300 cursor-pointer"
                        >
                          Auto-fill
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Firebase Authentication session active. Please enter the 6-digit code received via SMS.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {otpInputs.map((val, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          value={val}
                          onChange={e => handleOtpBoxChange(idx, e.target.value)}
                          className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-black text-lg text-amber-300 focus:outline-none focus:border-amber-400 transition"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Didn't receive SMS?</span>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleSendOtp}
                      className="text-amber-400 font-semibold hover:underline disabled:text-slate-600"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 ${portalConfig.btnBg}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <span>Verify & Enter {portalConfig.badge}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-slate-400 hover:text-slate-200 text-xs py-1"
                  >
                    Change Mobile Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Social / SSO Sign-In Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-slate-900 px-3 text-slate-500">Or continue with SSO</span>
            </div>
          </div>

          {/* SSO Buttons Grid: Google & Apple / Mac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Account</span>
            </button>

            {/* Apple / Mac Sign-in */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
            >
              {/* Apple SVG Logo */}
              <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.77-7.95-12.21-14.62-5.99-9.04-10.74-19.34-14.25-30.91-3.51-11.57-5.27-22.37-5.27-32.4 0-14.79 3.73-26.96 11.19-36.5 7.46-9.55 16.92-14.44 28.37-14.69 4.35 0 9.28 1.13 14.79 3.39 5.51 2.26 9.4 3.44 11.69 3.55 2.18-.12 6.22-1.35 12.14-3.68 5.92-2.34 10.82-3.41 14.7-3.23 10.89.5 19.8 4.24 26.74 11.22-9.52 5.78-14.16 13.88-13.91 24.31.25 8.28 3.51 15.19 9.77 20.73 6.26 5.54 13.73 8.68 22.42 9.41-1.85 5.78-3.97 11.45-6.36 17.02zM119.22 31.84c0-7.22 2.67-13.93 8.01-20.12 5.34-6.19 11.83-9.87 19.46-11.03.25 1.01.38 2.06.38 3.16 0 7.22-2.73 14.1-8.19 20.64-5.46 6.54-12.01 10.23-19.66 11.07-.12-1.24-.18-2.48-.18-3.72z" />
              </svg>
              <span>Apple / Mac ID</span>
            </button>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-xs">
            <h3 className="font-bold text-base text-white font-display mb-1">
              Reset Password
            </h3>
            <p className="text-slate-400 mb-4">
              Enter your registered email address to receive an official password reset link.
            </p>

            {resetSuccessMessage ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl mb-3">
                {resetSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleSendResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="name@indusacademy.pk"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Security Statement */}
      <div className="pb-safe w-full max-w-lg mx-auto text-center text-[10px] text-slate-500 z-10">
        Indus Academy Enterprise Security • Protected by Dynamic Captcha & Firebase TLS 1.3
      </div>

    </div>
  );
};
