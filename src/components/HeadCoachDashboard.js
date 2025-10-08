import { useState, useMemo } from 'react';
import {
  Trophy,
  Users,
  Target,
  DollarSign,
  Edit,
  Eye,
  BarChart3,
  Award,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Star,
  UserPlus,
  MessageSquare,
  Heart,
  Clock
} from 'lucide-react';
import MessagingCenter from './MessagingCenter';
import AdvancedReferralCRM from './AdvancedReferralCRM';

const HeadCoachDashboard = ({ userData, teamData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [showAddAthlete, setShowAddAthlete] = useState(false);

  // Mock data for athletes and team performance
  const mockAthletes = useMemo(() => [
    {
      id: 'athlete-1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      position: 'Forward',
      jerseyNumber: 10,
      status: 'ACTIVE',
      cardsSold: 45,
      revenue: 2250,
      goal: 2000,
      participationRate: 1.0,
      lastActivity: '2024-01-17',
      parentEmail: 'parent1@email.com',
      parentPhone: '(555) 123-4568',
      achievements: ['Top Seller', 'Goal Achiever'],
      teamRank: 1,
      programRank: 3
    },
    {
      id: 'athlete-2',
      name: 'Mike Chen',
      email: 'mike.c@email.com',
      phone: '(555) 234-5678',
      position: 'Midfielder',
      jerseyNumber: 7,
      status: 'ACTIVE',
      cardsSold: 38,
      revenue: 1900,
      goal: 2000,
      participationRate: 0.95,
      lastActivity: '2024-01-16',
      parentEmail: 'parent2@email.com',
      parentPhone: '(555) 234-5679',
      achievements: ['Consistent Performer'],
      teamRank: 2,
      programRank: 8
    },
    {
      id: 'athlete-3',
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      phone: '(555) 345-6789',
      position: 'Defender',
      jerseyNumber: 4,
      status: 'ACTIVE',
      cardsSold: 32,
      revenue: 1600,
      goal: 2000,
      participationRate: 0.8,
      lastActivity: '2024-01-15',
      parentEmail: 'parent3@email.com',
      parentPhone: '(555) 345-6790',
      achievements: [],
      teamRank: 3,
      programRank: 15
    },
    {
      id: 'athlete-4',
      name: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      phone: '(555) 456-7890',
      position: 'Goalkeeper',
      jerseyNumber: 1,
      status: 'INACTIVE',
      cardsSold: 15,
      revenue: 750,
      goal: 2000,
      participationRate: 0.3,
      lastActivity: '2024-01-10',
      parentEmail: 'parent4@email.com',
      parentPhone: '(555) 456-7891',
      achievements: [],
      teamRank: 4,
      programRank: 25
    }
  ], []);

  const athletes = mockAthletes;

  const teamStats = useMemo(() => {
    const activeAthletes = athletes.filter(a => a.status === 'ACTIVE');
    const totalCardsSold = athletes.reduce((sum, a) => sum + a.cardsSold, 0);
    const totalRevenue = athletes.reduce((sum, a) => sum + a.revenue, 0);
    const totalGoal = athletes.reduce((sum, a) => sum + a.goal, 0);
    const avgParticipationRate = athletes.reduce((sum, a) => sum + a.participationRate, 0) / athletes.length || 0;
    const goalAchievementRate = totalGoal > 0 ? (totalRevenue / totalGoal) * 100 : 0;

    return {
      totalAthletes: athletes.length,
      activeAthletes: activeAthletes.length,
      totalCardsSold,
      totalRevenue,
      totalGoal,
      avgParticipationRate,
      goalAchievementRate,
      avgPerAthlete: athletes.length > 0 ? totalRevenue / athletes.length : 0
    };
  }, [athletes]);

  const peerTeams = useMemo(() => [
    {
      id: 'team-2',
      name: 'Thunder',
      coach: 'Coach Martinez',
      athletes: 12,
      revenue: 18500,
      cardsSold: 370,
      rank: 1,
      medal: '🥇'
    },
    {
      id: 'team-3',
      name: 'Storm',
      coach: 'Coach Wilson',
      athletes: 11,
      revenue: 16200,
      cardsSold: 324,
      rank: 2,
      medal: '🥈'
    },
    {
      id: 'team-1',
      name: teamData?.name || 'Lightning',
      coach: userData?.name || 'Coach Johnson',
      athletes: teamStats.totalAthletes,
      revenue: teamStats.totalRevenue,
      cardsSold: teamStats.totalCardsSold,
      rank: 3,
      medal: '🥉'
    },
    {
      id: 'team-4',
      name: 'Blaze',
      coach: 'Coach Brown',
      athletes: 10,
      revenue: 14200,
      cardsSold: 284,
      rank: 4,
      medal: null
    }
  ], [teamStats, teamData, userData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'INJURED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE': return <AlertCircle className="w-4 h-4" />;
      case 'INJURED': return <Heart className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleAddAthlete = () => {
    // Implementation for adding new athlete
    setShowAddAthlete(false);
  };

  const handleSendMessage = () => {
    // Implementation for sending message to athlete
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Head Coach Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">{teamData?.name || 'Lightning'} Team Management</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border-2 border-cyan-300 rounded-xl font-semibold text-gray-700 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'athletes', label: 'Athletes', icon: Users },
              { id: 'teamvsteam', label: 'Team vs Team', icon: Trophy },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award },
              { id: 'referrals', label: 'Referral CRM', icon: Users },
              { id: 'messaging', label: 'Messaging', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl shadow-emerald-500/50 p-6 border-2 border-emerald-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Team Revenue</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(teamStats.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Cards Sold</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatNumber(teamStats.totalCardsSold)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Active Athletes</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {teamStats.activeAthletes}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Team Rank</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">#{3}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-cyan-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Goal Achievement</h3>
                <div className="text-3xl font-black text-emerald-600">
                  {Math.round(teamStats.goalAchievementRate)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Of team fundraising goal</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Participation Rate</h3>
                <div className="text-3xl font-black text-blue-600">
                  {Math.round(teamStats.avgParticipationRate * 100)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Athletes actively fundraising</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Average per Athlete</h3>
                <div className="text-3xl font-black text-purple-600">
                  {formatCurrency(teamStats.avgPerAthlete)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Revenue per athlete</p>
              </div>
            </div>

            {/* Team vs Team Rankings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-400">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Team vs Team Rankings</h3>
              <div className="space-y-4">
                {peerTeams.map((team) => (
                  <div key={team.id} className={`border-2 rounded-xl p-4 transition-all ${
                    team.id === 'team-1' 
                      ? 'border-cyan-400 bg-cyan-50' 
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {team.medal || `#${team.rank}`}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{team.name}</h4>
                          <p className="text-sm text-gray-600">Coach: {team.coach}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(team.revenue)}</div>
                        <div className="text-sm text-gray-600">{team.cardsSold} cards • {team.athletes} athletes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'athletes' && (
          <div className="space-y-6">
            {/* Athletes Management */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Team Roster</h3>
                <button
                  onClick={() => setShowAddAthlete(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Athlete
                </button>
              </div>
              <div className="space-y-4">
                {athletes.map((athlete) => (
                  <div key={athlete.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {athlete.jerseyNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{athlete.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(athlete.status)}`}>
                              {getStatusIcon(athlete.status)}
                              {athlete.status}
                            </span>
                            {athlete.achievements.length > 0 && (
                              <div className="flex items-center gap-1">
                                {athlete.achievements.map((achievement, index) => (
                                  <span key={index} className="text-yellow-500">
                                    <Star className="w-4 h-4" />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              {athlete.cardsSold} cards
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(athlete.revenue)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              Team #{athlete.teamRank}
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              Program #{athlete.programRank}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress to Goal</span>
                              <span className="font-semibold">{Math.round((athlete.revenue / athlete.goal) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((athlete.revenue / athlete.goal) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendMessage(athlete.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teamvsteam' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team vs Team Competition</h3>
              <p className="text-gray-600">Detailed team vs team functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Athlete Leaderboard</h3>
              <p className="text-gray-600">Athlete leaderboard functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <AdvancedReferralCRM 
            userRole="HEAD_COACH" 
            userData={userData} 
            userScope={{ team: teamData?.id }} 
          />
        )}

        {activeTab === 'messaging' && (
          <MessagingCenter 
            userRole="HEAD_COACH" 
            userData={userData} 
            userScope={{ team: teamData?.id }} 
          />
        )}
      </div>

      {/* Add Athlete Modal */}
      {showAddAthlete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Athlete</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Athlete Name *</label>
                <input
                  type="text"
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="athlete@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jersey Number</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="">Select Position</option>
                  <option value="forward">Forward</option>
                  <option value="midfielder">Midfielder</option>
                  <option value="defender">Defender</option>
                  <option value="goalkeeper">Goalkeeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAthlete}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Add Athlete
              </button>
              <button
                onClick={() => setShowAddAthlete(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadCoachDashboard;
