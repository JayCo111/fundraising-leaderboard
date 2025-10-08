import { useState, useMemo } from 'react';
import {
  Building,
  Users,
  Target,
  DollarSign,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Award,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Trophy
} from 'lucide-react';

const ClubSchoolDirector = ({ userData, organizationData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [showAddProgram, setShowAddProgram] = useState(false);

  // Mock data for programs and campaigns
  const mockPrograms = useMemo(() => [
    {
      id: 'program-1',
      name: 'Spring Soccer 2024',
      sport: 'Soccer',
      season: 'Spring',
      year: 2024,
      status: 'ACTIVE',
      teams: 8,
      athletes: 120,
      coaches: 8,
      goal: 50000,
      raised: 42500,
      cardsSold: 850,
      participationRate: 0.85,
      avgPerAthlete: 354.17,
      campaigns: [
        { id: 'camp-1', name: 'Team vs Team Challenge', status: 'ACTIVE', startDate: '2024-01-15', endDate: '2024-03-15' },
        { id: 'camp-2', name: 'Individual Goals', status: 'ACTIVE', startDate: '2024-01-20', endDate: '2024-03-20' }
      ],
      createdAt: '2024-01-01'
    },
    {
      id: 'program-2',
      name: 'Fall Basketball 2024',
      sport: 'Basketball',
      season: 'Fall',
      year: 2024,
      status: 'PLANNING',
      teams: 6,
      athletes: 90,
      coaches: 6,
      goal: 40000,
      raised: 0,
      cardsSold: 0,
      participationRate: 0,
      avgPerAthlete: 0,
      campaigns: [],
      createdAt: '2024-01-10'
    },
    {
      id: 'program-3',
      name: 'Winter Track 2024',
      sport: 'Track & Field',
      season: 'Winter',
      year: 2024,
      status: 'COMPLETED',
      teams: 4,
      athletes: 60,
      coaches: 4,
      goal: 30000,
      raised: 32000,
      cardsSold: 640,
      participationRate: 0.92,
      avgPerAthlete: 533.33,
      campaigns: [
        { id: 'camp-3', name: 'Track Stars Challenge', status: 'COMPLETED', startDate: '2023-11-01', endDate: '2023-12-31' }
      ],
      createdAt: '2023-10-15'
    }
  ], []);

  const programs = mockPrograms;

  const organizationStats = useMemo(() => {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(p => p.status === 'ACTIVE').length;
    const totalAthletes = programs.reduce((sum, p) => sum + p.athletes, 0);
    const totalCoaches = programs.reduce((sum, p) => sum + p.coaches, 0);
    const totalGoal = programs.reduce((sum, p) => sum + p.goal, 0);
    const totalRaised = programs.reduce((sum, p) => sum + p.raised, 0);
    const totalCardsSold = programs.reduce((sum, p) => sum + p.cardsSold, 0);
    const avgParticipationRate = programs.reduce((sum, p) => sum + p.participationRate, 0) / programs.length || 0;

    return {
      totalPrograms,
      activePrograms,
      totalAthletes,
      totalCoaches,
      totalGoal,
      totalRaised,
      totalCardsSold,
      avgParticipationRate,
      goalAchievementRate: totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0
    };
  }, [programs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNING': return 'bg-gray-100 text-gray-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PLANNING': return <Clock className="w-4 h-4" />;
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED': return <Trophy className="w-4 h-4" />;
      case 'PAUSED': return <AlertCircle className="w-4 h-4" />;
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

  const handleAddProgram = () => {
    // Implementation for adding new program
    setShowAddProgram(false);
  };

  const handleLaunchCampaign = () => {
    // Implementation for launching campaign
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Club/School Director Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">{organizationData?.name || 'Organization'} Management</p>
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
              { id: 'programs', label: 'Programs', icon: Building },
              { id: 'campaigns', label: 'Campaigns', icon: Target },
              { id: 'leaderboards', label: 'Leaderboards', icon: Award },
              { id: 'reports', label: 'Reports', icon: FileText }
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
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Raised</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(organizationStats.totalRaised)}
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
                      {formatNumber(organizationStats.totalCardsSold)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Active Programs</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {organizationStats.activePrograms}
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Athletes</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatNumber(organizationStats.totalAthletes)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-cyan-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Goal Achievement</h3>
                <div className="text-3xl font-black text-emerald-600">
                  {Math.round(organizationStats.goalAchievementRate)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Of total fundraising goal</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Participation Rate</h3>
                <div className="text-3xl font-black text-blue-600">
                  {Math.round(organizationStats.avgParticipationRate * 100)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Athletes actively fundraising</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Average per Athlete</h3>
                <div className="text-3xl font-black text-purple-600">
                  {formatCurrency(organizationStats.totalRaised / organizationStats.totalAthletes || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Revenue per athlete</p>
              </div>
            </div>

            {/* Programs Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-400">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Programs Overview</h3>
                <button
                  onClick={() => setShowAddProgram(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Program
                </button>
              </div>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{program.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(program.status)}`}>
                            {getStatusIcon(program.status)}
                            {program.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {program.athletes} athletes
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {program.teams} teams
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            {program.cardsSold} cards
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(program.raised)}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress to Goal</span>
                            <span className="font-semibold">{Math.round((program.raised / program.goal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((program.raised / program.goal) * 100, 100)}%` }}
                            ></div>
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
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {program.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleLaunchCampaign(program.id)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Launch Campaign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Programs Management</h3>
              <p className="text-gray-600">Detailed program management functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Management</h3>
              <p className="text-gray-600">Campaign launch and management functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Leaderboards</h3>
              <p className="text-gray-600">Organization-wide leaderboard functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reports & Analytics</h3>
              <p className="text-gray-600">Reporting and analytics functionality will be implemented here...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Program Modal */}
      {showAddProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Spring Soccer 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="">Select Sport</option>
                  <option value="soccer">Soccer</option>
                  <option value="basketball">Basketball</option>
                  <option value="football">Football</option>
                  <option value="baseball">Baseball</option>
                  <option value="track">Track & Field</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="">Select Season</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  defaultValue="2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fundraising Goal</label>
                <input
                  type="number"
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Athletes</label>
                <input
                  type="number"
                  placeholder="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProgram}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Program
              </button>
              <button
                onClick={() => setShowAddProgram(false)}
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

export default ClubSchoolDirector;
