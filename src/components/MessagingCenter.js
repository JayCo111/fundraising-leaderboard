import { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Mail,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  Search,
  BarChart3,
  Phone,
  User,
  Building,
  UserPlus,
  Target,
  TrendingUp,
  FileText
} from 'lucide-react';
import { MessageService, MESSAGE_TYPES, MESSAGE_TEMPLATES, MESSAGING_PERMISSIONS } from '../services/MessageService';
import { Role } from '../types';

const MessagingCenter = ({ userRole, userData, userScope }) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.EMAIL);
  const [scheduledFor, setScheduledFor] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const messageService = useMemo(() => {
    const mockApiClient = new (class {
      constructor() {
        this.messages = [];
        this.recipients = this.generateMockRecipients();
      }

      generateMockRecipients() {
        const baseRecipients = [
          // Sales Rep prospects
          { id: 'prospect-1', role: 'PROSPECT', name: 'John Smith', email: 'john@springfield.edu', phone: '(555) 123-4567', organization: 'Springfield High School', type: 'prospect' },
          { id: 'prospect-2', role: 'PROSPECT', name: 'Sarah Johnson', email: 'sarah@riverside.edu', phone: '(555) 234-5678', organization: 'Riverside Middle School', type: 'prospect' },
          
          // Team members
          { id: 'athlete-1', role: Role.PARENT_STUDENT, name: 'Mike Chen', email: 'mike@email.com', phone: '(555) 345-6789', team: 'Lightning', type: 'athlete' },
          { id: 'athlete-2', role: Role.PARENT_STUDENT, name: 'Emma Davis', email: 'emma@email.com', phone: '(555) 456-7890', team: 'Lightning', type: 'athlete' },
          { id: 'athlete-3', role: Role.PARENT_STUDENT, name: 'Alex Rodriguez', email: 'alex@email.com', phone: '(555) 567-8901', team: 'Thunder', type: 'athlete' },
          
          // Coaches
          { id: 'coach-1', role: Role.HEAD_COACH, name: 'Coach Martinez', email: 'coach@email.com', phone: '(555) 678-9012', team: 'Thunder', type: 'coach' },
          { id: 'coach-2', role: Role.HEAD_COACH, name: 'Coach Wilson', email: 'coach2@email.com', phone: '(555) 789-0123', team: 'Storm', type: 'coach' },
          
          // Directors
          { id: 'director-1', role: Role.PROGRAM_DIRECTOR, name: 'Program Director', email: 'director@email.com', phone: '(555) 890-1234', program: 'Spring Soccer 2024', type: 'director' },
          { id: 'director-2', role: Role.ORG_OWNER, name: 'Org Owner', email: 'owner@email.com', phone: '(555) 901-2345', organization: 'Springfield Youth Sports', type: 'director' },
          
          // Sales Reps
          { id: 'sales-1', role: Role.SALES_REP, name: 'Sales Rep 1', email: 'sales1@email.com', phone: '(555) 012-3456', territory: 'Northern CA', type: 'sales' },
          { id: 'sales-2', role: Role.SALES_REP, name: 'Sales Rep 2', email: 'sales2@email.com', phone: '(555) 123-4567', territory: 'Southern CA', type: 'sales' }
        ];

        // Filter recipients based on user role and scope
        return baseRecipients.filter(recipient => {
          const permissions = MESSAGING_PERMISSIONS[userRole];
          if (!permissions) return false;

          // Check if user can send to this recipient's role
          return permissions.canSendToRoles.includes(recipient.role) || 
                 (permissions.canSend1on1 && recipient.role === Role.PARENT_STUDENT);
        });
      }

      async post(url, data) {
        if (url.includes('/messages')) {
          const message = {
            id: `msg-${Date.now()}`,
            ...data,
            status: 'sent',
            sent_at: new Date().toISOString(),
            delivered_count: data.recipients.length,
            opened_count: Math.floor(data.recipients.length * 0.8),
            clicked_count: Math.floor(data.recipients.length * 0.3)
          };
          this.messages.push(message);
          return { data: message };
        }
        
        return { data: { success: true } };
      }

      async get(url) {
        if (url.includes('/recipients')) {
          return { data: this.recipients };
        }
        
        if (url.includes('/history')) {
          return { data: this.messages.slice(-20) };
        }
        
        if (url.includes('/analytics')) {
          return {
            data: {
              total_sent: this.messages.length,
              total_delivered: this.messages.length,
              total_opened: Math.floor(this.messages.length * 0.8),
              total_clicked: Math.floor(this.messages.length * 0.3),
              open_rate: 0.8,
              click_rate: 0.3,
              messages_by_type: {
                email: Math.floor(this.messages.length * 0.7),
                sms: Math.floor(this.messages.length * 0.3)
              }
            }
          };
        }
        
        return { data: [] };
      }

      async delete(url) {
        return { data: { success: true } };
      }
    })();
    
    return new MessageService(mockApiClient);
  }, [userRole]);

  const availableTemplates = useMemo(() => {
    return messageService.getAvailableTemplates(userRole);
  }, [messageService, userRole]);

  const filteredRecipients = useMemo(() => {
    return recipients.filter(recipient => {
      const matchesSearch = recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipient.organization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || recipient.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [recipients, searchTerm, roleFilter]);

  useEffect(() => {
    loadRecipients();
    loadMessageHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecipients = async () => {
    try {
      const data = await messageService.getRecipients(userRole, userScope);
      setRecipients(data);
    } catch (error) {
      // Error loading recipients
    }
  };

  const loadMessageHistory = async () => {
    try {
      const data = await messageService.getMessageHistory(userData?.id);
      setMessageHistory(data);
    } catch (error) {
      // Error loading message history
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await messageService.getMessageAnalytics(userData?.id, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });
      setAnalytics(data);
    } catch (error) {
      // Error loading analytics
    }
  };

  const handleSendMessage = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    if (!selectedTemplate && !customMessage.trim()) {
      alert('Please select a template or enter a custom message');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        senderId: userData?.id,
        senderRole: userRole,
        recipients: selectedRecipients,
        templateId: selectedTemplate,
        customMessage,
        messageType,
        scheduledFor: scheduledFor || null
      };

      await messageService.sendMessage(messageData);
      
      // Reset form
      setSelectedRecipients([]);
      setCustomMessage('');
      setSelectedTemplate('');
      setScheduledFor('');
      
      // Reload history
      await loadMessageHistory();

      alert('Message sent successfully!');
    } catch (error) {
      alert(`Error sending message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientToggle = (recipient) => {
    setSelectedRecipients(prev => {
      const isSelected = prev.some(r => r.id === recipient.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipient.id);
      } else {
        return [...prev, recipient];
      }
    });
  };

  const getTemplatePreview = (templateId) => {
    const template = MESSAGE_TEMPLATES[templateId];
    if (!template) return '';
    
    // Replace placeholders with sample data
    return template.template
      .replace(/\{\{contactName\}\}/g, 'John Smith')
      .replace(/\{\{organizationName\}\}/g, 'Springfield High School')
      .replace(/\{\{senderName\}\}/g, userData?.name || 'You')
      .replace(/\{\{athleteName\}\}/g, 'Mike Chen')
      .replace(/\{\{teamName\}\}/g, 'Lightning')
      .replace(/\{\{coachName\}\}/g, userData?.name || 'Coach')
      .replace(/\{\{progress\}\}/g, '75%')
      .replace(/\{\{teamGoal\}\}/g, '$50,000')
      .replace(/\{\{programName\}\}/g, 'Spring Soccer 2024')
      .replace(/\{\{totalRaised\}\}/g, '$25,000')
      .replace(/\{\{cardsSold\}\}/g, '500')
      .replace(/\{\{participationRate\}\}/g, '85%')
      .replace(/\{\{goalProgress\}\}/g, '75%')
      .replace(/\{\{topPerformers\}\}/g, 'Mike Chen, Emma Davis, Alex Rodriguez')
      .replace(/\{\{recipientName\}\}/g, 'Team Member')
      .replace(/\{\{donorName\}\}/g, 'Donor Name')
      .replace(/\{\{amount\}\}/g, '$50')
      .replace(/\{\{transactionDate\}\}/g, new Date().toLocaleDateString());
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case Role.PARENT_STUDENT: return <User className="w-4 h-4" />;
      case Role.HEAD_COACH: return <Target className="w-4 h-4" />;
      case Role.PROGRAM_DIRECTOR: return <Building className="w-4 h-4" />;
      case Role.ORG_OWNER: return <Building className="w-4 h-4" />;
      case Role.SALES_REP: return <TrendingUp className="w-4 h-4" />;
      case 'PROSPECT': return <UserPlus className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case MESSAGE_TYPES.EMAIL: return <Mail className="w-4 h-4" />;
      case MESSAGE_TYPES.SMS: return <Phone className="w-4 h-4" />;
      case MESSAGE_TYPES.PUSH: return <MessageSquare className="w-4 h-4" />;
      case MESSAGE_TYPES.IN_APP: return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Messaging Center</h1>
              <p className="text-lg text-gray-600 mt-1">Communicate with your team and prospects</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
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
              { id: 'compose', label: 'Compose', icon: Send },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileText }
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
        {activeTab === 'compose' && (
          <div className="space-y-6">
            {/* Compose Message */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Compose Message</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Message Content */}
                <div className="space-y-6">
                  {/* Message Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <div className="flex gap-2">
                      {Object.values(MESSAGE_TYPES).map(type => (
                        <button
                          key={type}
                          onClick={() => setMessageType(type)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                            messageType === type
                              ? 'bg-cyan-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {getMessageTypeIcon(type)}
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Selection */}
                  {availableTemplates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="">Select a template...</option>
                        {availableTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Custom Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedTemplate ? 'Custom Message (optional)' : 'Message Content *'}
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder={selectedTemplate ? 'Add custom message or use template...' : 'Enter your message...'}
                    />
                  </div>

                  {/* Template Preview */}
                  {selectedTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Preview</label>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {getTemplatePreview(selectedTemplate)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Scheduling */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Message (optional)</label>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Column - Recipients */}
                <div className="space-y-6">
                  {/* Recipient Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Recipients</label>
                      <button
                        onClick={() => setShowRecipientSelector(!showRecipientSelector)}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {showRecipientSelector ? 'Hide' : 'Select'} Recipients
                      </button>
                    </div>

                    {showRecipientSelector && (
                      <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="mb-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search recipients..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          >
                            <option value="">All Roles</option>
                            <option value={Role.PARENT_STUDENT}>Students/Parents</option>
                            <option value={Role.HEAD_COACH}>Coaches</option>
                            <option value={Role.PROGRAM_DIRECTOR}>Program Directors</option>
                            <option value={Role.ORG_OWNER}>Organization Owners</option>
                            <option value={Role.SALES_REP}>Sales Reps</option>
                            <option value="PROSPECT">Prospects</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          {filteredRecipients.map(recipient => (
                            <div
                              key={recipient.id}
                              onClick={() => handleRecipientToggle(recipient)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedRecipients.some(r => r.id === recipient.id)
                                  ? 'border-cyan-500 bg-cyan-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border-2 ${
                                  selectedRecipients.some(r => r.id === recipient.id)
                                    ? 'border-cyan-500 bg-cyan-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedRecipients.some(r => r.id === recipient.id) && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{recipient.name}</div>
                                  <div className="text-sm text-gray-600 flex items-center gap-2">
                                    {getRoleIcon(recipient.role)}
                                    {recipient.email}
                                    {recipient.organization && (
                                      <span className="text-gray-500">• {recipient.organization}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Recipients */}
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Selected Recipients ({selectedRecipients.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipients.map(recipient => (
                          <div
                            key={recipient.id}
                            className="flex items-center gap-2 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm"
                          >
                            {recipient.name}
                            <button
                              onClick={() => handleRecipientToggle(recipient)}
                              className="text-cyan-600 hover:text-cyan-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || selectedRecipients.length === 0}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {scheduledFor ? 'Schedule Message' : 'Send Message'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Message History</h3>
              <div className="space-y-4">
                {messageHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages sent yet.</p>
                ) : (
                  messageHistory.map(message => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getMessageTypeIcon(message.message_type)}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {message.template_id ? MESSAGE_TEMPLATES[message.template_id]?.name : 'Custom Message'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {message.recipients.length} recipients • {new Date(message.sent_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            message.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        {message.custom_message || 'Template message sent'}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Delivered: {message.delivered_count}</span>
                        <span>Opened: {message.opened_count}</span>
                        <span>Clicked: {message.clicked_count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recipients' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Recipients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipients.map(recipient => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getRoleIcon(recipient.role)}
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {recipient.email}
                      </div>
                      {recipient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {recipient.phone}
                        </div>
                      )}
                      {recipient.organization && (
                        <div className="flex items-center gap-2">
                          <Building className="w-3 h-3" />
                          {recipient.organization}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Templates</h3>
              <div className="space-y-4">
                {availableTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-600">
                          {template.type.toUpperCase()} • {template.subject || 'No subject'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setActiveTab('compose');
                        }}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                      <pre className="whitespace-pre-wrap">{getTemplatePreview(template.id)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Message Analytics</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-bold">{analytics.total_sent}</div>
                  <div className="text-sm opacity-90">Total Sent</div>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-bold">{analytics.total_delivered}</div>
                  <div className="text-sm opacity-90">Delivered</div>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-bold">{Math.round(analytics.open_rate * 100)}%</div>
                  <div className="text-sm opacity-90">Open Rate</div>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-bold">{Math.round(analytics.click_rate * 100)}%</div>
                  <div className="text-sm opacity-90">Click Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={loadAnalytics}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Load Analytics
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;
