/**
 * Fundraising Leaderboard App
 * 
 * Main application component that displays fundraising statistics,
 * team leaderboards, and individual student performance.
 * 
 * Features:
 * - Real-time data from Google Sheets
 * - Three views: My Stats, My Team, Everyone
 * - Automatic ranking and calculations
 * - Row-level privacy for parent access
 */

import { useState, useMemo, useEffect } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Share2, QrCode, AlertCircle, UserPlus, CheckCircle, Phone, Mail, Building, LogOut } from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from './config/googleSheets';
import { saveReferral, validateReferralForm } from './utils/googleSheetsWrite';
import { authenticateUser, Role } from './services/authService';
import { filterStudentsByRole, filterOrdersByRole, filterReferralsByRole } from './services/dataFilter';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import MyTeamTab from './components/MyTeamTab';
import TeamVsTeamTab from './components/TeamVsTeamTab';
import EveryoneTab from './components/EveryoneTab';
import ReferralsTab from './components/ReferralsTab';
import DashboardDemo from './components/DashboardDemo';
import DashboardRouter from './components/DashboardRouter';
import DashboardSelector from './components/DashboardSelector';

const FundraisingApp = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [referralsData, setReferralsData] = useState([]);
  const [programsData, setProgramsData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // New: replaces currentStudent for RBAC
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('mystats');
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [showPlatformDemo, setShowPlatformDemo] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null); // 'leaderboard' or 'platform'
  
  // Referral form state
  const [referralFormData, setReferralFormData] = useState({
    referralName: '',
    referralEmail: '',
    referralPhone: '',
    organization: '',
    stage: 'Contacted',
    points: 0
  });
  const [referralFormErrors, setReferralFormErrors] = useState({});
  const [isSavingReferral, setIsSavingReferral] = useState(false);
  const [referralSaveMessage, setReferralSaveMessage] = useState('');

  // Authentication handlers
  const handleLogin = (emailOrStudent) => {
    // emailOrStudent can be either:
    // 1. Email string (from magic link or direct login)
    // 2. Student object (legacy parent/student login)

    let email;
    if (typeof emailOrStudent === 'string') {
      email = emailOrStudent;
    } else if (emailOrStudent?.ParentEmail) {
      // Legacy student object
      email = emailOrStudent.ParentEmail;
      setCurrentStudent(emailOrStudent); // Keep for backward compatibility
    } else {
      console.error('Invalid login parameter');
      return;
    }

    // Authenticate user and determine role
    const user = authenticateUser(email, programsData, studentsData);

    if (user && user.role) {
      setCurrentUser(user);
      setIsAuthenticated(true);

      // If user is a parent/student, also set currentStudent for backward compatibility
      if (user.role === Role.PARENT_STUDENT && user.studentId) {
        const student = studentsData.find(s => s.StudentID === user.studentId);
        if (student) {
          setCurrentStudent(student);
        }
      }

      // Persist user session in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (currentStudent) {
        localStorage.setItem('currentStudent', JSON.stringify(currentStudent));
      }
    } else {
      setError(user?.error || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudent(null);
    setIsAuthenticated(false);
    setActiveTab('mystats');
    setShowPlatformDemo(false);
    // Clear user session from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentStudent');
  };

  // Check if current user is admin (josejr.corp@gmail.com) or org owner
  const isAdmin = useMemo(() => {
    if (currentUser) {
      return currentUser.role === Role.OWNER || currentUser.role === Role.ORG_OWNER;
    }
    // Fallback to old check for backward compatibility
    return currentStudent?.ParentEmail?.toLowerCase() === 'josejr.corp@gmail.com';
  }, [currentUser, currentStudent]);

  // Auto-login from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedStudent = localStorage.getItem('currentStudent');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Also restore currentStudent if available (for parent/student role)
        if (savedStudent) {
          const student = JSON.parse(savedStudent);
          setCurrentStudent(student);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentStudent');
      }
    } else if (savedStudent) {
      // Legacy: if only currentStudent exists, try to re-authenticate
      try {
        const student = JSON.parse(savedStudent);
        setCurrentStudent(student);
        setIsAuthenticated(true);
        // Will re-authenticate properly once data is loaded
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('currentStudent');
      }
    }
  }, []);

  useEffect(() => {
    const fetchSheetData = async () => {
      // Check if we have API credentials
      if (!GOOGLE_SHEETS_CONFIG.SHEET_ID || !GOOGLE_SHEETS_CONFIG.API_KEY) {
        console.warn('Google Sheets credentials not configured. Using demo data.');
        console.warn('Missing:', {
          SHEET_ID: !GOOGLE_SHEETS_CONFIG.SHEET_ID,
          API_KEY: !GOOGLE_SHEETS_CONFIG.API_KEY
        });

        // Set demo data for testing when Google Sheets isn't configured
        setStudentsData([
          {
            StudentID: 'STU001',
            FirstName: 'John',
            LastName: 'Smith',
            Team: 'Emeralds',
            Goal_$: 1000,
            ParentEmail: 'john.parent@example.com',
            PersonalLink: 'https://example.com/john-fundraising',
            QR_URL: '',
            Avatar_URL: '',
            Program: 'Spring 2024',
            QR_Link: 'https://example.com/qr/john'
          },
          {
            StudentID: 'STU002',
            FirstName: 'Sarah',
            LastName: 'Johnson',
            Team: 'Emeralds',
            Goal_$: 800,
            ParentEmail: 'sarah.parent@example.com',
            PersonalLink: 'https://example.com/sarah-fundraising',
            QR_URL: '',
            Avatar_URL: '',
            Program: 'Spring 2024',
            QR_Link: 'https://example.com/qr/sarah'
          },
          {
            StudentID: 'STU003',
            FirstName: 'Mike',
            LastName: 'Davis',
            Team: 'Emeralds',
            Goal_$: 1200,
            ParentEmail: 'mike.parent@example.com',
            PersonalLink: 'https://example.com/mike-fundraising',
            QR_URL: '',
            Avatar_URL: '',
            Program: 'Spring 2024',
            QR_Link: 'https://example.com/qr/mike'
          },
          {
            StudentID: 'STU004',
            FirstName: 'Emma',
            LastName: 'Wilson',
            Team: 'Diamonds',
            Goal_$: 900,
            ParentEmail: 'emma.parent@example.com',
            PersonalLink: 'https://example.com/emma-fundraising',
            QR_URL: '',
            Avatar_URL: '',
            Program: 'Spring 2024',
            QR_Link: 'https://example.com/qr/emma'
          }
        ]);
        setOrdersData([
          {
            Timestamp: '2024-01-15',
            OrderID: 'ORD001',
            BuyerName: 'Alice Johnson',
            BuyerEmail: 'alice@example.com',
            BuyerPhone: '555-0101',
            Quantity: 5,
            TotalPaid: 25.00,
            StudentID: 'STU001',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-16',
            OrderID: 'ORD002',
            BuyerName: 'Bob Smith',
            BuyerEmail: 'bob@example.com',
            BuyerPhone: '555-0102',
            Quantity: 3,
            TotalPaid: 15.00,
            StudentID: 'STU001',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-17',
            OrderID: 'ORD003',
            BuyerName: 'Carol Davis',
            BuyerEmail: 'carol@example.com',
            BuyerPhone: '555-0103',
            Quantity: 8,
            TotalPaid: 40.00,
            StudentID: 'STU002',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-18',
            OrderID: 'ORD004',
            BuyerName: 'David Wilson',
            BuyerEmail: 'david@example.com',
            BuyerPhone: '555-0104',
            Quantity: 6,
            TotalPaid: 30.00,
            StudentID: 'STU002',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-19',
            OrderID: 'ORD005',
            BuyerName: 'Eva Brown',
            BuyerEmail: 'eva@example.com',
            BuyerPhone: '555-0105',
            Quantity: 10,
            TotalPaid: 50.00,
            StudentID: 'STU003',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-20',
            OrderID: 'ORD006',
            BuyerName: 'Frank Miller',
            BuyerEmail: 'frank@example.com',
            BuyerPhone: '555-0106',
            Quantity: 4,
            TotalPaid: 20.00,
            StudentID: 'STU003',
            Status: 'Paid'
          },
          {
            Timestamp: '2024-01-21',
            OrderID: 'ORD007',
            BuyerName: 'Grace Taylor',
            BuyerEmail: 'grace@example.com',
            BuyerPhone: '555-0107',
            Quantity: 7,
            TotalPaid: 35.00,
            StudentID: 'STU004',
            Status: 'Paid'
          }
        ]);
        setReferralsData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const studentsResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.STUDENTS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
        );
        const studentsJson = await studentsResponse.json();
        
        const ordersResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.ORDERS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
        );
        const ordersJson = await ordersResponse.json();

        // Fetch Referrals
const referralsResponse = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.REFERRALS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
);
const referralsJson = await referralsResponse.json();

// Fetch Programs
const programsResponse = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.PROGRAMS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
);
const programsJson = await programsResponse.json();

        if (studentsJson.values) {
          const students = studentsJson.values.map(row => ({
            StudentID: row[0] || '',
            FirstName: row[1] || '',
            LastName: row[2] || '',
            Team: row[3] || '',
            Goal_$: parseFloat(row[4]) || 0,
            ParentEmail: row[5] || '',
            PersonalLink: row[6] || '', // Column G
            QR_URL: row[7] || '',
            Avatar_URL: row[8] || '',
            Program: row[9] || '',
            QR_Link: row[10] || '', // Column K
            RegisteredDate: row[11] || '', // Column L
            RegistrationStatus: row[12] || 'NOT_REGISTERED' // Column M (default to NOT_REGISTERED)
          }));
          setStudentsData(students);
        }

        if (ordersJson.values) {
          const orders = ordersJson.values.map(row => ({
            Timestamp: row[0] || '',
            OrderID: row[1] || '',
            BuyerName: row[2] || '',
            BuyerEmail: row[3] || '',
            BuyerPhone: row[4] || '',
            Quantity: parseFloat(row[5]) || 0,
            TotalPaid: parseFloat(row[6]) || 0,
            StudentID: row[7] || '',
            Status: row[8] || 'Paid'
          }));
          setOrdersData(orders);
        }
        if (referralsJson.values) {
          const referrals = referralsJson.values.map(row => ({
            ReferralID: row[0] || '',
            StudentID: row[1] || '',
            ReferralName: row[2] || '',
            ReferralEmail: row[3] || '',
            ReferralPhone: row[4] || '',
            Organization: row[5] || '',
            Stage: row[6] || 'Contacted',
            Points: parseFloat(row[7]) || 0,
            DateAdded: row[8] || '',
            LastUpdated: row[9] || '',
            ReferrerID: row[10] || '', // Column K
            ReferrerType: row[11] || 'STUDENT' // Column L (STUDENT or COACH)
          }));
          setReferralsData(referrals);
        }
        
        if (programsJson.values) {
          const programs = programsJson.values.map(row => ({
            Team: row[0] || '',
            Program: row[1] || '',
            Organization: row[2] || '',
            Coach1_Email: row[3] ? row[3].toLowerCase().trim() : '',
            Coach2_Email: row[4] ? row[4].toLowerCase().trim() : '',
            Coach3_Email: row[5] ? row[5].toLowerCase().trim() : '',
            Coach4_Email: row[6] ? row[6].toLowerCase().trim() : '',
            Director1_Email: row[7] ? row[7].toLowerCase().trim() : '',
            Director2_Email: row[8] ? row[8].toLowerCase().trim() : '',
            Director3_Email: row[9] ? row[9].toLowerCase().trim() : '',
            Coach1_Name: row[10] || '',
            Coach2_Name: row[11] || '',
            Coach3_Name: row[12] || '',
            Coach4_Name: row[13] || '',
            Director1_Name: row[14] || '',
            Director2_Name: row[15] || '',
            Director3_Name: row[16] || '',
            OrgDirector_Email: row[17] ? row[17].toLowerCase().trim() : '',
            OrgDirector_Name: row[18] || ''
          }));
          setProgramsData(programs);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching Google Sheets data:', err);

        // Provide more specific error messages
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error: Unable to connect to Google Sheets. Please check your internet connection or verify that the Google Sheets API is accessible.');
        } else if (err.message.includes('403')) {
          setError('Permission denied: The Google Sheets API key may be invalid or the sheet may not be publicly accessible.');
        } else if (err.message.includes('404')) {
          setError('Sheet not found: The Google Sheet ID may be incorrect.');
        } else {
          setError(`Failed to load data from Google Sheets: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const enrichedStudents = useMemo(() => {
    // Apply role-based filtering FIRST (if user is authenticated)
    const filteredStudents = currentUser && currentUser.role
      ? filterStudentsByRole(studentsData, currentUser)
      : studentsData; // If not authenticated yet, show all (will be filtered after login)

    const filteredOrders = currentUser && currentUser.role
      ? filterOrdersByRole(ordersData, filteredStudents)
      : ordersData;

    const filteredReferrals = currentUser && currentUser.role
      ? filterReferralsByRole(referralsData, filteredStudents, currentUser)
      : referralsData;

    // Debug: Log unique StudentIDs in Orders vs Students
    if (filteredOrders.length > 0 && filteredStudents.length > 0) {
      const orderStudentIDs = [...new Set(filteredOrders.map(o => o.StudentID))];
      const studentIDs = filteredStudents.map(s => s.StudentID);
      const unmatchedOrders = orderStudentIDs.filter(id => !studentIDs.includes(id));

      if (unmatchedOrders.length > 0) {
        console.warn('⚠️ Orders found for StudentIDs that do not exist in Students sheet:', unmatchedOrders);
        console.warn('These orders will NOT be counted in the leaderboard');
      }

      console.log('📊 Data Summary:', {
        totalStudents: filteredStudents.length,
        totalOrders: filteredOrders.length,
        studentsWithOrders: studentIDs.filter(id => orderStudentIDs.includes(id)).length,
        unmatchedOrderCount: unmatchedOrders.length,
        userRole: currentUser?.role || 'not authenticated'
      });
    }

    return filteredStudents.map(student => {
      const studentOrders = filteredOrders?.filter(o => o.StudentID === student.StudentID) || [];
      const NetQty = studentOrders.reduce((sum, o) => sum + (o.Status === 'Refunded' ? 0 : o.Quantity), 0);
      const NetRaised = studentOrders.reduce((sum, o) => sum + (o.Status === 'Refunded' ? 0 : o.TotalPaid), 0);
      const ProgressPct = student.Goal_$ > 0 ? NetRaised / student.Goal_$ : 0;
      const FullName = `${student.FirstName} ${student.LastName}`;
      const studentReferrals = filteredReferrals?.filter(r => r.StudentID === student.StudentID) || [];
      const ReferralPoints = studentReferrals.reduce((sum, r) => sum + r.Points, 0);

      return {
        ...student,
        FullName,
        CardsSold: NetQty,
        NetRaised,
        ReferralPoints,
        TotalRewards: NetRaised + ReferralPoints,
        ProgressPct,
        Rel_Orders: studentOrders,
        Rel_Referrals: studentReferrals
      };
    });
  }, [studentsData, ordersData, referralsData, currentUser]);

  const rankedStudents = useMemo(() => {
    const sorted = [...enrichedStudents].sort((a, b) => b.NetRaised - a.NetRaised);
    return sorted.map((student, index) => ({
      ...student,
      OverallRank: index + 1,
      Medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
    }));
  }, [enrichedStudents]);

  const studentsWithTeamStats = useMemo(() => {
    return rankedStudents.map(student => {
      const teamMates = rankedStudents.filter(s => s.Team === student.Team);
      const Team_Cards = teamMates.reduce((sum, s) => sum + s.CardsSold, 0);
      const Team_Net = teamMates.reduce((sum, s) => sum + s.NetRaised, 0);
      const teamSorted = teamMates.sort((a, b) => b.NetRaised - a.NetRaised);
      const TeamRank = teamSorted.findIndex(s => s.StudentID === student.StudentID) + 1;
      
      return {
        ...student,
        Team_Cards,
        Team_Net,
        TeamRank,
        Rel_TeamMates: teamMates
      };
    });
  }, [rankedStudents]);


  const referralRankings = useMemo(() => {
    const studentReferralMap = new Map();
    
    studentsWithTeamStats.forEach(student => {
      studentReferralMap.set(student.StudentID, {
        StudentID: student.StudentID,
        FullName: student.FullName,
        Avatar_URL: student.Avatar_URL,
        ReferralCount: student.Rel_Referrals?.length || 0,
        ReferralPoints: student.ReferralPoints,
        SignedUpCount: student.Rel_Referrals?.filter(r => r.Stage === 'Signed Up').length || 0
      });
    });

    return Array.from(studentReferralMap.values())
      .sort((a, b) => b.ReferralPoints - a.ReferralPoints)
      .map((student, index) => ({
        ...student,
        Rank: index + 1,
        Medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
      }));
  }, [studentsWithTeamStats]);

  // Sync currentStudent with fresh data from Google Sheets after data loads
  useEffect(() => {
    if (currentStudent && studentsWithTeamStats.length > 0) {
      // Find the updated student data by StudentID (use enriched data with calculations)
      const updatedStudent = studentsWithTeamStats.find(
        s => s.StudentID === currentStudent.StudentID
      );

      if (updatedStudent) {
        // Only update if the data has actually changed (prevent infinite loop)
        const hasChanged = JSON.stringify(currentStudent) !== JSON.stringify(updatedStudent);

        if (hasChanged) {
          // Update currentStudent with fresh data from Google Sheets
          setCurrentStudent(updatedStudent);
          // Update localStorage with fresh data
          localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsWithTeamStats]); // Only run when studentsWithTeamStats changes, not currentStudent

  const copyLink = () => {
    if (currentStudent?.PersonalLink) {
      navigator.clipboard.writeText(currentStudent.PersonalLink);
      alert('Link copied to clipboard!');
    }
  };

  const copyQRLink = () => {
    if (currentStudent?.QR_Link) {
      navigator.clipboard.writeText(currentStudent.QR_Link);
      alert('QR Link copied to clipboard!');
    } else {
      alert('No QR link available');
    }
  };

  // Referral form handlers
  const handleReferralFormChange = (field, value) => {
    setReferralFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (referralFormErrors[field]) {
      setReferralFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveReferral = async () => {
    // Validate form data
    const validation = validateReferralForm(referralFormData);
    
    if (!validation.isValid) {
      setReferralFormErrors(validation.errors);
      return;
    }

    setIsSavingReferral(true);
    setReferralSaveMessage('');
    setReferralFormErrors({});

    try {
      const referralData = {
        ...referralFormData,
        studentId: currentStudent?.StudentID,
        points: parseInt(referralFormData.points) || 0
      };

      const result = await saveReferral(referralData);

      if (result.success) {
        setReferralSaveMessage('Referral saved successfully!');
        
        // Reset form
        setReferralFormData({
          referralName: '',
          referralEmail: '',
          referralPhone: '',
          organization: '',
          stage: 'Contacted',
          points: 0
        });
        
        // Refresh data to show the new referral
        setTimeout(() => {
          window.location.reload(); // Simple refresh - could be optimized with state update
        }, 1500);
      } else {
        setReferralSaveMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setReferralSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSavingReferral(false);
    }
  };

  const resetReferralForm = () => {
    setReferralFormData({
      referralName: '',
      referralEmail: '',
      referralPhone: '',
      organization: '',
      stage: 'Contacted',
      points: 0
    });
    setReferralFormErrors({});
    setReferralSaveMessage('');
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Contacted': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Interested': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Meeting Scheduled': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Signed Up': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };
  
  const getStageIcon = (stage) => {
    switch(stage) {
      case 'Contacted': return '⏱️';
      case 'Interested': return '📈';
      case 'Meeting Scheduled': return '👥';
      case 'Signed Up': return '✅';
      default: return '⏱️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading fundraising data...</p>
        </div>
      </div>
    );
  }

  // Show platform demo if requested (admin only)
  if (showPlatformDemo) {
    if (!isAdmin) {
      // Non-admin trying to access platform - show access denied
      return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100 flex items-center justify-center">
          <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You do not have permission to access the SportsRaiser Platform.
            </p>
            <button
              onClick={() => setShowPlatformDemo(false)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Return to Leaderboard
            </button>
          </div>
        </div>
      );
    }
    return <DashboardDemo isAdmin={isAdmin} onBack={() => setShowPlatformDemo(false)} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} studentsData={studentsWithTeamStats} loading={loading} />;
  }

  // Route to appropriate dashboard based on user role
  if (currentUser && currentUser.role) {
    // OWNER gets dashboard selector
    if (currentUser.role === Role.OWNER) {
      // If no dashboard selected yet, show selector
      if (!selectedDashboard) {
        return (
          <DashboardSelector
            user={currentUser}
            onSelectDashboard={(choice) => setSelectedDashboard(choice)}
            onLogout={handleLogout}
          />
        );
      }

      // If platform selected, show DashboardDemo (full platform with all roles)
      if (selectedDashboard === 'platform') {
        return (
          <DashboardDemo
            isAdmin={true}
            onBack={() => setSelectedDashboard(null)}
            onLogout={handleLogout}
            currentUser={currentUser}
            studentsData={studentsWithTeamStats}
            ordersData={ordersData}
            referralsData={referralsData}
            programsData={programsData}
          />
        );
      }

      // If leaderboard selected, continue to student portal below
      // (fall through to render the leaderboard)
    }

    // Coaches, Directors, and Org Owners use DashboardRouter directly
    if (currentUser.role === Role.HEAD_COACH ||
        currentUser.role === Role.PROGRAM_DIRECTOR ||
        currentUser.role === Role.ORG_OWNER) {
      return (
        <DashboardRouter
          user={currentUser}
          studentsData={enrichedStudents}
          ordersData={ordersData}
          referralsData={referralsData}
          programsData={programsData}
          onLogout={handleLogout}
        />
      );
    }
    // Parent/Student role continues to use existing student portal below
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100">
      <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white p-6 shadow-2xl shadow-cyan-500/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Fundraising Leaderboard</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">
              Signed in as: {currentStudent?.ParentEmail}
            </div>
            <div className="flex items-center gap-3">
              {/* Switch Dashboard button - Owner Only */}
              {currentUser?.role === Role.OWNER && (
                <button
                  onClick={() => setSelectedDashboard(null)}
                  className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                >
                  <Building className="w-4 h-4" />
                  Switch Dashboard
                </button>
              )}
              {/* Platform Demo button - Admin Only */}
              {isAdmin && (
                <button
                  onClick={() => setShowPlatformDemo(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  Platform Demo
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
  <div className="max-w-6xl mx-auto flex overflow-x-auto">
    {['mystats', 'myteam', 'everyone', 'teamvsteam', 'referrals', 'profile']
      .filter(tab => tab !== 'referrals' || isAdmin) // Hide Referrals tab for non-admin users
      .map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`py-4 px-6 font-bold transition-all whitespace-nowrap ${
          activeTab === tab
            ? 'text-cyan-600 border-b-4 border-cyan-500 bg-cyan-50 shadow-inner'
            : 'text-gray-600 hover:text-cyan-500 hover:bg-cyan-50'
        }`}
      >
        {tab === 'mystats' && 'My Stats'}
        {tab === 'myteam' && 'My Team'}
        {tab === 'everyone' && 'Everyone'}
        {tab === 'teamvsteam' && 'Team vs Team'}
        {tab === 'referrals' && 'Referrals'}
        {tab === 'profile' && 'Profile'}
      </button>
    ))}
  </div>
</div>


      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'mystats' && currentStudent && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{currentStudent.FullName}</h2>
                  <p className="text-lg text-gray-600 mt-1">Team: {currentStudent.Team}</p>
                </div>
                {currentStudent.Avatar_URL && (
                  <img src={currentStudent.Avatar_URL} alt="Avatar" className="w-20 h-20 rounded-full" />
                )}
              </div>

              <div className="mb-6 space-y-4">
                {/* Progress to Fundraising Goal */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Progress to Goal</span>
                    <span className="font-bold text-cyan-600">
                      ${currentStudent.NetRaised} of ${currentStudent.Goal_$}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg shadow-cyan-500/50"
                      style={{ width: `${Math.min(currentStudent.ProgressPct * 100, 100)}%` }}
                    >
                      {currentStudent.ProgressPct > 0.1 && (
                        <span className="text-xs font-bold text-white">
                          {Math.round(currentStudent.ProgressPct * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress to 10 Cards Sold for Limited IDOL Tee Prize */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Progress to 10 Cards Sold for Limited IDOL Tee Prize!</span>
                    <span className="font-bold text-purple-600">
                      {currentStudent.CardsSold} of 10 cards
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg shadow-purple-500/50"
                      style={{ width: `${Math.min((currentStudent.CardsSold / 10) * 100, 100)}%` }}
                    >
                      {currentStudent.CardsSold > 1 && (
                        <span className="text-xs font-bold text-white">
                          {Math.round((currentStudent.CardsSold / 10) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress to 20 Cards Sold for Limited IDOL Hoodie Prize */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Progress to 20 Cards Sold for Limited IDOL Hoodie Prize!</span>
                    <span className="font-bold text-orange-600">
                      {currentStudent.CardsSold} of 20 cards
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg shadow-orange-500/50"
                      style={{ width: `${Math.min((currentStudent.CardsSold / 20) * 100, 100)}%` }}
                    >
                      {currentStudent.CardsSold > 2 && (
                        <span className="text-xs font-bold text-white">
                          {Math.round((currentStudent.CardsSold / 20) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl p-4 shadow-xl shadow-emerald-500/50 border-2 border-emerald-300 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-white drop-shadow-lg" />
                    <div className="text-xs font-black text-white drop-shadow">Raised</div>
                  </div>
                  <div className="text-3xl font-black text-white drop-shadow-lg">${currentStudent.NetRaised}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 shadow-xl shadow-blue-500/50 border-2 border-blue-300 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-white drop-shadow-lg" />
                    <div className="text-xs font-black text-white drop-shadow">Cards Sold</div>
                  </div>
                  <div className="text-3xl font-black text-white drop-shadow-lg">{currentStudent.CardsSold}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl p-4 shadow-xl shadow-cyan-500/50 border-2 border-cyan-300 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div className="text-xs font-semibold text-blue-700">Team Rank</div>
                  </div>
                  <div className="text-3xl font-black text-white drop-shadow-lg">#{currentStudent.TeamRank}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 shadow-xl shadow-orange-500/50 border-2 border-orange-300 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-white drop-shadow-lg" />
                    <div className="text-xs font-black text-white drop-shadow">Overall Rank</div>
                  </div>
                  <div className="text-3xl font-black text-white drop-shadow-lg">
                    {currentStudent.Medal || `#${currentStudent.OverallRank}`}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300 transform hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                  Copy My Link
                </button>
                <button
                  onClick={copyQRLink}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-fuchsia-500/50 border-2 border-fuchsia-300 transform hover:scale-105"
                >
                  <QrCode className="w-5 h-5" />
                  Copy My QR Link
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Orders</h3>
              <div className="space-y-3">
                {currentStudent.Rel_Orders?.length > 0 ? (
                  currentStudent.Rel_Orders?.map(order => (
                    <div key={order.OrderID} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">{order.BuyerName}</div>
                        <div className="text-lg font-bold text-green-600">${order.TotalPaid}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{order.Quantity} cards</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.Timestamp).toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <div>{order.BuyerEmail}</div>
                        {order.BuyerPhone && <div>{order.BuyerPhone}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'myteam' && currentStudent && (
          <MyTeamTab currentStudent={currentStudent} />
        )}

        {activeTab === 'everyone' && (
          <EveryoneTab studentsWithTeamStats={studentsWithTeamStats} currentStudent={currentStudent} />
        )}

        {activeTab === 'teamvsteam' && (
          <TeamVsTeamTab currentStudent={currentStudent} studentsWithTeamStats={studentsWithTeamStats} />
        )}

        {activeTab === 'referrals' && currentStudent && isAdmin && (
          <ReferralsTab currentStudent={currentStudent} />
        )}

        {/* Original referrals content replaced with new component */}
        {false && currentStudent && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
        <div className="text-sm font-black text-white mb-2 drop-shadow">My Referrals</div>
        <div className="text-4xl font-black text-white drop-shadow-lg">{currentStudent.Rel_Referrals?.length || 0}</div>
      </div>
      <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl shadow-green-500/50 p-6 border-2 border-green-300">
        <div className="text-sm font-black text-white mb-2 drop-shadow">Signed Up</div>
        <div className="text-4xl font-black text-white drop-shadow-lg">
          {currentStudent.Rel_Referrals?.filter(r => r.Stage === 'Signed Up').length || 0}
        </div>
      </div>
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300">
        <div className="text-sm font-black text-white mb-2 drop-shadow">Referral Points</div>
        <div className="text-4xl font-black text-white drop-shadow-lg">{currentStudent.ReferralPoints}</div>
      </div>
    </div>

    <button
      onClick={() => setShowReferralForm(!showReferralForm)}
      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300 transform hover:scale-105"
    >
      <UserPlus className="w-6 h-6" />
      {showReferralForm ? 'Close Form' : 'Add New Referral'}
    </button>

    {showReferralForm && (
      <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-cyan-400">
        <h3 className="text-xl font-black text-gray-900 mb-4">New Referral</h3>
        
        {referralSaveMessage && (
          <div className={`mb-4 p-4 rounded-xl border-2 ${
            referralSaveMessage.includes('Error') 
              ? 'bg-red-50 border-red-300 text-red-700' 
              : 'bg-green-50 border-green-300 text-green-700'
          }`}>
            <div className="flex items-center gap-2">
              {referralSaveMessage.includes('Error') ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">{referralSaveMessage}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              type="text" 
              placeholder="Name *" 
              value={referralFormData.referralName}
              onChange={(e) => handleReferralFormChange('referralName', e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full ${
                referralFormErrors.referralName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {referralFormErrors.referralName && (
              <p className="text-red-600 text-sm mt-1">{referralFormErrors.referralName}</p>
            )}
          </div>
          
          <div>
            <input 
              type="email" 
              placeholder="Email *" 
              value={referralFormData.referralEmail}
              onChange={(e) => handleReferralFormChange('referralEmail', e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full ${
                referralFormErrors.referralEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {referralFormErrors.referralEmail && (
              <p className="text-red-600 text-sm mt-1">{referralFormErrors.referralEmail}</p>
            )}
          </div>
          
          <div>
            <input 
              type="tel" 
              placeholder="Phone *" 
              value={referralFormData.referralPhone}
              onChange={(e) => handleReferralFormChange('referralPhone', e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full ${
                referralFormErrors.referralPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {referralFormErrors.referralPhone && (
              <p className="text-red-600 text-sm mt-1">{referralFormErrors.referralPhone}</p>
            )}
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="Organization *" 
              value={referralFormData.organization}
              onChange={(e) => handleReferralFormChange('organization', e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full ${
                referralFormErrors.organization ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {referralFormErrors.organization && (
              <p className="text-red-600 text-sm mt-1">{referralFormErrors.organization}</p>
            )}
          </div>
          
          <div>
            <select 
              value={referralFormData.stage}
              onChange={(e) => handleReferralFormChange('stage', e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full ${
                referralFormErrors.stage ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Signed Up">Signed Up</option>
            </select>
            {referralFormErrors.stage && (
              <p className="text-red-600 text-sm mt-1">{referralFormErrors.stage}</p>
            )}
          </div>
          
          <div>
            <input 
              type="number" 
              placeholder="Points (optional)" 
              value={referralFormData.points}
              onChange={(e) => handleReferralFormChange('points', parseInt(e.target.value) || 0)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-cyan-500 w-full"
              min="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleSaveReferral}
            disabled={isSavingReferral}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSavingReferral ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Add Referral
              </>
            )}
          </button>
          
          <button 
            onClick={resetReferralForm}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    )}

    <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-purple-400">
      <h3 className="text-2xl font-black text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
        My Referrals
      </h3>
      <div className="space-y-3">
        {currentStudent.Rel_Referrals?.length > 0 ? (
          currentStudent.Rel_Referrals?.map(referral => (
            <div key={referral.ReferralID} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-black text-gray-900 text-lg">{referral.ReferralName}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4" />
                    {referral.Organization}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border-2 font-bold text-xs flex items-center gap-1 ${getStageColor(referral.Stage)}`}>
                  <span>{getStageIcon(referral.Stage)}</span>
                  {referral.Stage}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {referral.ReferralEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {referral.ReferralPhone}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Added: {new Date(referral.DateAdded).toLocaleDateString()}
                </div>
                <div className="text-lg font-black text-purple-600">
                  {referral.Points} points
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No referrals yet. Add your first referral above!</p>
        )}
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-orange-400">
      <h3 className="text-2xl font-black text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
        Referral Leaderboard
      </h3>
      <div className="space-y-3">
        {referralRankings.slice(0, 10).map(student => (
          <div key={student.StudentID} className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-full font-black text-white text-xl shadow-lg">
                {student.Medal || `#${student.Rank}`}
              </div>
              {student.Avatar_URL && (
                <img src={student.Avatar_URL} alt="Avatar" className="w-12 h-12 rounded-full" />
              )}
              <div className="flex-1">
                <div className="font-black text-gray-900">{student.FullName}</div>
                <div className="text-sm text-gray-600">{student.ReferralCount} referrals • {student.SignedUpCount} signed up</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-purple-600">{student.ReferralPoints}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

        {activeTab === 'profile' && currentStudent && (
          <ProfilePage 
            currentStudent={currentStudent} 
            onUpdateProfile={(updatedStudent) => {
              setCurrentStudent(updatedStudent);
              // Update the students data to reflect changes
              setStudentsData(prev => 
                prev.map(student => 
                  student.StudentID === updatedStudent.StudentID ? updatedStudent : student
                )
              );
            }} 
          />
        )}


      </div>
    </div>
  );
};

export default FundraisingApp;