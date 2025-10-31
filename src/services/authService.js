/**
 * Authentication Service - Role Detection and Permission Management
 *
 * This service determines user roles based on their email address by checking:
 * 1. Owner (hardcoded): josejr.corp@gmail.com
 * 2. Organization Director: Programs sheet column R
 * 3. Program Directors: Programs sheet columns H-J
 * 4. Head Coaches: Programs sheet columns D-G
 * 5. Parent/Student: Students sheet ParentEmail column
 */

// Role constants
export const Role = {
  OWNER: 'OWNER',
  ORG_OWNER: 'ORG_OWNER', // Organization Director
  PROGRAM_DIRECTOR: 'PROGRAM_DIRECTOR',
  HEAD_COACH: 'HEAD_COACH',
  PARENT_STUDENT: 'PARENT_STUDENT'
};

// Permission scopes
export const Scope = {
  NATIONAL: 'national', // All data
  ORGANIZATION: 'organization', // All teams in organization
  PROGRAM: 'program', // All teams in assigned programs
  TEAM: 'team', // Only assigned teams
  STUDENT: 'student' // Only own student data
};

/**
 * Authenticate user and determine their role(s) and permissions
 * @param {string} email - User's email address
 * @param {Array} programsData - Programs sheet data (columns A-S)
 * @param {Array} studentsData - Students sheet data
 * @returns {Object} User object with role, scope, permissions, accessible teams/programs
 */
export function authenticateUser(email, programsData, studentsData) {
  const normalizedEmail = email.toLowerCase().trim();

  // Priority 1: Check if OWNER
  if (normalizedEmail === 'josejr.corp@gmail.com') {
    return {
      role: Role.OWNER,
      scope: Scope.NATIONAL,
      email: normalizedEmail,
      name: 'Owner',
      teams: [], // Empty = access all teams
      programs: [], // Empty = access all programs
      organizations: [], // Empty = access all organizations
      permissions: ['all']
    };
  }

  // Priority 2: Check Programs sheet for Director/Coach roles
  if (programsData && programsData.length > 0) {
    const programsRole = findUserInPrograms(normalizedEmail, programsData);

    // Organization Director (highest non-owner role)
    if (programsRole.isOrgDirector) {
      return {
        role: Role.ORG_OWNER,
        scope: Scope.ORGANIZATION,
        email: normalizedEmail,
        name: programsRole.orgDirectorName,
        teams: programsRole.allTeams,
        programs: programsRole.allPrograms,
        organizations: programsRole.organizations,
        permissions: ['view_org', 'manage_programs', 'manage_teams', 'manage_coaches', 'view_all_students']
      };
    }

    // Program Director
    if (programsRole.isDirector) {
      return {
        role: Role.PROGRAM_DIRECTOR,
        scope: Scope.PROGRAM,
        email: normalizedEmail,
        name: programsRole.directorName,
        teams: programsRole.directorTeams,
        programs: programsRole.directorPrograms,
        organizations: programsRole.organizations,
        permissions: ['view_program', 'manage_teams', 'manage_coaches', 'view_students', 'message_coaches']
      };
    }

    // Head Coach
    if (programsRole.isCoach) {
      return {
        role: Role.HEAD_COACH,
        scope: Scope.TEAM,
        email: normalizedEmail,
        name: programsRole.coachName,
        teams: programsRole.coachTeams,
        programs: programsRole.coachPrograms,
        organizations: programsRole.organizations,
        permissions: ['view_team', 'manage_roster', 'invite_students', 'message_students', 'add_referrals']
      };
    }
  }

  // Priority 3: Check Students sheet (Parent/Student)
  if (studentsData && studentsData.length > 0) {
    const student = studentsData.find(s =>
      s.ParentEmail && s.ParentEmail.toLowerCase().trim() === normalizedEmail
    );

    if (student) {
      return {
        role: Role.PARENT_STUDENT,
        scope: Scope.STUDENT,
        email: normalizedEmail,
        name: `${student.FirstName} ${student.LastName}'s Parent`,
        studentId: student.StudentID,
        studentName: `${student.FirstName} ${student.LastName}`,
        team: student.Team,
        program: student.Program,
        teams: [student.Team], // Array with single team for consistency
        programs: [student.Program],
        permissions: ['view_own_data']
      };
    }
  }

  // Not found
  return {
    role: null,
    error: 'Email not found in system. Please contact your coach or administrator.'
  };
}

/**
 * Find user's roles in Programs sheet
 * @param {string} email - Normalized email address
 * @param {Array} programsData - Programs sheet data
 * @returns {Object} Role information including teams, programs, names
 */
