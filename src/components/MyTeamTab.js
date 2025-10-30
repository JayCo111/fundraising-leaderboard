// src/components/MyTeamTab.js
import { Trophy, Users, Target, TrendingUp, DollarSign } from 'lucide-react';

const MyTeamTab = ({ currentStudent }) => {
  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-2xl shadow-cyan-500/50 p-6 border-2 border-cyan-300 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-white mb-2 drop-shadow">Team Total Raised</div>
              <div className="text-3xl font-black text-white drop-shadow-lg">${currentStudent.Team_Net || 0}</div>
            </div>
            <DollarSign className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-fuchsia-500 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-white mb-2 drop-shadow">Team Cards Sold</div>
              <div className="text-3xl font-black text-white drop-shadow-lg">{currentStudent.Team_Cards || 0}</div>
            </div>
            <Target className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl shadow-green-500/50 p-6 border-2 border-green-300 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-white mb-2 drop-shadow">Team Rank</div>
              <div className="text-3xl font-black text-white drop-shadow-lg">#{currentStudent.TeamRank || 0}</div>
            </div>
            <Trophy className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-white mb-2 drop-shadow">Team Members</div>
              <div className="text-3xl font-black text-white drop-shadow-lg">{currentStudent.Rel_TeamMates?.length || 0}</div>
            </div>
            <Users className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Team Members Leaderboard */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Team: {currentStudent.Team}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ranked by Total Raised
          </div>
        </div>

        <div className="space-y-3">
          {currentStudent.Rel_TeamMates?.map((teammate, index) => (
            <div
              key={teammate.StudentID}
              className={`border-2 rounded-lg p-4 transition-all ${
                teammate.StudentID === currentStudent.StudentID
                  ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    teammate.StudentID === currentStudent.StudentID
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      teammate.StudentID === currentStudent.StudentID ? 'text-cyan-700' : 'text-gray-900'
                    }`}>
                      {teammate.FirstName} {teammate.LastName}
                      {teammate.StudentID === currentStudent.StudentID && (
                        <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {teammate.CardsSold || 0} cards • ${teammate.NetRaised || 0} raised
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${teammate.NetRaised || 0}</div>
                  <div className="text-sm text-gray-600">{teammate.CardsSold || 0} cards</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Progress */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Team Goals</h3>
        <div className="space-y-4">
          {/* Team Goal 1: 100 Cards */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Team Goal 1: 100 Cards Sold</span>
              <span>{currentStudent.Team_Cards || 0} / 100 cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-lg shadow-purple-500/50"
                style={{ width: `${Math.min(((currentStudent.Team_Cards || 0) / 100) * 100, 100)}%` }}
              >
                {(currentStudent.Team_Cards || 0) > 5 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(((currentStudent.Team_Cards || 0) / 100) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Team Goal 2: 200 Cards */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Team Goal 2: 200 Cards Sold</span>
              <span>{currentStudent.Team_Cards || 0} / 200 cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-lg shadow-blue-500/50"
                style={{ width: `${Math.min(((currentStudent.Team_Cards || 0) / 200) * 100, 100)}%` }}
              >
                {(currentStudent.Team_Cards || 0) > 10 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(((currentStudent.Team_Cards || 0) / 200) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Team Goal 3: 300 Cards */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Team Goal 3: 300 Cards Sold</span>
              <span>{currentStudent.Team_Cards || 0} / 300 cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-lg shadow-orange-500/50"
                style={{ width: `${Math.min(((currentStudent.Team_Cards || 0) / 300) * 100, 100)}%` }}
              >
                {(currentStudent.Team_Cards || 0) > 15 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(((currentStudent.Team_Cards || 0) / 300) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeamTab;
