import { Trophy, Building2, LogOut } from 'lucide-react';

const DashboardSelector = ({ user, onSelectDashboard, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-fuchsia-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome, {user.name}!</h1>
          <p className="text-lg text-gray-600">Select a dashboard to access</p>
          <button
            onClick={onLogout}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fundraiser Leaderboard */}
          <button
            onClick={() => onSelectDashboard('leaderboard')}
            className="group relative bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-cyan-400"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 rounded-t-2xl"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3">
                Fundraiser Leaderboard
              </h2>

              <p className="text-gray-600 mb-4">
                View student fundraising stats, team rankings, and overall leaderboard
              </p>

              <div className="text-sm text-cyan-600 font-semibold">
                Student Portal →
              </div>
            </div>
          </button>

          {/* SportsRaiser Platform */}
          <button
            onClick={() => onSelectDashboard('platform')}
            className="group relative bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-emerald-400"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-green-600 rounded-t-2xl"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow">
                <Building2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3">
                SportsRaiser Platform
              </h2>

              <p className="text-gray-600 mb-4">
                Manage organizations, programs, coaches, roster uploads, and analytics
              </p>

              <div className="text-sm text-emerald-600 font-semibold">
                Director/Coach Platform →
              </div>
            </div>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-500">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
              <span className="text-cyan-600 font-bold">ℹ️</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Full Access</h3>
              <p className="text-sm text-gray-600">
                As an Owner, you have full access to both dashboards. You can switch between them at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;
