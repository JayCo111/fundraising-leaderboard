/**
 * Login Page Component
 *
 * Handles student/parent authentication via magic link email.
 * No passwords required - just enter email and click the link sent.
 *
 * Fields used:
 * - Column F: Email (ParentEmail)
 */

import { useState, useEffect } from 'react';
import { Trophy, Mail, AlertCircle, CheckCircle, Loader, LogIn } from 'lucide-react';

const LoginPage = ({ onLogin, studentsData, loading }) => {
  const [formData, setFormData] = useState({ email: '' });
  const [loginError, setLoginError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check for token in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      verifyTokenAndLogin(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (loginError) setLoginError('');
    if (loginMessage) setLoginMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    setLoginMessage('');

    try {
      // Check if email exists in Students sheet
      const student = studentsData.find(s =>
        s.ParentEmail?.toLowerCase().trim() === formData.email.toLowerCase().trim()
      );

      if (!student) {
        setLoginError('Email not found. Please check your email address.');
        setIsLoggingIn(false);
        return;
      }

      // Send magic link
      const response = await fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMagicLink',
          sheetId: process.env.REACT_APP_GOOGLE_SHEET_ID,
          email: formData.email,
          resendApiKey: process.env.REACT_APP_RESEND_API_KEY,
          appUrl: window.location.origin
        })
      });

      const result = await response.json();

      if (result.success) {
        setLoginMessage('Check your email! We sent you a login link.');
      } else {
        setLoginError('Failed to send login link. Please try again.');
      }
    } catch (error) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyTokenAndLogin = async (token) => {
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyToken',
          sheetId: process.env.REACT_APP_GOOGLE_SHEET_ID,
          token
        })
      });

      const result = await response.json();

      if (result.success) {
        // Find student by email
        const student = studentsData.find(s =>
          s.ParentEmail?.toLowerCase() === result.email.toLowerCase()
        );

        if (student) {
          onLogin(student);
          // Clear token from URL
          window.history.replaceState({}, '', '/');
        } else {
          setLoginError('Student not found.');
        }
      } else {
        setLoginError(result.error || 'Invalid or expired login link.');
      }
    } catch (error) {
      setLoginError('Failed to verify login link.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-cyan-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Fundraising Leaderboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Sign in to view your fundraising progress</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-cyan-400">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Passwordless Login</h2>
            <p className="text-gray-600 text-sm mt-2">
              Enter your email and we'll send you a magic link to log in
            </p>
          </div>

          {loginError && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 font-semibold">{loginError}</div>
            </div>
          )}

          {loginMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-green-700 font-semibold">{loginMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Parent Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoggingIn ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending Login Link...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Send Login Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Need help? Contact your fundraising coordinator.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