function findUserInPrograms(email, programsData) {
  const roles = {
    isOrgDirector: false,
    isDirector: false,
    isCoach: false,
    orgDirectorName: '',
    directorName: '',
    coachName: '',
    organizations: new Set(),
    allPrograms: new Set(),
    allTeams: new Set(),
    directorPrograms: new Set(),
    directorTeams: new Set(),
    coachPrograms: new Set(),
    coachTeams: new Set()
  };

  programsData.forEach(row => {
    const team = row.Team;
    const program = row.Program;
    const organization = row.Organization;

    // Check if user is Organization Director (Column R)
    if (row.OrgDirector_Email === email) {
      roles.isOrgDirector = true;
      roles.orgDirectorName = row.OrgDirector_Name;
      roles.organizations.add(organization);
      roles.allPrograms.add(program);
      roles.allTeams.add(team);
    }

    // Check if user is a Program Director (Columns H-J)
    const directorEmails = [
      row.Director1_Email,
      row.Director2_Email,
      row.Director3_Email
    ];

    if (directorEmails.includes(email)) {
      roles.isDirector = true;
      // Get director name from matching column
      if (row.Director1_Email === email) roles.directorName = row.Director1_Name;
      else if (row.Director2_Email === email) roles.directorName = row.Director2_Name;
      else if (row.Director3_Email === email) roles.directorName = row.Director3_Name;

      roles.organizations.add(organization);
      roles.directorPrograms.add(program);
      roles.directorTeams.add(team);
    }

    // Check if user is a Coach (Columns D-G)
    const coachEmails = [
      row.Coach1_Email,
      row.Coach2_Email,
      row.Coach3_Email,
      row.Coach4_Email
    ];

    if (coachEmails.includes(email)) {
      roles.isCoach = true;
      // Get coach name from matching column
      if (row.Coach1_Email === email) roles.coachName = row.Coach1_Name;
      else if (row.Coach2_Email === email) roles.coachName = row.Coach2_Name;
      else if (row.Coach3_Email === email) roles.coachName = row.Coach3_Name;
      else if (row.Coach4_Email === email) roles.coachName = row.Coach4_Name;

      roles.organizations.add(organization);
      roles.coachPrograms.add(program);
      roles.coachTeams.add(team);
    }
  });

  // Convert Sets to Arrays
  return {
    ...roles,
    organizations: Array.from(roles.organizations),
    allPrograms: Array.from(roles.allPrograms),
    allTeams: Array.from(roles.allTeams),
    directorPrograms: Array.from(roles.directorPrograms),
    directorTeams: Array.from(roles.directorTeams),
    coachPrograms: Array.from(roles.coachPrograms),
    coachTeams: Array.from(roles.coachTeams)
  };
}

/**
 * Check if user can access a specific team's data
 * @param {Object} user - User object from authenticateUser()
 * @param {string} team - Team name
 * @returns {boolean}
 */
export function canAccessTeam(user, team) {
  if (!user || !user.role) return false;

  // Owner can access all teams
  if (user.role === Role.OWNER) return true;

  // Other roles check their teams array
  return user.teams.includes(team) || user.teams.length === 0; // Empty array = access all
}

/**
 * Check if user can access a specific program's data
 * @param {Object} user - User object from authenticateUser()
 * @param {string} program - Program name
 * @returns {boolean}
 */
export function canAccessProgram(user, program) {
  if (!user || !user.role) return false;

  // Owner can access all programs
  if (user.role === Role.OWNER) return true;

  // Other roles check their programs array
  return user.programs.includes(program) || user.programs.length === 0; // Empty array = access all
}

/**
 * Check if user can edit a specific student's data
 * @param {Object} user - User object from authenticateUser()
 * @param {Object} student - Student object
 * @returns {boolean}
 */
export function canEditStudent(user, student) {
  if (!user || !user.role || !student) return false;

  // Owner can edit all students
  if (user.role === Role.OWNER) return true;

  // Org Directors and Program Directors can edit students in their scope
  if (user.role === Role.ORG_OWNER || user.role === Role.PROGRAM_DIRECTOR) {
    return canAccessTeam(user, student.Team);
  }

  // Coaches can edit students on their teams
  if (user.role === Role.HEAD_COACH) {
    return user.teams.includes(student.Team);
  }

  // Parents can only view, not edit (unless we add parent editing later)
  return false;
}

/**
 * Check if user can message a specific recipient
 * @param {Object} user - User object from authenticateUser()
 * @param {string} recipientEmail - Recipient's email address
 * @param {string} recipientRole - Recipient's role (optional)
 * @returns {boolean}
 */
export function canMessageRecipient(user, recipientEmail, recipientRole = null) {
  if (!user || !user.role) return false;

  // Owner can message anyone
  if (user.role === Role.OWNER) return true;

  // Org Directors can message anyone in their organization
  if (user.role === Role.ORG_OWNER) return true;

  // Program Directors can message coaches and students in their programs
  if (user.role === Role.PROGRAM_DIRECTOR) {
    // Can message students/parents in their programs
    // Can message other coaches/directors in their programs
    return true; // Simplified for MVP - can enhance with recipient program checking
  }

  // Head Coaches can message students/parents on their teams and other coaches in their program
  if (user.role === Role.HEAD_COACH) {
    return true; // Simplified for MVP - can enhance with recipient team checking
  }

  // Parents cannot send messages in current design
  return false;
}
