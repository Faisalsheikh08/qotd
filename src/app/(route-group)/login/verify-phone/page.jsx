'use client';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { redirect, RedirectType } from 'next/navigation';
import { useState } from 'react';


export default function MobileLoginPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: "Student" })
  const [step, setStep] = useState('mobile'); // 'mobile', 'otp', or 'profile'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);

  const availableExams = [
    "BPSC TRE PRT PRIMARY (1-5)",
    "BPSC TRE GENERAL STUDIES",
    "BPSC TRE SST (6-8)",
    "BPSC TRE SST (9-10)",
    "BPSC TRE SST (6-8 & 9-10)",
    "BPSC TRE MATHS & SCIENCE (6-8)",
    "BPSC TRE SCIENCE (9-10)",
    "BPSC TRE HINDI (6-8)",
    "BPSC TRE HINDI (9-10)",
    "BPSC TRE HINDI (6-8 & 9-10)",
    "BPSC TRE COMPUTER TEACHER (6-8)",
    "BPSC TRE ENGLISH (6-8)",
    "BPSC TRE ENGLISH (9-10)",
    "BPSC TRE ENGLISH (6-8 & 9-10)",
    "BPSC TRE URDU (6-8)",
    "BPSC TRE URDU (9-10)",
    "BPSC TRE URDU (6-8 & 9-10)",
    "KVS PRT PRIMARY (1-5)",
    "KVS GENERAL PAPER",
    "KVS TGT SST (6-8)",
    "KVS TGT MATHS (6-8)",
    "KVS TGT ENGLISH (6-8)",
    "KVS TGT HINDI (6-8)",
    "KVS TGT SCIENCE (6-8)",
    "BSSTET PRT PRIMARY (1-5)",
    "BIHAR STET SST (9-10)",
    "BIHAR STET HINDI (9-10)",
    "BIHAR STET ENGLISH (9-10)",
    "JHARKHAND TET PAPER 1 PRIMARY (1-5)",
    "JHARKHAND TET PAPER 2 SOCIAL STUDIES (6-8)",
    "JHARKHAND TET PAPER 2 MATHS & SCIENCE (6-8)",
    "CTET PAPER 1 PRIMARY (1-5)",
    "CTET PAPER 2 SOCIAL STUDIES (6-8)",
    "CTET PAPER 2 MATHS & SCIENCE (6-8)",
    "CTET PAPER 1+2 SOCIAL STUDIES (1-8)",
    "CTET PAPER 1+2 MATHS & SCIENCE (1-8)",
    "SUPERTET PRT PRIMARY (1-5)",
    "UPTET PAPER 1 PRIMARY (1-5)",
    "UPTET PAPER 2 SOCIAL STUDIES (6-8)",
    "UPTET PAPER 2 MATHS & SCIENCE (6-8)",
    "UPTET PAPER 1+2 SOCIAL STUDIES (1-8)",
    "UPTET PAPER 1+2 MATHS & SCIENCE (1-8)",
    "UPTET + SUPERTET PRT PRIMARY (1-5)",
    "UPTET 1+2 (SST) + SUPERTET (1-8)",
    "UPTET 1+2 (M&S) + SUPERTET (1-8)",
    "DSSSB PRT PRIMARY (1-5)",
    "DSSSB COMMON PAPER (PRT/TGT/PGT)",
    "DSSSB TGT SST (6-8)",
    "DSSSB TGT ENGLISH (6-8)",
    "DSSSB TGT HINDI (6-8)",
    "DSSSB TGT MATHS (6-8)",
    "DSSSB TGT NATURAL SCIENCE (6-8)"
  ];

  const handleSendOTP = async () => {
    setError('');

    // Validate mobile number
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    // Dummy API call - simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    setError('');

    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    // Dummy API call - simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);

    // Move to profile setup step
    setStep('profile');
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    // Dummy API call - simulate resending OTP
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    alert('OTP sent successfully!');
  };

  const handleEditNumber = () => {
    setStep('mobile');
    setOtp('');
    setError('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const toggleExamSelection = (exam) => {
    setSelectedExams(prev => {
      if (prev.includes(exam)) {
        return prev.filter(e => e !== exam);
      } else {
        return [...prev, exam];
      }
    });
  };

  const handleCompleteProfile = async () => {
    if (selectedExams.length === 0) {
      setError('Please select at least one exam');
      return;
    }

    setLoading(true);
    setError('');

    // Dummy API call - simulate profile creation
    // In real implementation, send: { mobileNumber, selectedExams }
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoading(false);

    // Success - redirect to home or show success
    // alert(`Profile created successfully!\nMobile: ${mobileNumber}\nExams: ${selectedExams.join(', ')}`);
    redirect('/home', RedirectType.replace)
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-18 pb-4 items-center justify-center bg-gradient-to-b from-gray-50 to-violet-100 px-4">
        <div className="w-full max-w-md space-y-8 px-6 py-8 bg-white rounded-xl shadow-lg">
          {/* Logo or Title */}
          <div className="text-center">
            <img src="/logo.png" alt="Logo" className="mx-auto h-24 w-24 border-2 border-gray-100 shadow-md mb-6 rounded-xl" />
            <h1 className="text-3xl font-bold text-gray-800">Hello {user.name}👋🏻</h1>
            <p className="mt-2 text-gray-500">
              {step === 'mobile'
                ? 'Enter your mobile number to continue'
                : step === 'otp'
                && 'Enter the OTP sent to your mobile number'}
              {/* : 'This will take only a few minutes to complete your profile' */}
            </p>
          </div>

          {/* Mobile Number Form */}
          {step === 'mobile' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                    +91
                  </span>
                  <input
                    id="mobile"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading || !mobileNumber}
                className={"w-full flex items-center justify-center gap-3 rounded-md bg-violet-500 hover:bg-violet-600 px-4 py-3 text-white font-medium shadow-md transition " + (loading || !mobileNumber ? " opacity-50 cursor-not-allowed" : "cursor-pointer")}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          )}

          {/* OTP Form */}
          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-lg -mt-6 mb-3 text-center  bg-violet-100 w-fit mx-auto px-3 py-3 rounded-md font-semibold">
                +91 {mobileNumber}
              </p>
              <div>

                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <button
                    onClick={handleEditNumber}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Edit Number
                  </button>
                </div>

                <input
                  id="otp"
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center text-2xl font-bold tracking-widest placeholder:text-gray-300"
                  disabled={loading}
                  maxLength={6}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || !otp}
                className={"w-full flex items-center justify-center gap-3 rounded-md bg-violet-500 hover:bg-violet-600 px-4 py-3 text-white font-medium shadow-md transition " + (loading || !otp ? " opacity-50 cursor-not-allowed" : "cursor-pointer")}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Profile Setup - Exam Selection */}
          {step === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select exams you are preparing for
                </label>
                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-md p-1 space-y-2">
                  {availableExams.map((exam, index) => (
                    <button
                      key={index}
                      onClick={() => toggleExamSelection(exam)}
                      className={
                        "w-full text-left px-4 py-3 rounded-md border-2 transition " +
                        (selectedExams.includes(exam)
                          ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                          : "border-gray-200 hover:border-violet-300 bg-white text-gray-700")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{exam}</span>
                        {selectedExams.includes(exam) && (
                          <svg className="h-5 w-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {selectedExams.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedExams.length} exam{selectedExams.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={loading || selectedExams.length === 0}
                className={"w-full flex items-center justify-center gap-3 rounded-md bg-violet-500 hover:bg-violet-600 px-4 py-3 text-white font-medium shadow-md transition " + (loading || selectedExams.length === 0 ? " opacity-50 cursor-not-allowed" : "cursor-pointer")}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          )}

          {/* Terms / Privacy Links */}
          {/* <div className="text-center text-xs text-gray-400 mt-4">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>{' '}
            ·{' '}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
          </div> */}

          {/* Optional Footer */}
          {/* <footer className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Teaching Pariksha
          </footer> */}
        </div>
      </div>
    </div>
  );
}