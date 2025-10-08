import { useState, useMemo } from 'react';
import {
  Phone,
  Mail,
  Building,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import MessagingCenter from './MessagingCenter';
import AdvancedReferralCRM from './AdvancedReferralCRM';

const SalesRepCRM = ({ userData, territoryData }) => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddProspect, setShowAddProspect] = useState(false);

  // Mock prospect data
  const mockProspects = useMemo(() => [
    {
      id: 'prospect-1',
      name: 'Springfield High School',
      contact: 'John Smith',
      email: 'john.smith@springfield.edu',
      phone: '(555) 123-4567',
      status: 'INTERESTED',
      stage: 'Proposal Sent',
      value: 15000,
      probability: 75,
      lastContact: '2024-01-15',
      notes: 'Very interested in our program. Waiting for budget approval.',
      territory: 'Northern CA',
      createdAt: '2024-01-10'
    },
    {
      id: 'prospect-2',
      name: 'Riverside Middle School',
      contact: 'Sarah Johnson',
      email: 'sarah.j@riverside.edu',
      phone: '(555) 234-5678',
      status: 'CONTACTED',
      stage: 'Initial Contact',
      value: 8000,
      probability: 40,
      lastContact: '2024-01-12',
      notes: 'Initial meeting went well. Follow up scheduled.',
      territory: 'Northern CA',
      createdAt: '2024-01-08'
    },
    {
      id: 'prospect-3',
      name: 'Oakdale Elementary',
      contact: 'Mike Chen',
      email: 'mike.chen@oakdale.edu',
      phone: '(555) 345-6789',
      status: 'QUALIFIED',
      stage: 'Needs Analysis',
      value: 12000,
      probability: 60,
      lastContact: '2024-01-14',
      notes: 'Qualified lead. Needs assessment completed.',
      territory: 'Northern CA',
      createdAt: '2024-01-05'
    },
    {
      id: 'prospect-4',
      name: 'Valley Sports Club',
      contact: 'Lisa Davis',
      email: 'lisa@valleysports.com',
      phone: '(555) 456-7890',
      status: 'PROPOSAL',
      stage: 'Proposal Review',
      value: 25000,
      probability: 85,
      lastContact: '2024-01-16',
      notes: 'Proposal submitted. Decision expected next week.',
      territory: 'Northern CA',
      createdAt: '2024-01-02'
    },
    {
      id: 'prospect-5',
      name: 'Metro Youth Center',
      contact: 'Robert Wilson',
      email: 'robert@metrocenter.org',
      phone: '(555) 567-8901',
      status: 'NEGOTIATION',
      stage: 'Contract Negotiation',
      value: 18000,
      probability: 90,
      lastContact: '2024-01-17',
      notes: 'Finalizing contract terms. Very close to closing.',
      territory: 'Northern CA',
      createdAt: '2023-12-20'
    }
  ], []);

  const [prospects, setProspects] = useState(mockProspects);
  const [newProspect, setNewProspect] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    status: 'CONTACTED',
    stage: 'Initial Contact',
    value: 0,
    probability: 25,
    notes: '',
    territory: territoryData?.name || 'Northern CA'
  });

  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || prospect.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [prospects, searchTerm, statusFilter]);

  const pipelineStats = useMemo(() => {
    const totalValue = prospects.reduce((sum, p) => sum + p.value, 0);
    const weightedValue = prospects.reduce((sum, p) => sum + (p.value * p.probability / 100), 0);
    const avgDealSize = totalValue / prospects.length || 0;
    const conversionRate = (prospects.filter(p => p.status === 'CLOSED').length / prospects.length) * 100 || 0;

    return {
      totalProspects: prospects.length,
      totalValue,
      weightedValue,
      avgDealSize,
      conversionRate,
      byStatus: {
        CONTACTED: prospects.filter(p => p.status === 'CONTACTED').length,
        INTERESTED: prospects.filter(p => p.status === 'INTERESTED').length,
        QUALIFIED: prospects.filter(p => p.status === 'QUALIFIED').length,
        PROPOSAL: prospects.filter(p => p.status === 'PROPOSAL').length,
        NEGOTIATION: prospects.filter(p => p.status === 'NEGOTIATION').length,
        CLOSED: prospects.filter(p => p.status === 'CLOSED').length
      }
    };
  }, [prospects]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONTACTED': return 'bg-gray-100 text-gray-800';
      case 'INTERESTED': return 'bg-blue-100 text-blue-800';
      case 'QUALIFIED': return 'bg-yellow-100 text-yellow-800';
      case 'PROPOSAL': return 'bg-purple-100 text-purple-800';
      case 'NEGOTIATION': return 'bg-orange-100 text-orange-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONTACTED': return <Clock className="w-4 h-4" />;
      case 'INTERESTED': return <Eye className="w-4 h-4" />;
      case 'QUALIFIED': return <Target className="w-4 h-4" />;
      case 'PROPOSAL': return <FileText className="w-4 h-4" />;
      case 'NEGOTIATION': return <TrendingUp className="w-4 h-4" />;
      case 'CLOSED': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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

  const handleAddProspect = () => {
    if (!newProspect.name || !newProspect.contact || !newProspect.email) {
      alert('Please fill in all required fields');
      return;
    }

    const prospect = {
      ...newProspect,
      id: `prospect-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0]
    };

    setProspects(prev => [...prev, prospect]);
    setNewProspect({
      name: '',
      contact: '',
      email: '',
      phone: '',
      status: 'CONTACTED',
      stage: 'Initial Contact',
      value: 0,
      probability: 25,
      notes: '',
      territory: territoryData?.name || 'Northern CA'
    });
    setShowAddProspect(false);
  };

  const handleDeleteProspect = (prospectId) => {
    if (window.confirm('Are you sure you want to delete this prospect?')) {
      setProspects(prev => prev.filter(p => p.id !== prospectId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Sales CRM</h1>
              <p className="text-lg text-gray-600 mt-1">Territory: {territoryData?.name || 'Northern CA'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddProspect(true)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Prospect
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
              { id: 'referrals', label: 'Referral CRM', icon: Users },
              { id: 'messaging', label: 'Messaging', icon: MessageSquare },
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
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Pipeline Value</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(pipelineStats.totalValue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Weighted Value</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(pipelineStats.weightedValue)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 p-6 border-2 border-orange-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white mb-2 drop-shadow">Avg Deal Size</p>
                    <p className="text-3xl font-black text-white drop-shadow-lg">
                      {formatCurrency(pipelineStats.avgDealSize)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Pipeline by Stage</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(pipelineStats.byStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</p>
                  </div>
                ))}
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-sm text-gray-600">
                    {filteredProspects.length} of {prospects.length} prospects
                  </span>
                </div>
              </div>
            </div>

            {/* Prospects List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                {filteredProspects.map((prospect) => (
                  <div key={prospect.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{prospect.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(prospect.status)}`}>
                            {getStatusIcon(prospect.status)}
                            {prospect.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {prospect.contact}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {prospect.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {prospect.phone}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{prospect.notes}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(prospect.value)}</div>
                        <div className="text-sm text-gray-600">{prospect.probability}% probability</div>
                        <div className="text-xs text-gray-500 mt-1">Last contact: {prospect.lastContact}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProspect(prospect.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <AdvancedReferralCRM 
            userRole="SALES_REP" 
            userData={userData} 
            userScope={{ territory: territoryData?.name }} 
          />
        )}

        {activeTab === 'messaging' && (
          <MessagingCenter 
            userRole="SALES_REP" 
            userData={userData} 
            userScope={{ territory: territoryData?.name }} 
          />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reports & Analytics</h3>
              <p className="text-gray-600">Reporting functionality will be implemented here...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Prospect Modal */}
      {showAddProspect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Prospect</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={newProspect.name}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  value={newProspect.contact}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newProspect.email}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newProspect.phone}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal Value</label>
                <input
                  type="number"
                  value={newProspect.value}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProspect.probability}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={newProspect.notes}
                onChange={(e) => setNewProspect(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProspect}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Add Prospect
              </button>
              <button
                onClick={() => setShowAddProspect(false)}
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

export default SalesRepCRM;
