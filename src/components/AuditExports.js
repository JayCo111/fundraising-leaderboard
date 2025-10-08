import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  Eye,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Share2
} from 'lucide-react';
import { Role } from '../types';

const AuditExports = ({ userRole, userData, userScope }) => {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateRange, setExportDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Mock audit log data
  const mockAuditLogs = useMemo(() => [
    {
      id: 'audit-1',
      timestamp: '2024-01-17T10:30:00Z',
      userId: 'student-1',
      userName: 'Mike Chen',
      userRole: Role.PARENT_STUDENT,
      action: 'LOGIN',
      description: 'User logged in successfully',
      resourceType: 'USER',
      resourceId: 'student-1',
      resourceName: 'Mike Chen',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        loginMethod: 'email',
        sessionDuration: 3600
      }
    },
    {
      id: 'audit-2',
      timestamp: '2024-01-17T10:35:00Z',
      userId: 'student-1',
      userName: 'Mike Chen',
      userRole: Role.PARENT_STUDENT,
      action: 'CREATE_REFERRAL',
      description: 'Added new prospect: Springfield High School',
      resourceType: 'PROSPECT',
      resourceId: 'prospect-1',
      resourceName: 'Springfield High School',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        prospectStage: 'ADDED',
        pointsAwarded: 10
      }
    },
    {
      id: 'audit-3',
      timestamp: '2024-01-17T11:00:00Z',
      userId: 'coach-1',
      userName: 'Coach Martinez',
      userRole: Role.HEAD_COACH,
      action: 'SEND_MESSAGE',
      description: 'Sent team motivation message to 12 athletes',
      resourceType: 'MESSAGE',
      resourceId: 'msg-1',
      resourceName: 'Team Motivation Message',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        recipientCount: 12,
        messageType: 'SMS',
        templateUsed: 'team_motivation'
      }
    },
    {
      id: 'audit-4',
      timestamp: '2024-01-17T11:15:00Z',
      userId: 'sales-1',
      userName: 'Sales Rep 1',
      userRole: Role.SALES_REP,
      action: 'UPDATE_PROSPECT_STAGE',
      description: 'Updated prospect stage from INTERESTED to QUALIFIED',
      resourceType: 'PROSPECT',
      resourceId: 'prospect-2',
      resourceName: 'Riverside Middle School',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        oldStage: 'INTERESTED',
        newStage: 'QUALIFIED',
        pointsAwarded: 50
      }
    },
    {
      id: 'audit-5',
      timestamp: '2024-01-17T11:30:00Z',
      userId: 'director-1',
      userName: 'Program Director',
      userRole: Role.PROGRAM_DIRECTOR,
      action: 'PROCESS_PAYOUT',
      description: 'Processed payout of $150.00 to Mike Chen',
      resourceType: 'PAYOUT',
      resourceId: 'payout-1',
      resourceName: 'Performance Bonus - Mike Chen',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        amount: 150.00,
        paymentMethod: 'PAYPAL',
        transactionId: 'TXN-123456789'
      }
    },
    {
      id: 'audit-6',
      timestamp: '2024-01-17T12:00:00Z',
      userId: 'student-2',
      userName: 'Emma Davis',
      userRole: Role.PARENT_STUDENT,
      action: 'FAILED_LOGIN',
      description: 'Failed login attempt with incorrect password',
      resourceType: 'USER',
      resourceId: 'student-2',
      resourceName: 'Emma Davis',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      status: 'FAILED',
      details: {
        failureReason: 'INVALID_PASSWORD',
        attemptCount: 3
      }
    },
    {
      id: 'audit-7',
      timestamp: '2024-01-17T12:15:00Z',
      userId: 'admin-1',
      userName: 'System Admin',
      userRole: Role.OWNER,
      action: 'EXPORT_DATA',
      description: 'Exported user data for compliance audit',
      resourceType: 'EXPORT',
      resourceId: 'export-1',
      resourceName: 'User Data Export - Q1 2024',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      details: {
        exportFormat: 'CSV',
        recordCount: 1250,
        dataTypes: ['users', 'transactions', 'referrals']
      }
    },
    {
      id: 'audit-8',
      timestamp: '2024-01-17T12:30:00Z',
      userId: 'student-3',
      userName: 'Alex Rodriguez',
      userRole: Role.PARENT_STUDENT,
      action: 'UPDATE_PROFILE',
      description: 'Updated avatar image',
      resourceType: 'PROFILE',
      resourceId: 'student-3',
      resourceName: 'Alex Rodriguez Profile',
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
      status: 'SUCCESS',
      details: {
        fieldsChanged: ['avatar_url'],
        oldValue: null,
        newValue: 'data:image/jpeg;base64,...'
      }
    }
  ], []);

  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
      const matchesUser = !userFilter || log.userId === userFilter;
      const matchesAction = !actionFilter || log.action === actionFilter;
      return matchesSearch && matchesDate && matchesUser && matchesAction;
    });
  }, [auditLogs, searchTerm, dateFilter, userFilter, actionFilter]);

  const auditStats = useMemo(() => {
    const totalLogs = auditLogs.length;
    const successLogs = auditLogs.filter(log => log.status === 'SUCCESS').length;
    const failedLogs = auditLogs.filter(log => log.status === 'FAILED').length;
    const uniqueUsers = new Set(auditLogs.map(log => log.userId)).size;
    const actions = [...new Set(auditLogs.map(log => log.action))];

    return {
      totalLogs,
      successLogs,
      failedLogs,
      uniqueUsers,
      actions,
      successRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0
    };
  }, [auditLogs]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return <User className="w-4 h-4" />;
      case 'LOGOUT': return <User className="w-4 h-4" />;
      case 'CREATE_REFERRAL': return <Plus className="w-4 h-4" />;
      case 'UPDATE_PROSPECT_STAGE': return <Edit className="w-4 h-4" />;
      case 'SEND_MESSAGE': return <Share2 className="w-4 h-4" />;
      case 'PROCESS_PAYOUT': return <DollarSign className="w-4 h-4" />;
      case 'EXPORT_DATA': return <Download className="w-4 h-4" />;
      case 'UPDATE_PROFILE': return <Edit className="w-4 h-4" />;
      case 'FAILED_LOGIN': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock CSV data
      const csvData = filteredLogs.map(log => ({
        timestamp: log.timestamp,
        user: log.userName,
        role: log.userRole,
        action: log.action,
        description: log.description,
        resource: log.resourceName,
        status: log.status,
        ipAddress: log.ipAddress
      }));

      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${exportDateRange.start}_to_${exportDateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Audit Logs & Data Exports</h1>
              <p className="text-lg text-gray-600 mt-1">Compliance, security, and data management</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
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
              { id: 'audit', label: 'Audit Logs', icon: Shield },
              { id: 'exports', label: 'Data Exports', icon: Download },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
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
        {activeTab === 'audit' && (
          <div className="space-y-8">
            {/* Audit Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl shadow-emerald-500/50 p-6 border-2 border-emerald-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Logs</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{auditStats.totalLogs}</p>
                  </div>
                  <Database className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Success Rate</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{Math.round(auditStats.successRate)}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Unique Users</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{auditStats.uniqueUsers}</p>
                  </div>
                  <User className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Failed Actions</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{auditStats.failedLogs}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Users</option>
                    {[...new Set(auditLogs.map(log => log.userName))].map(userName => (
                      <option key={userName} value={auditLogs.find(log => log.userName === userName)?.userId}>
                        {userName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Actions</option>
                    {auditStats.actions.map(action => (
                      <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {log.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{log.userName}</div>
                              <div className="text-xs text-gray-500">{log.userRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="text-sm font-medium text-gray-900">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {log.description}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(log.status)}`}>
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Data Export Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">User Data</h4>
                      <p className="text-sm text-gray-600">Export user profiles and activity</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
                    Export Users
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Transactions</h4>
                      <p className="text-sm text-gray-600">Export payment and transaction data</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
                    Export Transactions
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Referrals</h4>
                      <p className="text-sm text-gray-600">Export referral and prospect data</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors">
                    Export Referrals
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Messages</h4>
                      <p className="text-sm text-gray-600">Export communication logs</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                    Export Messages
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Payouts</h4>
                      <p className="text-sm text-gray-600">Export payout and reward data</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">
                    Export Payouts
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Audit Logs</h4>
                      <p className="text-sm text-gray-600">Export complete audit trail</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                    Export Audit Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Audit Analytics</h3>
              <p className="text-gray-600">Analytics functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Audit Settings</h3>
              <p className="text-gray-600">Settings functionality will be implemented here...</p>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Export Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={exportDateRange.start}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={exportDateRange.end}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Types</label>
                <div className="space-y-2">
                  {['Audit Logs', 'User Data', 'Transactions', 'Referrals', 'Messages', 'Payouts'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExportData}
                disabled={loading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportModal(false)}
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

export default AuditExports;
