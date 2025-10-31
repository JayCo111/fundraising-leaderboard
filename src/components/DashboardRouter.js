import { Role } from '../types';
import ClubSchoolDirector from './ClubSchoolDirector';
import HeadCoachDashboard from './HeadCoachDashboard';

const DashboardRouter = ({ user, studentsData, ordersData, referralsData, programsData, onLogout }) => {
  // Receive real user from App.js (already authenticated and with filtered data)
  const currentUser = user;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  switch (currentUser.role) {
    case Role.OWNER:
    case Role.ORG_OWNER:
      return (
        <ClubSchoolDirector
          user={currentUser}
          studentsData={studentsData}
          ordersData={ordersData}
          referralsData={referralsData}
          programsData={programsData}
          onLogout={onLogout}
        />
      );

    case Role.PROGRAM_DIRECTOR:
      return (
        <ClubSchoolDirector
          user={currentUser}
          studentsData={studentsData}
          ordersData={ordersData}
          referralsData={referralsData}
          programsData={programsData}
          onLogout={onLogout}
        />
      );

    case Role.HEAD_COACH:
      return (
        <HeadCoachDashboard
          user={currentUser}
          studentsData={studentsData}
          ordersData={ordersData}
          referralsData={referralsData}
          programsData={programsData}
          onLogout={onLogout}
        />
      );

    case Role.PARENT_STUDENT:
      // This would redirect to the existing student portal (handled in App.js)
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student/Parent Portal</h1>
            <p className="text-gray-600">Redirecting to student portal...</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
