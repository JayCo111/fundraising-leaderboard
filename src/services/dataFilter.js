/**
 * Data Filtering Service - Role-Based Data Scoping
 *
 * This service filters students, orders, teams, and other data based on user role and permissions.
 * Ensures users only see data they're authorized to access.
 */

import { Role, Scope } from './authService';

/**
 * Filter students based on user's role and accessible teams
 * @param {Array} students - All students from Google Sheets
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Filtered students
 */
export function filterStudentsByRole(students, user) {
  if (!user || !user.role || !students) return [];

  // Owner sees all students
  if (user.role === Role.OWNER) {
    return students;
  }

  // Organization Directors see all students in their organization
  if (user.role === Role.ORG_OWNER) {
    // If organizations array is empty, see all (shouldn't happen but safe default)
    if (user.organizations.length === 0) return students;

    return students.filter(student =>
      user.organizations.includes(student.Program) ||
      user.programs.includes(student.Program)
    );
  }

  // Program Directors see all students in their assigned programs
  if (user.role === Role.PROGRAM_DIRECTOR) {
    return students.filter(student =>
      user.programs.includes(student.Program)
    );
  }

  // Head Coaches see only students on their assigned teams
  if (user.role === Role.HEAD_COACH) {
    return students.filter(student =>
      user.teams.includes(student.Team)
    );
  }

  // Parents see all students in their program (for leaderboards and team comparison)
  // They can see stats but not personal details like orders
  if (user.role === Role.PARENT_STUDENT) {
    // Get the program from the parent's student
    const parentStudent = students.find(s => s.StudentID === user.studentId);
    if (!parentStudent) return [];

    // Return all students in the same program
    return students.filter(student =>
      student.Program === parentStudent.Program
    );
  }

  return [];
}

/**
 * Filter orders based on accessible students
 * @param {Array} orders - All orders from Google Sheets
 * @param {Array} accessibleStudents - Pre-filtered students for this user
 * @returns {Array} Filtered orders
 */
export function filterOrdersByRole(orders, accessibleStudents) {
  if (!orders || !accessibleStudents) return [];

  // Create set of accessible StudentIDs for fast lookup
  const accessibleStudentIds = new Set(
    accessibleStudents.map(s => s.StudentID)
  );

  // Return only orders for accessible students
  return orders.filter(order =>
    accessibleStudentIds.has(order.StudentID)
  );
}

/**
 * Filter teams based on user's role and accessible teams
 * @param {Array} allTeams - Array of unique team names
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Filtered team names
 */
export function filterTeamsByRole(allTeams, user) {
  if (!user || !user.role || !allTeams) return [];

  // Owner sees all teams
  if (user.role === Role.OWNER) {
    return allTeams;
  }

  // Organization Directors, Program Directors, and Coaches have teams array
  if (user.teams && user.teams.length > 0) {
    return allTeams.filter(team => user.teams.includes(team));
  }

  // Parent/Student doesn't see team list
  if (user.role === Role.PARENT_STUDENT) {
    return user.team ? [user.team] : [];
  }

  return [];
}

/**
 * Filter referrals based on user's role
 * @param {Array} referrals - All referrals from Google Sheets
 * @param {Array} accessibleStudents - Pre-filtered students for this user
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Filtered referrals
 */
export function filterReferralsByRole(referrals, accessibleStudents, user) {
  if (!referrals) return [];

  // Create set of accessible StudentIDs
  const accessibleStudentIds = new Set(
    accessibleStudents.map(s => s.StudentID)
  );

  // Filter referrals by ReferrerType and accessible scope
  return referrals.filter(referral => {
    // Student referrals - check if referring student is accessible
    if (referral.ReferrerType === 'STUDENT') {
      return accessibleStudentIds.has(referral.StudentID);
    }

    // Coach referrals - check if referrer is current user
    if (referral.ReferrerType === 'COACH') {
      return referral.ReferrerID === user.email;
    }

    // Legacy referrals without ReferrerType (assume STUDENT)
    return accessibleStudentIds.has(referral.StudentID);
  });
}

/**
 * Filter programs based on user's accessible programs
 * @param {Array} programs - All programs from Google Sheets
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Filtered programs
 */
