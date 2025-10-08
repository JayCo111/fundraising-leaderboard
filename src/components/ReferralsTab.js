// src/components/ReferralsTab.js
import { useState } from 'react';
import { UserPlus, Phone, Mail, CheckCircle, Clock, Star, Target } from 'lucide-react';

const ReferralsTab = ({ currentStudent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProspect, setNewProspect] = useState({
    org_name: '',
    contact_name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock referral data - in real app this would come from API
  const [prospects, setProspects] = useState([
    {
      id: 1,
      org_name: 'Westside Soccer Club',
      contact_name: 'Coach Johnson',
      email: 'coach@westside.com',
      phone: '(555) 123-4567',
      stage: 'ADDED',
      points: 10,
      created_at: '2024-01-15',
      notes: 'Interested in pizza card fundraiser'
    },
    {
      id: 2,
      org_name: 'Central High School',
      contact_name: 'Principal Smith',
      email: 'principal@central.edu',
      phone: '(555) 987-6543',
      stage: 'SIGNED',
      points: 50,
      created_at: '2024-01-10',
      notes: 'Signed up for spring campaign'
    }
  ]);

  const stageConfig = {
    ADDED: { label: 'Added', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
    SIGNED: { label: 'Signed', color: 'bg-yellow-100 text-yellow-700', icon: CheckCircle },
    STARTED: { label: 'Started', color: 'bg-orange-100 text-orange-700', icon: Clock },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: Star }
  };

  const handleAddProspect = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In real app, this would call the API
      const newProspectData = {
        id: Date.now(),
        ...newProspect,
        stage: 'ADDED',
        points: 10,
        created_at: new Date().toISOString().split('T')[0]
      };
      
      setProspects(prev => [newProspectData, ...prev]);
      setNewProspect({
        org_name: '',
        contact_name: '',
        email: '',
        phone: '',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      // Error handled silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStage = async (prospectId, newStage) => {
    const stagePoints = {
      ADDED: 10,
      SIGNED: 50,
      STARTED: 100,
      COMPLETED: 200
    };

    setProspects(prev => prev.map(prospect => 
      prospect.id === prospectId 
        ? { ...prospect, stage: newStage, points: stagePoints[newStage] }
        : prospect
    ));
  };

  const totalPoints = prospects.reduce((sum, prospect) => sum + prospect.points, 0);

  return (
    <div className="space-y-6">
      {/* Referral Overview */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
            <p className="text-emerald-100">Earn points for bringing in new organizations</p>
          </div>
          <Target className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg p-4 text-white">
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-sm text-emerald-100">Total Points</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg p-4 text-white">
          <div className="text-2xl font-bold">{prospects.length}</div>
          <div className="text-sm text-blue-100">Total Prospects</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {prospects.filter(p => p.stage === 'COMPLETED').length}
          </div>
          <div className="text-sm text-purple-100">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {prospects.filter(p => p.stage === 'SIGNED').length}
          </div>
          <div className="text-sm text-orange-100">Active</div>
        </div>
      </div>

      {/* Add New Prospect */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add New Prospect</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Prospect'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProspect} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={newProspect.org_name}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, org_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Westside Soccer Club"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={newProspect.contact_name}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Coach Johnson"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newProspect.email}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="contact@organization.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newProspect.phone}
                  onChange={(e) => setNewProspect(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={newProspect.notes}
                onChange={(e) => setNewProspect(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Additional information about this prospect..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Adding...' : 'Add Prospect'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Prospects List */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Prospects</h3>
        <div className="space-y-4">
          {prospects.map((prospect) => {
            const stageInfo = stageConfig[prospect.stage];
            const IconComponent = stageInfo.icon;
            
            return (
              <div key={prospect.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${stageInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      {stageInfo.label}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{prospect.org_name}</div>
                      <div className="text-sm text-gray-600">
                        {prospect.contact_name && `${prospect.contact_name} • `}
                        Added {prospect.created_at}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{prospect.points} pts</div>
                    <div className="text-sm text-gray-600">Earned</div>
                  </div>
                </div>
                
                {(prospect.email || prospect.phone) && (
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    {prospect.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {prospect.email}
                      </div>
                    )}
                    {prospect.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {prospect.phone}
                      </div>
                    )}
                  </div>
                )}
                
                {prospect.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">{prospect.notes}</div>
                  </div>
                )}

                {/* Stage Advancement Buttons */}
                <div className="mt-4 flex space-x-2">
                  {prospect.stage === 'ADDED' && (
                    <button
                      onClick={() => handleAdvanceStage(prospect.id, 'SIGNED')}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Mark as Signed (+40 pts)
                    </button>
                  )}
                  {prospect.stage === 'SIGNED' && (
                    <button
                      onClick={() => handleAdvanceStage(prospect.id, 'STARTED')}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Mark as Started (+50 pts)
                    </button>
                  )}
                  {prospect.stage === 'STARTED' && (
                    <button
                      onClick={() => handleAdvanceStage(prospect.id, 'COMPLETED')}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Mark as Completed (+100 pts)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Guide */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Points System</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">10</div>
            <div className="text-sm text-gray-600">Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">50</div>
            <div className="text-sm text-gray-600">Signed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">100</div>
            <div className="text-sm text-gray-600">Started</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">200</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsTab;
