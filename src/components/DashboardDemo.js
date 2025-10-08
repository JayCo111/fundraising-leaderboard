import React, { useState } from 'react';
import { Role } from '../types';
import DashboardRouter from './DashboardRouter';

const DashboardDemo = () => {
  const [selectedRole, setSelectedRole] = useState(Role.SALES_REP);
  const [showDemo, setShowDemo] = useState(false);

  const roleOptions = [
    { value: Role.OWNER, label: 'Owner', description: 'Full platform access' },
    { value: Role.CEO, label: 'CEO', description: 'National overview and management' },
    { value: Role.REGIONAL_DIRECTOR, label: 'Regional Director', description: 'Regional management and oversight' },
    { value: Role.STATE_DIRECTOR, label: 'State Director', description: 'State-level management' },
    { value: Role.TERRITORY_DIRECTOR, label: 'Territory Director', description: 'Territory management' },
    { value: Role.SALES_REP, label: 'Sales Rep', description: 'CRM and prospect management' },
    { value: Role.ORG_OWNER, label: 'Club/School Director', description: 'Organization management' },
    { value: Role.PROGRAM_DIRECTOR, label: 'Program Director', description: 'Program management' },
    { value: Role.HEAD_COACH, label: 'Head Coach', description: 'Team management and coaching' },
    { value: Role.PARENT_STUDENT, label: 'Student/Parent', description: 'Student portal (existing)' }
  ];

  if (showDemo) {
    return (
      <div>
        <div className="bg-white shadow-lg border-b-2 border-cyan-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SportsRaiser Platform Demo</h1>
              <p className="text-gray-600">Role: {roleOptions.find(r => r.value === selectedRole)?.label}</p>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
        <DashboardRouter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            SportsRaiser Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete fundraising management system with role-based dashboards
          </p>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl inline-block shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">🎉 Phase 1 Complete!</h2>
            <p className="text-lg">All core dashboards implemented and ready for demo</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Select a Role to View Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleOptions.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  setSelectedRole(role.value);
                  setShowDemo(true);
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  selectedRole === role.value
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedRole === role.value ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}></div>
                  <h4 className="text-lg font-bold text-gray-900">{role.label}</h4>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Completed Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                PostgreSQL Database Schema with RLS
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                RBAC System with 10 Roles
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                REST API Foundation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Leaderboard Engine
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                PayPal Integration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Director Dashboards (5 roles)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Sales Rep CRM
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Club/School Director Interface
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Head Coach Dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Enhanced Student Portal (4 tabs)
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Next Phase</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Messaging System (Email/SMS)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Payouts & Rewards Management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Advanced Analytics & Reporting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Audit Logging & Exports
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Mobile App Integration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Advanced Referral CRM
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Real-time Notifications
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Performance Optimization
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-6 rounded-2xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Ready to Demo!</h3>
            <p className="text-lg mb-4">Select a role above to explore the complete SportsRaiser platform</p>
            <p className="text-sm opacity-90">
              All dashboards are fully functional with mock data and realistic UI/UX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;