export function filterProgramsByRole(programs, user) {
  if (!user || !user.role || !programs) return [];

  // Owner sees all programs
  if (user.role === Role.OWNER) {
    return programs;
  }

  // Filter by accessible programs
  if (user.programs && user.programs.length > 0) {
    return programs.filter(program =>
      user.programs.includes(program.Program)
    );
  }

  return [];
}

/**
 * Get unique teams from filtered students
 * @param {Array} students - Filtered students
 * @returns {Array} Array of unique team names
 */
export function getUniqueTeams(students) {
  if (!students) return [];
  return [...new Set(students.map(s => s.Team))].sort();
}

/**
 * Get unique programs from filtered students
 * @param {Array} students - Filtered students
 * @returns {Array} Array of unique program names
 */
export function getUniquePrograms(students) {
  if (!students) return [];
  return [...new Set(students.map(s => s.Program))].sort();
}

/**
 * Filter team rankings to only show accessible teams
 * @param {Array} teamRankings - Team rankings with aggregated stats
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Filtered team rankings
 */
export function filterTeamRankingsByRole(teamRankings, user) {
  if (!user || !user.role || !teamRankings) return [];

  // Owner sees all teams
  if (user.role === Role.OWNER) {
    return teamRankings;
  }

  // Filter by accessible teams
  if (user.teams && user.teams.length > 0) {
    return teamRankings.filter(teamRank =>
      user.teams.includes(teamRank.Team)
    );
  }

  return [];
}

/**
 * Filter coaches/directors for messaging based on user's scope
 * @param {Array} programs - Programs data with all coach/director emails
 * @param {Object} user - User object from authenticateUser()
 * @returns {Array} Array of {email, name, role, team, program} for accessible coaches/directors
 */
export function getAccessibleCoaches(programs, user) {
  if (!user || !user.role || !programs) return [];

  const coaches = [];
  const seenEmails = new Set();

  programs.forEach(program => {
    // Only process programs user has access to
    if (user.programs.length > 0 && !user.programs.includes(program.Program)) {
      return;
    }

    // Add coaches from this team
    const coachData = [
      { email: program.Coach1_Email, name: program.Coach1_Name, role: 'Coach' },
      { email: program.Coach2_Email, name: program.Coach2_Name, role: 'Coach' },
      { email: program.Coach3_Email, name: program.Coach3_Name, role: 'Coach' },
      { email: program.Coach4_Email, name: program.Coach4_Name, role: 'Coach' }
    ];

    coachData.forEach(coach => {
      if (coach.email && !seenEmails.has(coach.email) && coach.email !== user.email) {
        seenEmails.add(coach.email);
        coaches.push({
          email: coach.email,
          name: coach.name,
          role: coach.role,
          team: program.Team,
          program: program.Program
        });
      }
    });

    // Add directors from this team (if user is not a parent)
    if (user.role !== Role.PARENT_STUDENT) {
      const directorData = [
        { email: program.Director1_Email, name: program.Director1_Name, role: 'Program Director' },
        { email: program.Director2_Email, name: program.Director2_Name, role: 'Program Director' },
        { email: program.Director3_Email, name: program.Director3_Name, role: 'Program Director' }
      ];

      directorData.forEach(director => {
        if (director.email && !seenEmails.has(director.email) && director.email !== user.email) {
          seenEmails.add(director.email);
          coaches.push({
            email: director.email,
            name: director.name,
            role: director.role,
            team: program.Team,
            program: program.Program
          });
        }
      });
    }

    // Add org director
    if (program.OrgDirector_Email && !seenEmails.has(program.OrgDirector_Email) && program.OrgDirector_Email !== user.email) {
      seenEmails.add(program.OrgDirector_Email);
      coaches.push({
        email: program.OrgDirector_Email,
        name: program.OrgDirector_Name,
        role: 'Organization Director',
        team: program.Team,
        program: program.Program
      });
    }
  });

  return coaches;
}

/**
 * Get students for a specific team (for multi-team coaches)
 * @param {Array} students - Filtered students for user
 * @param {string} teamName - Team name to filter by
 * @returns {Array} Students on specified team
 */
export function getStudentsByTeam(students, teamName) {
  if (!students || !teamName) return [];
  return students.filter(s => s.Team === teamName);
}
