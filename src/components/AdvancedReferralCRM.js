import { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  Mail,
  Building,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  Target,
  DollarSign,
  Users,
  Download,
  BarChart3,
  Star,
  ArrowRight,
  Activity,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { ReferralCRMService, REFERRAL_STAGES } from '../services/ReferralCRMService';
import { Role } from '../types';

const AdvancedReferralCRM = ({ userRole, userData, userScope }) => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const referralService = useMemo(() => {
    const mockApiClient = new (class {
      constructor() {
        this.prospects = this.generateMockProspects();
        this.activities = this.generateMockActivities();
      }

      generateMockProspects() {
        return [
          {
            id: 'prospect-1',
            referrerId: 'student-1',
            referrerName: 'Mike Chen',
            referrerRole: Role.PARENT_STUDENT,
            organizationName: 'Springfield High School',
            contactName: 'John Smith',
            contactEmail: 'john@springfield.edu',
            contactPhone: '(555) 123-4567',
            stage: 'INTERESTED',
            points: 50,
            referralType: 'STUDENT_TO_ORGANIZATION',
            estimatedValue: 15000,
            probability: 75,
            createdDate: '2024-01-10',
            lastActivity: '2024-01-15',
            notes: 'Very interested in our program. Waiting for budget approval.',
            activities: [
              {
                id: 'activity-1',
                type: 'EMAIL_SENT',
                description: 'Sent program information email',
                date: '2024-01-12',
                points: 25
              },
              {
                id: 'activity-2',
                type: 'PHONE_CALL',
                description: 'Follow-up phone call',
                date: '2024-01-15',
                points: 25
              }
            ]
          },
          {
            id: 'prospect-2',
            referrerId: 'student-2',
            referrerName: 'Emma Davis',
            referrerRole: Role.PARENT_STUDENT,
            organizationName: 'Riverside Middle School',
            contactName: 'Sarah Johnson',
            contactEmail: 'sarah@riverside.edu',
            contactPhone: '(555) 234-5678',
            stage: 'QUALIFIED',
            points: 100,
            referralType: 'STUDENT_TO_ORGANIZATION',
            estimatedValue: 8000,
            probability: 60,
            createdDate: '2024-01-08',
            lastActivity: '2024-01-14',
            notes: 'Qualified lead. Needs assessment completed.',
            activities: [
              {
                id: 'activity-3',
                type: 'MEETING',
                description: 'Initial meeting completed',
                date: '2024-01-10',
                points: 50
              },
              {
                id: 'activity-4',
                type: 'PROPOSAL_SENT',
                description: 'Proposal sent',
                date: '2024-01-14',
                points: 50
              }
            ]
          },
          {
            id: 'prospect-3',
            referrerId: 'coach-1',
            referrerName: 'Coach Martinez',
            referrerRole: Role.HEAD_COACH,
            organizationName: 'Valley Sports Club',
            contactName: 'Lisa Davis',
            contactEmail: 'lisa@valleysports.com',
            contactPhone: '(555) 345-6789',
            stage: 'SIGNED',
            points: 500,
            referralType: 'COACH_TO_ORGANIZATION',
            estimatedValue: 25000,
            probability: 100,
            createdDate: '2024-01-02',
            lastActivity: '2024-01-16',
            notes: 'Contract signed. Program launched successfully.',
            activities: [
              {
                id: 'activity-5',
                type: 'CONTRACT_SIGNED',
                description: 'Contract signed and program launched',
                date: '2024-01-16',
                points: 500
              }
            ]
          },
          {
            id: 'prospect-4',
            referrerId: 'student-3',
            referrerName: 'Alex Rodriguez',
            referrerRole: Role.PARENT_STUDENT,
            organizationName: 'Metro Youth Center',
            contactName: 'Robert Wilson',
            contactEmail: 'robert@metrocenter.org',
            contactPhone: '(555) 456-7890',
            stage: 'NEGOTIATION',
            points: 300,
            referralType: 'STUDENT_TO_ORGANIZATION',
            estimatedValue: 18000,
            probability: 90,
            createdDate: '2023-12-20',
            lastActivity: '2024-01-17',
            notes: 'Finalizing contract terms. Very close to closing.',
            activities: [
              {
                id: 'activity-6',
                type: 'NEGOTIATION',
                description: 'Contract negotiation in progress',
                date: '2024-01-17',
                points: 50
              }
            ]
          },
          {
            id: 'prospect-5',
            referrerId: 'sales-1',
            referrerName: 'Sales Rep 1',
            referrerRole: Role.SALES_REP,
            organizationName: 'Oakdale Elementary',
            contactName: 'Mike Chen',
            contactEmail: 'mike.chen@oakdale.edu',
            contactPhone: '(555) 567-8901',
            stage: 'PROPOSAL_SENT',
            points: 250,
            referralType: 'SALES_REP_TO_ORGANIZATION',
            estimatedValue: 12000,
            probability: 60,
            createdDate: '2024-01-05',
            lastActivity: '2024-01-14',
            notes: 'Proposal submitted. Decision expected next week.',
            activities: [
              {
                id: 'activity-7',
                type: 'PROPOSAL_SENT',
                description: 'Proposal sent to decision makers',
                date: '2024-01-14',
                points: 100
              }
            ]
          }
        ];
      }

      generateMockActivities() {
        return [
          {
            id: 'activity-1',
            prospectId: 'prospect-1',
            type: 'EMAIL_SENT',
            description: 'Sent program information email',
            date: '2024-01-12',
            points: 25,
            userId: 'student-1'
          },
          {
            id: 'activity-2',
            prospectId: 'prospect-1',
            type: 'PHONE_CALL',
            description: 'Follow-up phone call',
            date: '2024-01-15',
            points: 25,
            userId: 'student-1'
          },
          {
            id: 'activity-3',
            prospectId: 'prospect-2',
            type: 'MEETING',
            description: 'Initial meeting completed',
            date: '2024-01-10',
            points: 50,
            userId: 'student-2'
          },
          {
            id: 'activity-4',
            prospectId: 'prospect-2',
            type: 'PROPOSAL_SENT',
            description: 'Proposal sent',
            date: '2024-01-14',
            points: 50,
            userId: 'student-2'
          },
          {
            id: 'activity-5',
            prospectId: 'prospect-3',
            type: 'CONTRACT_SIGNED',
            description: 'Contract signed and program launched',
            date: '2024-01-16',
            points: 500,
            userId: 'coach-1'
          },
          {
            id: 'activity-6',
            prospectId: 'prospect-4',
            type: 'NEGOTIATION',
            description: 'Contract negotiation in progress',
            date: '2024-01-17',
            points: 50,
            userId: 'student-3'
          },
          {
            id: 'activity-7',
            prospectId: 'prospect-5',
            type: 'PROPOSAL_SENT',
            description: 'Proposal sent to decision makers',
            date: '2024-01-14',
            points: 100,
            userId: 'sales-1'
          }
        ];
      }

      async get(url) {
        if (url.includes('/prospects')) {
          return { data: this.prospects };
        }
        
        if (url.includes('/analytics')) {
          return {
            data: {
              totalProspects: this.prospects.length,
              totalPoints: this.prospects.reduce((sum, p) => sum + p.points, 0),
              stageDistribution: {
                ADDED: this.prospects.filter(p => p.stage === 'ADDED').length,
                CONTACTED: this.prospects.filter(p => p.stage === 'CONTACTED').length,
                INTERESTED: this.prospects.filter(p => p.stage === 'INTERESTED').length,
                QUALIFIED: this.prospects.filter(p => p.stage === 'QUALIFIED').length,
                SIGNED: this.prospects.filter(p => p.stage === 'SIGNED').length,
                COMPLETED: this.prospects.filter(p => p.stage === 'COMPLETED').length
              },
              conversionRate: 0.25,
              avgTimeToClose: 45,
              topReferrers: [
                { name: 'Coach Martinez', points: 500, prospects: 1 },
                { name: 'Alex Rodriguez', points: 300, prospects: 1 },
                { name: 'Sales Rep 1', points: 250, prospects: 1 },
                { name: 'Emma Davis', points: 100, prospects: 1 },
                { name: 'Mike Chen', points: 50, prospects: 1 }
              ]
            }
          };
        }
        
        if (url.includes('/leaderboard')) {
          return {
            data: [
              { rank: 1, name: 'Coach Martinez', points: 500, prospects: 1, conversionRate: 1.0 },
              { rank: 2, name: 'Alex Rodriguez', points: 300, prospects: 1, conversionRate: 0.8 },
              { rank: 3, name: 'Sales Rep 1', points: 250, prospects: 1, conversionRate: 0.6 },
              { rank: 4, name: 'Emma Davis', points: 100, prospects: 1, conversionRate: 0.5 },
              { rank: 5, name: 'Mike Chen', points: 50, prospects: 1, conversionRate: 0.25 }
            ]
          };
        }
        
        if (url.includes('/stats')) {
          return {
            data: {
              totalProspects: this.prospects.length,
              totalPoints: this.prospects.reduce((sum, p) => sum + p.points, 0),
              activeProspects: this.prospects.filter(p => !['COMPLETED', 'NOT_INTERESTED', 'CANCELLED'].includes(p.stage)).length,
              conversionRate: 0.25,
              avgPointsPerProspect: 240
            }
          };
        }
        
        return { data: [] };
      }

      async post(url, data) {
        if (url.includes('/prospects')) {
          const prospect = {
            id: `prospect-${Date.now()}`,
            ...data,
            createdDate: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            activities: []
          };
          this.prospects.push(prospect);
          return { data: prospect };
        }
        
        if (url.includes('/activities')) {
          const activity = {
            id: `activity-${Date.now()}`,
            ...data
          };
          this.activities.push(activity);
          return { data: activity };
        }
        
        return { data: { success: true } };
      }

      async put(url, data) {
        if (url.includes('/stage')) {
          const prospectId = url.split('/')[4];
          const prospect = this.prospects.find(p => p.id === prospectId);
          if (prospect) {
            prospect.stage = data.stage;
            prospect.lastActivity = new Date().toISOString().split('T')[0];
          }
          return { data: { success: true } };
        }
        
        return { data: { success: true } };
      }
    })();
    
    return new ReferralCRMService(mockApiClient);
  }, []);

  const [prospects, setProspects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesSearch = prospect.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = !stageFilter || prospect.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [prospects, searchTerm, stageFilter]);

  const pipelineStats = useMemo(() => {
    const totalProspects = prospects.length;
    const totalPoints = prospects.reduce((sum, p) => sum + p.points, 0);
    const activeProspects = prospects.filter(p => !['COMPLETED', 'NOT_INTERESTED', 'CANCELLED'].includes(p.stage)).length;
    const avgPointsPerProspect = totalProspects > 0 ? totalPoints / totalProspects : 0;

    return {
      totalProspects,
      totalPoints,
      activeProspects,
      avgPointsPerProspect
    };
  }, [prospects]);

  useEffect(() => {
    loadProspects();
    loadAnalytics();
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProspects = async () => {
    try {
      const data = await referralService.getProspects(userData?.id, userRole);
      setProspects(data);
    } catch (error) {
      // Error loading prospects
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await referralService.getReferralAnalytics(userData?.id, userRole, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });
      setAnalytics(data);
    } catch (error) {
      // Error loading analytics
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await referralService.getReferralLeaderboard('program', 'program-1');
      setLeaderboard(data);
    } catch (error) {
      // Error loading leaderboard
    }
  };

  const getStageColor = (stage) => {
    const stageData = REFERRAL_STAGES[stage];
    return stageData ? stageData.color : 'gray';
  };

  const getStageIcon = (stage) => {
    const stageData = REFERRAL_STAGES[stage];
    return stageData ? stageData.icon : '❓';
  };

  const getStageName = (stage) => {
    const stageData = REFERRAL_STAGES[stage];
    return stageData ? stageData.name : stage;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddActivity = async (prospectId, activityData) => {
    try {
      await referralService.addProspectActivity(prospectId, activityData);
      await loadProspects();
    } catch (error) {
      alert('Error adding activity');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Advanced Referral CRM</h1>
              <p className="text-lg text-gray-600 mt-1">Complete prospect management and points engine</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
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
              { id: 'pipeline', label: 'Pipeline', icon: Target },
              { id: 'prospects', label: 'Prospects', icon: Users },
              { id: 'activities', label: 'Activities', icon: Activity },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'stages', label: 'Stages', icon: ArrowRight }
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
        {activeTab === 'pipeline' && (
          <div className="space-y-8">
            {/* Pipeline Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl shadow-emerald-500/50 p-6 border-2 border-emerald-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Prospects</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{pipelineStats.totalProspects}</p>
                  </div>
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Total Points</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{pipelineStats.totalPoints}</p>
                  </div>
                  <Star className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Active Prospects</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{pipelineStats.activeProspects}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Avg Points</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">{Math.round(pipelineStats.avgPointsPerProspect)}</p>
                  </div>
                  <Target className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Pipeline Stages</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.values(REFERRAL_STAGES).map(stage => {
                  const count = prospects.filter(p => p.stage === stage.id).length;
                  return (
                    <div key={stage.id} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl mb-2">{stage.icon}</div>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">{stage.name}</p>
                      <p className="text-xs text-gray-500">{stage.points} pts</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prospects' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search prospects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Stages</option>
                    {Object.values(REFERRAL_STAGES).map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prospect
                  </button>
                </div>
              </div>
            </div>

            {/* Prospects List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                {filteredProspects.map((prospect) => (
                  <div key={prospect.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {getStageIcon(prospect.stage)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{prospect.organizationName}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getStageColor(prospect.stage)}-100 text-${getStageColor(prospect.stage)}-800`}>
                              {getStageName(prospect.stage)}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                              {prospect.points} pts
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {prospect.contactName}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {prospect.contactEmail}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {prospect.contactPhone}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(prospect.estimatedValue)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{prospect.notes}</p>
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
                        <button
                          onClick={() => handleAddActivity(prospect.id, {
                            type: 'NOTE',
                            description: 'Quick note added',
                            points: 0
                          })}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {prospects.flatMap(prospect => 
                  prospect.activities.map(activity => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            {activity.type === 'EMAIL_SENT' ? '📧' :
                             activity.type === 'PHONE_CALL' ? '📞' :
                             activity.type === 'MEETING' ? '🤝' :
                             activity.type === 'PROPOSAL_SENT' ? '📄' :
                             activity.type === 'CONTRACT_SIGNED' ? '✍️' :
                             activity.type === 'NEGOTIATION' ? '🤝' : '📝'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{activity.description}</div>
                            <div className="text-sm text-gray-600">{prospect.organizationName} • {prospect.referrerName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{activity.date}</div>
                          <div className="text-xs text-purple-600">{activity.points} pts</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Referral Leaderboard</h3>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{entry.name}</h4>
                          <div className="text-sm text-gray-600">{entry.prospects} prospects • {Math.round(entry.conversionRate * 100)}% conversion</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{entry.points}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Stage Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(REFERRAL_STAGES).map(stage => (
                  <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{stage.icon}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{stage.name}</h4>
                        <div className="text-sm text-gray-600">{stage.points} points</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                    {stage.nextStages.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Next: {stage.nextStages.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Referral Analytics</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-3xl font-bold">{analytics.totalProspects}</div>
                <div className="text-sm opacity-90">Total Prospects</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-3xl font-bold">{analytics.totalPoints}</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-3xl font-bold">{Math.round(analytics.conversionRate * 100)}%</div>
                <div className="text-sm opacity-90">Conversion Rate</div>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-3xl font-bold">{analytics.avgTimeToClose}</div>
                <div className="text-sm opacity-90">Avg Days to Close</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Stage Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.stageDistribution).map(([stage, count]) => (
                    <div key={stage} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getStageName(stage)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Top Referrers</h4>
                <div className="space-y-2">
                  {analytics.topReferrers.map((referrer, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{referrer.name}</span>
                      <span className="font-semibold">{referrer.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReferralCRM;
