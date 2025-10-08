import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Gift,
  Award,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Edit,
  Eye,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Trophy,
  Target,
  FileText,
  Download,
  Filter,
  Search,
  CreditCard,
  Banknote,
  Coins,
  Sparkles,
  Crown,
  Medal,
  Zap,
  Heart,
  Package
} from 'lucide-react';
import { Role } from '../types';

const PayoutsRewards = ({ userRole, userData, userScope }) => {
  const [activeTab, setActiveTab] = useState('payouts');
  const [loading, setLoading] = useState(false);
  const [showAddPayout, setShowAddPayout] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  // Mock data for payouts
  const mockPayouts = useMemo(() => [
    {
      id: 'payout-1',
      recipientId: 'athlete-1',
      recipientName: 'Mike Chen',
      recipientEmail: 'mike@email.com',
      recipientRole: Role.PARENT_STUDENT,
      amount: 150.00,
      type: 'PERFORMANCE_BONUS',
      status: 'PENDING',
      reason: 'Top 10% performer - Q1 2024',
      programId: 'program-1',
      programName: 'Spring Soccer 2024',
      teamId: 'team-1',
      teamName: 'Lightning',
      createdDate: '2024-01-15',
      processedDate: null,
      paymentMethod: 'PAYPAL',
      transactionId: null,
      notes: 'Outstanding fundraising performance'
    },
    {
      id: 'payout-2',
      recipientId: 'athlete-2',
      recipientName: 'Emma Davis',
      recipientEmail: 'emma@email.com',
      recipientRole: Role.PARENT_STUDENT,
      amount: 100.00,
      type: 'GOAL_ACHIEVEMENT',
      status: 'COMPLETED',
      reason: 'Reached 100% of fundraising goal',
      programId: 'program-1',
      programName: 'Spring Soccer 2024',
      teamId: 'team-1',
      teamName: 'Lightning',
      createdDate: '2024-01-10',
      processedDate: '2024-01-12',
      paymentMethod: 'PAYPAL',
      transactionId: 'TXN-123456789',
      notes: 'Goal achieved ahead of schedule'
    },
    {
      id: 'payout-3',
      recipientId: 'coach-1',
      recipientName: 'Coach Martinez',
      recipientEmail: 'coach@email.com',
      recipientRole: Role.HEAD_COACH,
      amount: 500.00,
      type: 'TEAM_PERFORMANCE',
      status: 'COMPLETED',
      reason: 'Team exceeded fundraising goal by 25%',
      programId: 'program-1',
      programName: 'Spring Soccer 2024',
      teamId: 'team-2',
      teamName: 'Thunder',
      createdDate: '2024-01-08',
      processedDate: '2024-01-10',
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'TXN-987654321',
      notes: 'Exceptional team leadership'
    },
    {
      id: 'payout-4',
      recipientId: 'sales-1',
      recipientName: 'Sales Rep 1',
      recipientEmail: 'sales1@email.com',
      recipientRole: Role.SALES_REP,
      amount: 750.00,
      type: 'COMMISSION',
      status: 'PENDING',
      reason: 'Q1 2024 commission - 3 new accounts',
      programId: null,
      programName: null,
      teamId: null,
      teamName: null,
      createdDate: '2024-01-20',
      processedDate: null,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: null,
      notes: 'New account acquisitions'
    }
  ], []);

  // Mock data for rewards
  const mockRewards = useMemo(() => [
    {
      id: 'reward-1',
      name: 'Top Performer Badge',
      description: 'Awarded to athletes in top 10% of fundraising performance',
      type: 'DIGITAL_BADGE',
      value: 0,
      cost: 0,
      criteria: {
        type: 'PERFORMANCE_RANK',
        threshold: 0.1,
        period: 'QUARTERLY'
      },
      icon: '🏆',
      color: 'gold',
      status: 'ACTIVE',
      createdDate: '2024-01-01',
      awardedCount: 25
    },
    {
      id: 'reward-2',
      name: 'Goal Achiever Certificate',
      description: 'Digital certificate for reaching 100% of fundraising goal',
      type: 'DIGITAL_CERTIFICATE',
      value: 0,
      cost: 0,
      criteria: {
        type: 'GOAL_ACHIEVEMENT',
        threshold: 1.0,
        period: 'CAMPAIGN'
      },
      icon: '📜',
      color: 'blue',
      status: 'ACTIVE',
      createdDate: '2024-01-01',
      awardedCount: 45
    },
    {
      id: 'reward-3',
      name: 'Team Spirit Award',
      description: 'Special recognition for team collaboration and support',
      type: 'RECOGNITION',
      value: 0,
      cost: 0,
      criteria: {
        type: 'TEAM_COLLABORATION',
        threshold: 0.8,
        period: 'MONTHLY'
      },
      icon: '🤝',
      color: 'green',
      status: 'ACTIVE',
      createdDate: '2024-01-01',
      awardedCount: 12
    },
    {
      id: 'reward-4',
      name: 'Gift Card - $25',
      description: 'Amazon gift card for exceptional performance',
      type: 'GIFT_CARD',
      value: 25.00,
      cost: 25.00,
      criteria: {
        type: 'PERFORMANCE_RANK',
        threshold: 0.05,
        period: 'MONTHLY'
      },
      icon: '🎁',
      color: 'purple',
      status: 'ACTIVE',
      createdDate: '2024-01-01',
      awardedCount: 8
    },
    {
      id: 'reward-5',
      name: 'Custom Jersey',
      description: 'Personalized team jersey with name and number',
      type: 'PHYSICAL_ITEM',
      value: 50.00,
      cost: 35.00,
      criteria: {
        type: 'GOAL_ACHIEVEMENT',
        threshold: 1.2,
        period: 'CAMPAIGN'
      },
      icon: '👕',
      color: 'red',
      status: 'ACTIVE',
      createdDate: '2024-01-01',
      awardedCount: 15
    }
  ], []);

  const [payouts, setPayouts] = useState(mockPayouts);
  const [rewards, setRewards] = useState(mockRewards);

  const payoutStats = useMemo(() => {
    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payouts.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = payouts.filter(p => p.status === 'PENDING').length;

    return {
      totalPayouts,
      totalAmount,
      pendingAmount,
      completedAmount,
      pendingCount
    };
  }, [payouts]);

  const rewardStats = useMemo(() => {
    const totalRewards = rewards.length;
    const activeRewards = rewards.filter(r => r.status === 'ACTIVE').length;
    const totalAwarded = rewards.reduce((sum, r) => sum + r.awardedCount, 0);
    const totalCost = rewards.reduce((sum, r) => sum + (r.cost * r.awardedCount), 0);

    return {
      totalRewards,
      activeRewards,
      totalAwarded,
      totalCost
    };
  }, [rewards]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPayoutTypeIcon = (type) => {
    switch (type) {
      case 'PERFORMANCE_BONUS': return <Trophy className="w-4 h-4" />;
      case 'GOAL_ACHIEVEMENT': return <Target className="w-4 h-4" />;
      case 'TEAM_PERFORMANCE': return <Users className="w-4 h-4" />;
      case 'COMMISSION': return <TrendingUp className="w-4 h-4" />;
      case 'REFERRAL_BONUS': return <Users className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getRewardTypeIcon = (type) => {
    switch (type) {
      case 'DIGITAL_BADGE': return <Award className="w-4 h-4" />;
      case 'DIGITAL_CERTIFICATE': return <FileText className="w-4 h-4" />;
      case 'RECOGNITION': return <Star className="w-4 h-4" />;
      case 'GIFT_CARD': return <Gift className="w-4 h-4" />;
      case 'PHYSICAL_ITEM': return <Package className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleProcessPayout = async (payoutId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPayouts(prev => prev.map(payout => 
        payout.id === payoutId 
          ? { 
              ...payout, 
              status: 'COMPLETED', 
              processedDate: new Date().toISOString().split('T')[0],
              transactionId: `TXN-${Date.now()}`
            }
          : payout
      ));
      
      alert('Payout processed successfully!');
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Error processing payout');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayout = async (payoutId) => {
    if (window.confirm('Are you sure you want to cancel this payout?')) {
      setPayouts(prev => prev.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'CANCELLED' }
          : payout
      ));
    }
  };

  const handleToggleReward = async (rewardId) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, status: reward.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : reward
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Payouts & Rewards</h1>
              <p className="text-lg text-gray-600 mt-1">Manage payments and recognition programs</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
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
              { id: 'payouts', label: 'Payouts', icon: DollarSign },
              { id: 'rewards', label: 'Rewards', icon: Gift },
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
        {activeTab === 'payouts' && (
          <div className="space-y-8">
            {/* Payout Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl shadow-emerald-500/50 p-6 border-2 border-emerald-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Payouts</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{payoutStats.totalPayouts}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Amount</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(payoutStats.totalAmount)}
                    </p>
                  </div>
                  <Banknote className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl shadow-2xl shadow-yellow-500/50 p-6 border-2 border-yellow-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Pending</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(payoutStats.pendingAmount)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Completed</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(payoutStats.completedAmount)}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Payouts List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Payouts Management</h3>
                <button
                  onClick={() => setShowAddPayout(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Payout
                </button>
              </div>

              <div className="space-y-4">
                {payouts.map(payout => (
                  <div key={payout.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                          {getPayoutTypeIcon(payout.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{payout.recipientName}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(payout.status)}`}>
                              {getStatusIcon(payout.status)}
                              {payout.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(payout.amount)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {payout.createdDate}
                            </div>
                            {payout.programName && (
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                {payout.programName}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {payout.paymentMethod}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{payout.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payout.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleProcessPayout(payout.id)}
                              disabled={loading}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => handleCancelPayout(payout.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-8">
            {/* Reward Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl shadow-emerald-500/50 p-6 border-2 border-emerald-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Rewards</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{rewardStats.totalRewards}</p>
                  </div>
                  <Gift className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Active Rewards</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{rewardStats.activeRewards}</p>
                  </div>
                  <Award className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Awarded</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{rewardStats.totalAwarded}</p>
                  </div>
                  <Star className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Cost</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(rewardStats.totalCost)}
                    </p>
                  </div>
                  <Coins className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Rewards List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Rewards Management</h3>
                <button
                  onClick={() => setShowAddReward(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Reward
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map(reward => (
                  <div key={reward.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{reward.icon}</div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{reward.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(reward.status)}`}>
                              {reward.status}
                            </span>
                            <span className="text-sm text-gray-600">{reward.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleReward(reward.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                          reward.status === 'ACTIVE' 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {reward.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Awarded:</span>
                        <span className="font-semibold">{reward.awardedCount} times</span>
                      </div>
                      {reward.value > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Value:</span>
                          <span className="font-semibold">{formatCurrency(reward.value)}</span>
                        </div>
                      )}
                      {reward.cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-semibold">{formatCurrency(reward.cost)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Criteria: {reward.criteria.type.replace('_', ' ')} • {reward.criteria.period.toLowerCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payouts & Rewards Analytics</h3>
              <p className="text-gray-600">Analytics functionality will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payouts & Rewards Settings</h3>
              <p className="text-gray-600">Settings functionality will be implemented here...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Payout Modal */}
      {showAddPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Payout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name *</label>
                <input
                  type="text"
                  placeholder="Enter recipient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payout Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="PERFORMANCE_BONUS">Performance Bonus</option>
                  <option value="GOAL_ACHIEVEMENT">Goal Achievement</option>
                  <option value="TEAM_PERFORMANCE">Team Performance</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="REFERRAL_BONUS">Referral Bonus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="PAYPAL">PayPal</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                rows={3}
                placeholder="Enter payout reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPayout(false)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Payout
              </button>
              <button
                onClick={() => setShowAddPayout(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      {showAddReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Reward</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reward Name *</label>
                <input
                  type="text"
                  placeholder="Enter reward name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option value="DIGITAL_BADGE">Digital Badge</option>
                  <option value="DIGITAL_CERTIFICATE">Digital Certificate</option>
                  <option value="RECOGNITION">Recognition</option>
                  <option value="GIFT_CARD">Gift Card</option>
                  <option value="PHYSICAL_ITEM">Physical Item</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                placeholder="Enter reward description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddReward(false)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Reward
              </button>
              <button
                onClick={() => setShowAddReward(false)}
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

export default PayoutsRewards;
