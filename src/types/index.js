// Local types for the React app
export const Role = {
  OWNER: 'OWNER',
  CEO: 'CEO',
  REGIONAL_DIRECTOR: 'REGIONAL_DIRECTOR',
  STATE_DIRECTOR: 'STATE_DIRECTOR',
  TERRITORY_DIRECTOR: 'TERRITORY_DIRECTOR',
  SALES_REP: 'SALES_REP',
  ORG_OWNER: 'ORG_OWNER',
  PROGRAM_DIRECTOR: 'PROGRAM_DIRECTOR',
  HEAD_COACH: 'HEAD_COACH',
  PARENT_STUDENT: 'PARENT_STUDENT',
};

export const User = {
  id: '',
  name: '',
  email: '',
  role: Role.PARENT_STUDENT,
  status: 'ACTIVE',
  org_id: null,
  program_id: null,
  team_id: null,
  territory_id: null,
  state_code: null,
  region_code: null,
  created_at: new Date(),
};
