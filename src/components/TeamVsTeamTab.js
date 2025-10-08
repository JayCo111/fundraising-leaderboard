// src/components/TeamVsTeamTab.js
import { Trophy, Award } from 'lucide-react';

const TeamVsTeamTab = ({ currentStudent, studentsWithTeamStats }) => {
  if (!currentStudent) return null;

  // Get all teams in the same program
  const programTeams = studentsWithTeamStats?.reduce((teams, student) => {
    if (!teams[student.Team]) {
      teams[student.Team] = {
        name: student.Team,
        totalRaised: 0,
        totalCards: 0,
        memberCount: 0,
        members: []
      };
    }
    teams[student.Team].totalRaised += student.NetRaised || 0;
    teams[student.Team].totalCards += student.CardsSold || 0;
    teams[student.Team].memberCount += 1;
    teams[student.Team].members.push(student);
    return teams;
  }, {}) || {};

  // Convert to array and sort by total raised
  const sortedTeams = Object.values(programTeams).sort((a, b) => b.totalRaised - a.totalRaised);

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Program Competition</h2>
            <p className="text-purple-100">Team vs Team Rankings</p>
          </div>
          <Trophy className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Team Rankings */}
      <div className="space-y-4">
        {sortedTeams.map((team, index) => (
          <div
            key={team.name}
            className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all ${
              team.name === currentStudent.Team
                ? 'border-cyan-500 bg-cyan-50 shadow-cyan-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index === 0 ? <Trophy className="w-6 h-6" /> :
                   index === 1 ? <Award className="w-6 h-6" /> :
                   index === 2 ? <Award className="w-6 h-6" /> :
                   index + 1}
                </div>
                <div>
                  <div className={`text-xl font-bold ${
                    team.name === currentStudent.Team ? 'text-cyan-700' : 'text-gray-900'
                  }`}>
                    {team.name}
                    {team.name === currentStudent.Team && (
                      <span className="ml-2 text-sm bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Your Team</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {team.memberCount} members • {team.totalCards} cards sold
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${team.totalRaised}</div>
                <div className="text-sm text-gray-600">Total Raised</div>
              </div>
            </div>

            {/* Team Members Preview */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Top Performers</span>
                <span className="text-xs text-gray-500">Top 3 by revenue</span>
              </div>
              <div className="flex space-x-2">
                {team.members
                  .sort((a, b) => (b.NetRaised || 0) - (a.NetRaised || 0))
                  .slice(0, 3)
                  .map((member, memberIndex) => (
                    <div
                      key={member.StudentID}
                      className={`flex-1 p-2 rounded-lg text-center ${
                        member.StudentID === currentStudent.StudentID
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">
                        {member.FirstName} {member.LastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        ${member.NetRaised || 0}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Competition Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{sortedTeams.length}</div>
          <div className="text-sm text-gray-600">Teams Competing</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sortedTeams.reduce((sum, team) => sum + team.memberCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Athletes</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            ${sortedTeams.reduce((sum, team) => sum + team.totalRaised, 0)}
          </div>
          <div className="text-sm text-gray-600">Program Total</div>
        </div>
      </div>

      {/* Your Team's Position */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Your Team's Position</h3>
            <p className="text-gray-600">
              {currentStudent.Team} is currently ranked #{sortedTeams.findIndex(team => team.name === currentStudent.Team) + 1} out of {sortedTeams.length} teams
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-600">
              #{sortedTeams.findIndex(team => team.name === currentStudent.Team) + 1}
            </div>
            <div className="text-sm text-gray-600">Current Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamVsTeamTab;
