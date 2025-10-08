// src/components/EveryoneTab.js
import React from 'react';
import { Trophy, Users, Target, TrendingUp, Award, Star } from 'lucide-react';

const EveryoneTab = ({ studentsWithTeamStats, currentStudent }) => {
  if (!studentsWithTeamStats) return null;

  // Sort all students by total raised
  const sortedStudents = [...studentsWithTeamStats].sort((a, b) => (b.NetRaised || 0) - (a.NetRaised || 0));

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Program-Wide Rankings</h2>
            <p className="text-indigo-100">Individual Athlete Leaderboard</p>
          </div>
          <Users className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Top 10 Leaderboard */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ranked by Total Raised
          </div>
        </div>

        <div className="space-y-3">
          {sortedStudents.slice(0, 10).map((student, index) => (
            <div
              key={student.StudentID}
              className={`border-2 rounded-lg p-4 transition-all ${
                student.StudentID === currentStudent?.StudentID
                  ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index === 0 ? <Trophy className="w-5 h-5" /> :
                     index === 1 ? <Award className="w-5 h-5" /> :
                     index === 2 ? <Award className="w-5 h-5" /> :
                     index + 1}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      student.StudentID === currentStudent?.StudentID ? 'text-cyan-700' : 'text-gray-900'
                    }`}>
                      {student.FirstName} {student.LastName}
                      {student.StudentID === currentStudent?.StudentID && (
                        <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.Team} • {student.CardsSold || 0} cards
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${student.NetRaised || 0}</div>
                  <div className="text-sm text-gray-600">{student.CardsSold || 0} cards</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Position */}
      {currentStudent && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Position</h3>
              <p className="text-gray-600">
                You are currently ranked #{sortedStudents.findIndex(s => s.StudentID === currentStudent.StudentID) + 1} out of {sortedStudents.length} athletes
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-600">
                #{sortedStudents.findIndex(s => s.StudentID === currentStudent.StudentID) + 1}
              </div>
              <div className="text-sm text-gray-600">Your Rank</div>
            </div>
          </div>
        </div>
      )}

      {/* Program Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{sortedStudents.length}</div>
          <div className="text-sm text-gray-600">Total Athletes</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sortedStudents.reduce((sum, student) => sum + (student.CardsSold || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            ${sortedStudents.reduce((sum, student) => sum + (student.NetRaised || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Raised</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(sortedStudents.reduce((sum, student) => sum + (student.NetRaised || 0), 0) / sortedStudents.length)}
          </div>
          <div className="text-sm text-gray-600">Average per Athlete</div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-yellow-700">Top 10</div>
            <div className="text-xs text-yellow-600">
              {sortedStudents.slice(0, 10).filter(s => s.StudentID === currentStudent?.StudentID).length > 0 ? 'Earned' : 'Not Yet'}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-blue-700">50+ Cards</div>
            <div className="text-xs text-blue-600">
              {(currentStudent?.CardsSold || 0) >= 50 ? 'Earned' : 'Not Yet'}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-green-700">$500+</div>
            <div className="text-xs text-green-600">
              {(currentStudent?.NetRaised || 0) >= 500 ? 'Earned' : 'Not Yet'}
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-purple-700">Team Player</div>
            <div className="text-xs text-purple-600">
              {(currentStudent?.ReferralPoints || 0) >= 100 ? 'Earned' : 'Not Yet'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveryoneTab;
