import axios from 'axios';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  otp: string;
  password: string;
}

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    otp: '',
    password: ''
  });

  // OTP Logic State
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  // Handle Input Change with Type Safety
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mock Send OTP
const handleSendOTP = async () => {
  if (!formData.email.includes('@')) {
    return alert("Please enter a valid email");
  }

  try {
    setLoading(true);

    const res = await axios.post("http://localhost:5000/user/send-otp", {
        email: formData.email
    });
    
    setLoading(false);
    setOtpSent(true);
    setTimer(30);
    
    alert(res.data.msg);
  } catch (err: any) {
    setLoading(false);
    alert(err.response?.data?.msg || "Error sending OTP");
  }
};

// ---------------------- VERIFY OTP -------------------------
const handleVerifyOTP = async () => {
  try {
    const res = await axios.post("http://localhost:5000/user/verify-otp", {
      email: formData.email,
      otp: formData.otp
    });

    alert(res.data.msg);
    setOtpVerified(true);
    setOtpSent(false);

  } catch (err: any) {
    alert(err.response?.data?.msg || "Invalid OTP");
  }
};

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Submit
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // LOGIN
  if (isLogin) {
    try {
      const res = await axios.post("http://localhost:5000/user/login", {
        email: formData.email,
        password: formData.password
      });

      alert("Login successful!");
      console.log("User:", res.data);

    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
    return;
  }

  // SIGNUP (must verify OTP first)
  if (!otpVerified) return alert("Please verify email first");

  try {
    const res = await axios.post("http://localhost:5000/user/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    alert("Account created successfully!");
    console.log("New User:", res.data);

  } catch (err: any) {
    alert(err.response?.data?.message || "Registration failed");
  }
};

  // Toggle Login/Signup Mode
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setOtpVerified(false);
    setFormData({ name: '', email: '', otp: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-gray-500 mt-2">
            {isLogin ? 'Enter your details to sign in' : 'Get started with your free account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          
          {/* Name Field (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={otpVerified} 
                className={`w-full px-4 py-2 rounded-lg border ${otpVerified ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                required
              />
              {/* Verified Icon */}
              {otpVerified && !isLogin && (
                <span className="absolute right-3 top-2.5 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          {/* OTP Section (Signup Only & Not Verified) */}
          {!isLogin && !otpVerified && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !formData.email}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Verify Email with OTP'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Enter OTP</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="otp"
                        maxLength={4}
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-bold text-lg"
                        placeholder="1234"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {timer > 0 ? `Resend OTP in ${timer}s` : <button type="button" onClick={handleSendOTP} className="text-blue-600 underline hover:text-blue-800">Resend OTP</button>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password Field */}
          {(isLogin || otpVerified) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isLogin && !otpVerified}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLogin ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>

        {/* Toggle Link */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={toggleMode} 
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}