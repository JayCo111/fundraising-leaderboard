import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  Building,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings,
  MessageSquare,
  Gift,
  Shield
} from 'lucide-react';
import MessagingCenter from './MessagingCenter';
import PayoutsRewards from './PayoutsRewards';
import AdvancedReferralCRM from './AdvancedReferralCRM';
import AuditExports from './AuditExports';

const DirectorDashboard = ({ userRole, userScope, userData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [scopeFilter, setScopeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Mock data - replace with actual API calls
  const mockDashboardData = useMemo(() => {
    const baseData = {
      totalRevenue: 125000,
      totalCards: 2500,
      activePrograms: 45,
      totalAthletes: 1200,
      avgPerAthlete: 104.17,
      participationRate: 0.78,
      topPerformers: [
        { name: 'Sarah Johnson', team: 'Lightning', revenue: 2500, cards: 50 },
        { name: 'Mike Chen', team: 'Thunder', revenue: 2200, cards: 44 },
        { name: 'Emma Davis', team: 'Storm', revenue: 2100, cards: 42 }
      ],
      recentActivity: [
        { type: 'transaction', message: 'New $500 transaction from Lightning team', time: '2 min ago' },
        { type: 'referral', message: 'Sarah Johnson added new prospect', time: '15 min ago' },
        { type: 'goal', message: 'Thunder team reached 80% of goal', time: '1 hour ago' }
      ]
    };

    // Adjust data based on user role and scope
    switch (userRole) {
      case 'OWNER':
        return {
          ...baseData,
          totalRevenue: 2500000,
          totalCards: 50000,
          activePrograms: 200,
          totalAthletes: 5000,
          regions: [
            { name: 'West Coast', revenue: 750000, programs: 60 },
            { name: 'East Coast', revenue: 800000, programs: 65 },
            { name: 'Midwest', revenue: 600000, programs: 50 },
            { name: 'South', revenue: 350000, programs: 25 }
          ]
        };
      case 'CEO':
        return {
          ...baseData,
          totalRevenue: 1800000,
          totalCards: 36000,
          activePrograms: 150,
          totalAthletes: 4000,
          regions: [
            { name: 'West Coast', revenue: 600000, programs: 45 },
            { name: 'East Coast', revenue: 650000, programs: 50 },
            { name: 'Midwest', revenue: 400000, programs: 35 },
            { name: 'South', revenue: 150000, programs: 20 }
          ]
        };
      case 'REGIONAL_DIRECTOR':
        return {
          ...baseData,
          totalRevenue: 400000,
          totalCards: 8000,
          activePrograms: 30,
          totalAthletes: 800,
          states: [
            { name: 'California', revenue: 200000, programs: 15 },
            { name: 'Oregon', revenue: 100000, programs: 8 },
            { name: 'Washington', revenue: 100000, programs: 7 }
          ]
        };
      case 'STATE_DIRECTOR':
        return {
          ...baseData,
          totalRevenue: 150000,
          totalCards: 3000,
          activePrograms: 12,
          totalAthletes: 300,
          territories: [
            { name: 'Northern CA', revenue: 80000, programs: 6 },
            { name: 'Southern CA', revenue: 70000, programs: 6 }
          ]
        };
      case 'TERRITORY_DIRECTOR':
        return {
          ...baseData,
          totalRevenue: 75000,
          totalCards: 1500,
          activePrograms: 6,
          totalAthletes: 150,
          salesReps: [
            { name: 'John Smith', revenue: 40000, prospects: 25 },
            { name: 'Jane Doe', revenue: 35000, prospects: 20 }
          ]
        };
      default:
        return baseData;
    }
  }, [userRole]);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 1000);
  }, [dateRange, scopeFilter, mockDashboardData]);

  const getRoleTitle = () => {
    switch (userRole) {
      case 'OWNER': return 'Owner Dashboard';
      case 'CEO': return 'CEO Dashboard';
      case 'REGIONAL_DIRECTOR': return 'Regional Director Dashboard';
      case 'STATE_DIRECTOR': return 'State Director Dashboard';
      case 'TERRITORY_DIRECTOR': return 'Territory Director Dashboard';
      default: return 'Director Dashboard';
    }
  };

  const getScopeTitle = () => {
    switch (userRole) {
      case 'OWNER': return 'National Overview';
      case 'CEO': return 'National Overview';
      case 'REGIONAL_DIRECTOR': return `${userScope?.region || 'Regional'} Overview`;
      case 'STATE_DIRECTOR': return `${userScope?.state || 'State'} Overview`;
      case 'TERRITORY_DIRECTOR': return `${userScope?.territory || 'Territory'} Overview`;
      default: return 'Overview';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{getRoleTitle()}</h1>
              <p className="text-lg text-gray-600 mt-1">{getScopeTitle()}</p>
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
              { id: 'leaderboards', label: 'Leaderboards', icon: Award },
              { id: 'programs', label: 'Programs', icon: Building },
              { id: 'referrals', label: 'Referral CRM', icon: Users },
              { id: 'messaging', label: 'Messaging', icon: MessageSquare },
              { id: 'payouts', label: 'Payouts & Rewards', icon: Gift },
              { id: 'audit', label: 'Audit & Exports', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'reports', label: 'Reports', icon: Download }
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
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Revenue</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(dashboardData?.totalRevenue || 0)}
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
                      {formatNumber(dashboardData?.totalCards || 0)}
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
                      {dashboardData?.activePrograms || 0}
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
                      {formatNumber(dashboardData?.totalAthletes || 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-cyan-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Average per Athlete</h3>
                <div className="text-3xl font-black text-emerald-600">
                  {formatCurrency(dashboardData?.avgPerAthlete || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Revenue per active athlete</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Participation Rate</h3>
                <div className="text-3xl font-black text-blue-600">
                  {Math.round((dashboardData?.participationRate || 0) * 100)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Athletes actively fundraising</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-400">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Goal Achievement</h3>
                <div className="text-3xl font-black text-purple-600">87%</div>
                <p className="text-sm text-gray-600 mt-2">Programs meeting targets</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-400">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performers</h3>
              <div className="space-y-4">
                {dashboardData?.topPerformers?.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(performer.revenue)}</p>
                      <p className="text-sm text-gray-600">{performer.cards} cards</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-3">
                {dashboardData?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'transaction' ? 'bg-emerald-500' :
                      activity.type === 'referral' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                    <p className="text-gray-700 flex-1">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboards</h3>
              <p className="text-gray-600">Leaderboard functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Programs Management</h3>
              <p className="text-gray-600">Program management functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <AdvancedReferralCRM 
            userRole={userRole} 
            userData={userData} 
            userScope={userScope} 
          />
        )}

        {activeTab === 'messaging' && (
          <MessagingCenter 
            userRole={userRole} 
            userData={userData} 
            userScope={userScope} 
          />
        )}

        {activeTab === 'payouts' && (
          <PayoutsRewards 
            userRole={userRole} 
            userData={userData} 
            userScope={userScope} 
          />
        )}

        {activeTab === 'audit' && (
          <AuditExports 
            userRole={userRole} 
            userData={userData} 
            userScope={userScope} 
          />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics</h3>
              <p className="text-gray-600">Analytics and reporting functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reports & Exports</h3>
              <p className="text-gray-600">Report generation and export functionality will be implemented here...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
