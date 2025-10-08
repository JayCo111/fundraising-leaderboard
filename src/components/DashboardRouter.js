import { useState, useEffect } from 'react';
import { Role } from '../types';
import DirectorDashboard from './DirectorDashboard';
import SalesRepCRM from './SalesRepCRM';
import ClubSchoolDirector from './ClubSchoolDirector';
import HeadCoachDashboard from './HeadCoachDashboard';

const DashboardRouter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate user authentication check
    // In a real app, this would check for JWT token, session, etc.
    const mockUser = {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@sportsraiser.com',
      role: Role.SALES_REP, // Change this to test different roles
      status: 'ACTIVE',
      org_id: 'org-1',
      program_id: 'program-1',
      team_id: 'team-1',
      territory_id: 'territory-1',
      state_code: 'CA',
      region_code: 'WEST',
      created_at: new Date()
    };

    // Mock user data based on role
    const getUserData = (role) => {
      switch (role) {
        case Role.OWNER:
          return {
            ...mockUser,
            role: Role.OWNER,
            name: 'Owner User',
            email: 'owner@sportsraiser.com'
          };
        case Role.CEO:
          return {
            ...mockUser,
            role: Role.CEO,
            name: 'CEO User',
            email: 'ceo@sportsraiser.com'
          };
        case Role.REGIONAL_DIRECTOR:
          return {
            ...mockUser,
            role: Role.REGIONAL_DIRECTOR,
            name: 'Regional Director',
            email: 'regional@sportsraiser.com',
            region_code: 'WEST'
          };
        case Role.STATE_DIRECTOR:
          return {
            ...mockUser,
            role: Role.STATE_DIRECTOR,
            name: 'State Director',
            email: 'state@sportsraiser.com',
            state_code: 'CA'
          };
        case Role.TERRITORY_DIRECTOR:
          return {
            ...mockUser,
            role: Role.TERRITORY_DIRECTOR,
            name: 'Territory Director',
            email: 'territory@sportsraiser.com',
            territory_id: 'territory-1'
          };
        case Role.SALES_REP:
          return {
            ...mockUser,
            role: Role.SALES_REP,
            name: 'Sales Rep',
            email: 'sales@sportsraiser.com',
            territory_id: 'territory-1'
          };
        case Role.ORG_OWNER:
          return {
            ...mockUser,
            role: Role.ORG_OWNER,
            name: 'Organization Owner',
            email: 'orgowner@sportsraiser.com',
            org_id: 'org-1'
          };
        case Role.PROGRAM_DIRECTOR:
          return {
            ...mockUser,
            role: Role.PROGRAM_DIRECTOR,
            name: 'Program Director',
            email: 'program@sportsraiser.com',
            program_id: 'program-1'
          };
        case Role.HEAD_COACH:
          return {
            ...mockUser,
            role: Role.HEAD_COACH,
            name: 'Head Coach',
            email: 'coach@sportsraiser.com',
            team_id: 'team-1'
          };
        case Role.PARENT_STUDENT:
          return {
            ...mockUser,
            role: Role.PARENT_STUDENT,
            name: 'Student/Parent',
            email: 'student@sportsraiser.com'
          };
        default:
          return mockUser;
      }
    };

    // Simulate loading delay
    setTimeout(() => {
      setCurrentUser(getUserData(Role.SALES_REP)); // Change this to test different roles
      setLoading(false);
    }, 1000);
  }, []);

  const getUserScope = (user) => {
    switch (user.role) {
      case Role.OWNER:
        return { scope: 'national' };
      case Role.CEO:
        return { scope: 'national' };
      case Role.REGIONAL_DIRECTOR:
        return { region: user.region_code };
      case Role.STATE_DIRECTOR:
        return { state: user.state_code };
      case Role.TERRITORY_DIRECTOR:
        return { territory: user.territory_id };
      case Role.SALES_REP:
        return { territory: user.territory_id };
      case Role.ORG_OWNER:
        return { organization: user.org_id };
      case Role.PROGRAM_DIRECTOR:
        return { program: user.program_id };
      case Role.HEAD_COACH:
        return { team: user.team_id };
      default:
        return {};
    }
  };

  const getAdditionalData = (user) => {
    switch (user.role) {
      case Role.SALES_REP:
        return {
          territoryData: {
            id: user.territory_id,
            name: 'Northern CA',
            state: 'California',
            region: 'West Coast'
          }
        };
      case Role.ORG_OWNER:
        return {
          organizationData: {
            id: user.org_id,
            name: 'Springfield Youth Sports',
            type: 'School District',
            location: 'Springfield, CA'
          }
        };
      case Role.PROGRAM_DIRECTOR:
        return {
          programData: {
            id: user.program_id,
            name: 'Spring Soccer 2024',
            sport: 'Soccer',
            season: 'Spring'
          }
        };
      case Role.HEAD_COACH:
        return {
          teamData: {
            id: user.team_id,
            name: 'Lightning',
            sport: 'Soccer',
            program: 'Spring Soccer 2024'
          },
          programData: {
            id: user.program_id,
            name: 'Spring Soccer 2024',
            sport: 'Soccer',
            season: 'Spring'
          }
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

  const userScope = getUserScope(currentUser);
  const additionalData = getAdditionalData(currentUser);

  // Render appropriate dashboard based on user role
  switch (currentUser.role) {
    case Role.OWNER:
    case Role.CEO:
    case Role.REGIONAL_DIRECTOR:
    case Role.STATE_DIRECTOR:
    case Role.TERRITORY_DIRECTOR:
      return (
        <DirectorDashboard
          userRole={currentUser.role}
          userScope={userScope}
          userData={currentUser}
        />
      );

    case Role.SALES_REP:
      return (
        <SalesRepCRM
          userData={currentUser}
          territoryData={additionalData.territoryData}
        />
      );

    case Role.ORG_OWNER:
      return (
        <ClubSchoolDirector
          userData={currentUser}
          organizationData={additionalData.organizationData}
        />
      );

    case Role.PROGRAM_DIRECTOR:
      return (
        <ClubSchoolDirector
          userData={currentUser}
          organizationData={additionalData.organizationData}
        />
      );

    case Role.HEAD_COACH:
      return (
        <HeadCoachDashboard
          userData={currentUser}
          teamData={additionalData.teamData}
          programData={additionalData.programData}
        />
      );

    case Role.PARENT_STUDENT:
      // This would redirect to the existing student portal
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
