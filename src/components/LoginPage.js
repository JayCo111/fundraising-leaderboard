/**
 * Login Page Component
 * 
 * Handles student/parent authentication by matching credentials
 * with data from Google Sheets Students tab.
 * 
 * Fields used:
 * - Column B: First Name
 * - Column C: Last Name  
 * - Column F: Email (ParentEmail)
 */

import { useState } from 'react';
import { Trophy, Mail, Lock, AlertCircle, CheckCircle, Loader, Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import {
  validatePasswordStrength,
  passwordStorage,
  generateSecurePassword
} from '../utils/passwordSecurity';

const LoginPage = ({ onLogin, studentsData, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, errors: [] });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('email'); // 'email', 'password', 'complete'
  const [validatedStudent, setValidatedStudent] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Find matching student by email only
      const matchingStudent = studentsData.find(student => 
        student.ParentEmail?.toLowerCase().trim() === formData.email.toLowerCase().trim()
      );

      if (matchingStudent) {
        // Check if student has a password set
        if (passwordStorage.hasPassword(matchingStudent.StudentID)) {
          // Verify password
          const passwordValid = await passwordStorage.verifyStudentPassword(
            matchingStudent.StudentID, 
            formData.password
          );
          
          if (passwordValid) {
            // Successful login
            onLogin(matchingStudent);
          } else {
            setLoginError('Invalid password. Please try again.');
          }
        } else {
          setLoginError('No password set for this account. Please register first.');
        }
      } else {
        setLoginError('Email not found in our system. Please check your email address or register first.');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };


  const handleRegistrationDataChange = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check password strength when password changes
    if (field === 'password') {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation);
      setShowPasswordStrength(value.length > 0);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Find matching student
      const matchingStudent = studentsData.find(student => {
        const firstNameMatch = student.FirstName?.toLowerCase().trim() === registrationData.firstName.toLowerCase().trim();
        const lastNameMatch = student.LastName?.toLowerCase().trim() === registrationData.lastName.toLowerCase().trim();
        const emailMatch = student.ParentEmail?.toLowerCase().trim() === registrationData.email.toLowerCase().trim();
        
        return firstNameMatch && lastNameMatch && emailMatch;
      });

      if (matchingStudent) {
        // Validate password strength
        const passwordValidation = validatePasswordStrength(registrationData.password);
        if (!passwordValidation.isValid) {
          setLoginError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
          setIsLoggingIn(false);
          return;
        }

        // Check password confirmation
        if (registrationData.password !== registrationData.confirmPassword) {
          setLoginError('Passwords do not match.');
          setIsLoggingIn(false);
          return;
        }

        // Check if password already exists
        if (passwordStorage.hasPassword(matchingStudent.StudentID)) {
          setLoginError('Password already set for this student. Please login instead.');
          setIsLoggingIn(false);
          return;
        }

        // Set password
        await passwordStorage.setPassword(matchingStudent.StudentID, registrationData.password);
        
        // Auto-login after successful registration
        onLogin(matchingStudent);
      } else {
        setLoginError('No matching student found. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('Registration failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword(12);
    setRegistrationData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword
    }));
    const validation = validatePasswordStrength(newPassword);
    setPasswordStrength(validation);
    setShowPasswordStrength(true);
  };

  const validateEmailAgainstStudents = (email) => {
    const matchingStudent = studentsData.find(student => 
      student.ParentEmail?.toLowerCase().trim() === email.toLowerCase().trim()
    );
    return matchingStudent;
  };

  const handleEmailValidation = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const student = validateEmailAgainstStudents(formData.email);
      
      if (student) {
        // Check if student already has a password
        if (passwordStorage.hasPassword(student.StudentID)) {
          setLoginError('This email already has an account. Please use the login form instead.');
          setIsLoggingIn(false);
          return;
        }
        
        // Email is valid, move to password step
        setValidatedStudent(student);
        setRegistrationData({
          firstName: student.FirstName,
          lastName: student.LastName,
          email: student.ParentEmail,
          password: '',
          confirmPassword: ''
        });
        setRegistrationStep('password');
      } else {
        setLoginError('Email not found in our system. Please check your email address or contact your fundraising coordinator.');
      }
    } catch (error) {
      setLoginError('Error validating email. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetRegistration = () => {
    setRegistrationStep('email');
    setValidatedStudent(null);
    setFormData({ email: '', password: '' });
    setRegistrationData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    setLoginError('');
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

        {/* Login/Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-cyan-400">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isRegistering ? 
                (registrationStep === 'email' ? 'Email Verification' : 
                 registrationStep === 'password' ? 'Create Password' : 'Student Registration') : 
                'Student Login'}
            </h2>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError('');
                setFormData({ email: '', password: '' });
                resetRegistration();
              }}
              className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
            >
              {isRegistering ? 'Login Instead' : 'Register Instead'}
            </button>
          </div>
          
          {loginError && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 font-semibold">{loginError}</div>
            </div>
          )}

          {/* Registration Progress Indicator */}
          {isRegistering && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${registrationStep === 'email' ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    registrationStep === 'email' ? 'bg-cyan-100 border-2 border-cyan-500' : 'bg-gray-100'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="ml-2 text-sm font-semibold">Email</span>
                </div>
                <div className={`w-8 h-0.5 ${registrationStep === 'password' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center ${registrationStep === 'password' ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    registrationStep === 'password' ? 'bg-cyan-100 border-2 border-cyan-500' : 'bg-gray-100'
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="ml-2 text-sm font-semibold">Password</span>
                </div>
              </div>
            </div>
          )}

          {!isRegistering ? (
            // Login Form
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoggingIn ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            // Registration Form - Step by Step
            <>
              {registrationStep === 'email' && (
                <form onSubmit={handleEmailValidation} className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Enter your email address to verify you're registered in our fundraising system.
                    </p>
                  </div>
                  
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
                        Verifying Email...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Verify Email
                      </>
                    )}
                  </button>
                </form>
              )}

              {registrationStep === 'password' && validatedStudent && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Email Verified Successfully!
                      </div>
                      <p className="text-sm text-green-600 mt-2">
                        Creating account for: <strong>{validatedStudent.FirstName} {validatedStudent.LastName}</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registrationData.password}
                        onChange={(e) => handleRegistrationDataChange('password', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Create a secure password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {showPasswordStrength && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                passwordStrength.score < 30 ? 'bg-red-500' :
                                passwordStrength.score < 60 ? 'bg-yellow-500' :
                                passwordStrength.score < 80 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${passwordStrength.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {passwordStrength.score < 30 ? 'Weak' :
                             passwordStrength.score < 60 ? 'Fair' :
                             passwordStrength.score < 80 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                        {passwordStrength.errors.length > 0 && (
                          <div className="text-xs text-red-600 space-y-1">
                            {passwordStrength.errors.map((error, index) => (
                              <div key={index}>• {error}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="mt-2 text-xs text-cyan-600 hover:text-cyan-800 font-semibold"
                    >
                      Generate Secure Password
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registrationData.confirmPassword}
                      onChange={(e) => handleRegistrationDataChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetRegistration}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      Back to Email
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

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
