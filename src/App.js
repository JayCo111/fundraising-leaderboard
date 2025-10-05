/**
 * Fundraising Leaderboard App
 * 
 * Main application component that displays fundraising statistics,
 * team leaderboards, and individual student performance.
 * 
 * Features:
 * - Real-time data from Google Sheets
 * - Three views: My Stats, My Team, Everyone
 * - Automatic ranking and calculations
 * - Row-level privacy for parent access
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Share2, QrCode, Search, Filter, AlertCircle } from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from './config/googleSheets';

const FundraisingApp = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser] = useState('john.parent@example.com');
  const [activeTab, setActiveTab] = useState('mystats');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);console.log('Sheet ID:', GOOGLE_SHEETS_CONFIG.SHEET_ID);
        console.log('API Key:', GOOGLE_SHEETS_CONFIG.API_KEY);
        console.log('Starting fetch...');
        
        const studentsResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.STUDENTS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
        );
        const studentsJson = await studentsResponse.json();
        
        const ordersResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.ORDERS_RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
        );
        const ordersJson = await ordersResponse.json();

        if (studentsJson.values) {
          const students = studentsJson.values.map(row => ({
            StudentID: row[0] || '',
            FirstName: row[1] || '',
            LastName: row[2] || '',
            Team: row[3] || '',
            Goal_$: parseFloat(row[4]) || 0,
            ParentEmail: row[5] || '',
            PersonalLink: row[6] || '',
            QR_URL: row[7] || '',
            Avatar_URL: row[8] || ''
          }));
          setStudentsData(students);
        }

        if (ordersJson.values) {
          const orders = ordersJson.values.map(row => ({
            Timestamp: row[0] || '',
            OrderID: row[1] || '',
            BuyerName: row[2] || '',
            BuyerEmail: row[3] || '',
            BuyerPhone: row[4] || '',
            Quantity: parseFloat(row[5]) || 0,
            TotalPaid: parseFloat(row[6]) || 0,
            StudentID: row[7] || '',
            Status: row[8] || 'Paid'
          }));
          setOrdersData(orders);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError('Failed to load data from Google Sheets');
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const enrichedStudents = useMemo(() => {
    return studentsData.map(student => {
      const studentOrders = ordersData.filter(o => o.StudentID === student.StudentID);
      const NetQty = studentOrders.reduce((sum, o) => sum + (o.Status === 'Refunded' ? 0 : o.Quantity), 0);
      const NetRaised = studentOrders.reduce((sum, o) => sum + (o.Status === 'Refunded' ? 0 : o.TotalPaid), 0);
      const ProgressPct = student.Goal_$ > 0 ? NetRaised / student.Goal_$ : 0;
      const FullName = `${student.FirstName} ${student.LastName}`;
      
      return {
        ...student,
        FullName,
        CardsSold: NetQty,
        NetRaised,
        ProgressPct,
        Rel_Orders: studentOrders
      };
    });
  }, [studentsData, ordersData]);

  const rankedStudents = useMemo(() => {
    const sorted = [...enrichedStudents].sort((a, b) => b.NetRaised - a.NetRaised);
    return sorted.map((student, index) => ({
      ...student,
      OverallRank: index + 1,
      Medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
    }));
  }, [enrichedStudents]);

  const studentsWithTeamStats = useMemo(() => {
    return rankedStudents.map(student => {
      const teamMates = rankedStudents.filter(s => s.Team === student.Team);
      const Team_Cards = teamMates.reduce((sum, s) => sum + s.CardsSold, 0);
      const Team_Net = teamMates.reduce((sum, s) => sum + s.NetRaised, 0);
      const teamSorted = teamMates.sort((a, b) => b.NetRaised - a.NetRaised);
      const TeamRank = teamSorted.findIndex(s => s.StudentID === student.StudentID) + 1;
      
      return {
        ...student,
        Team_Cards,
        Team_Net,
        TeamRank,
        Rel_TeamMates: teamMates
      };
    });
  }, [rankedStudents]);

  const currentStudent = studentsWithTeamStats.find(s => s.ParentEmail === currentUser);
  const teams = [...new Set(studentsWithTeamStats.map(s => s.Team))];
  const totalRaised = studentsWithTeamStats.reduce((sum, s) => sum + s.NetRaised, 0);
  const totalCards = studentsWithTeamStats.reduce((sum, s) => sum + s.CardsSold, 0);

  const copyLink = () => {
    if (currentStudent?.PersonalLink) {
      navigator.clipboard.writeText(currentStudent.PersonalLink);
      alert('Link copied to clipboard!');
    }
  };

  const filteredStudents = studentsWithTeamStats.filter(s => {
    const matchesSearch = s.FullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = !teamFilter || s.Team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading fundraising data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Fundraising Leaderboard</h1>
          </div>
          <div className="text-sm opacity-90">Signed in as: {currentUser}</div>
          {error && (
            <div className="mt-3 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto flex">
          <button
            onClick={() => setActiveTab('mystats')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'mystats'
                ? 'text-indigo-600 border-b-4 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            My Stats
          </button>
          <button
            onClick={() => setActiveTab('myteam')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'myteam'
                ? 'text-indigo-600 border-b-4 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            My Team
          </button>
          <button
            onClick={() => setActiveTab('everyone')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'everyone'
                ? 'text-indigo-600 border-b-4 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Everyone
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'mystats' && currentStudent && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{currentStudent.FullName}</h2>
                  <p className="text-lg text-gray-600 mt-1">Team: {currentStudent.Team}</p>
                </div>
                {currentStudent.Avatar_URL && (
                  <img src={currentStudent.Avatar_URL} alt="Avatar" className="w-20 h-20 rounded-full" />
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Progress to Goal</span>
                  <span className="font-bold text-indigo-600">
                    ${currentStudent.NetRaised} of ${currentStudent.Goal_$}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(currentStudent.ProgressPct * 100, 100)}%` }}
                  >
                    {currentStudent.ProgressPct > 0.1 && (
                      <span className="text-xs font-bold text-white">
                        {Math.round(currentStudent.ProgressPct * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div className="text-xs font-semibold text-green-700">Raised</div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">${currentStudent.NetRaised}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div className="text-xs font-semibold text-blue-700">Cards Sold</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{currentStudent.CardsSold}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    <div className="text-xs font-semibold text-purple-700">Team Rank</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">#{currentStudent.TeamRank}</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-orange-600" />
                    <div className="text-xs font-semibold text-orange-700">Overall Rank</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {currentStudent.Medal || `#${currentStudent.OverallRank}`}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Copy My Link
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Show My QR
                </button>
              </div>

              {showQR && currentStudent.QR_URL && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
                  <img src={currentStudent.QR_URL} alt="QR Code" className="mx-auto" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Orders</h3>
              <div className="space-y-3">
                {currentStudent.Rel_Orders.length > 0 ? (
                  currentStudent.Rel_Orders.map(order => (
                    <div key={order.OrderID} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">{order.BuyerName}</div>
                        <div className="text-lg font-bold text-green-600">${order.TotalPaid}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{order.Quantity} cards</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.Timestamp).toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <div>{order.BuyerEmail}</div>
                        {order.BuyerPhone && <div>{order.BuyerPhone}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'myteam' && currentStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Team Total Raised</div>
                <div className="text-3xl font-bold text-indigo-600">${currentStudent.Team_Net}</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Team Cards Sold</div>
                <div className="text-3xl font-bold text-purple-600">{currentStudent.Team_Cards}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team: {currentStudent.Team}</h3>
              <div className="space-y-3">
                {currentStudent.Rel_TeamMates.map((teammate) => (
                  <div
                    key={teammate.StudentID}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      teammate.StudentID === currentStudent.StudentID
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {teammate.Avatar_URL && (
                        <img src={teammate.Avatar_URL} alt="Avatar" className="w-12 h-12 rounded-full" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {teammate.FullName}
                          {teammate.Medal && <span className="text-xl">{teammate.Medal}</span>}
                        </div>
                        <div className="text-sm text-gray-600">{teammate.CardsSold} cards</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">${teammate.NetRaised}</div>
                        <div className="text-xs text-gray-500">Team #{teammate.TeamRank}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'everyone' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Raised</div>
                <div className="text-3xl font-bold text-green-600">${totalRaised}</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Cards Sold</div>
                <div className="text-3xl font-bold text-blue-600">{totalCards}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Teams</option>
                    {teams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Leaderboard</h3>
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.StudentID}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      student.ProgressPct >= 1
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-full font-bold text-indigo-600">
                        {student.Medal || `#${student.OverallRank}`}
                      </div>
                      {student.Avatar_URL && (
                        <img src={student.Avatar_URL} alt="Avatar" className="w-12 h-12 rounded-full" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {student.FullName}
                          {student.ProgressPct >= 1 && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                              Goal Met!
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Team: {student.Team}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">${student.NetRaised}</div>
                        <div className="text-sm text-gray-600">{student.CardsSold} cards</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundraisingApp;