/**
 * Profile Page Component
 * 
 * Allows users to view and update their profile information,
 * including avatar management with initials-based generation
 * and custom image uploads.
 */

import { useState, useRef } from 'react';
import { User, Camera, Upload, Save, X, Edit3 } from 'lucide-react';

const ProfilePage = ({ currentStudent, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: currentStudent?.FirstName || '',
    lastName: currentStudent?.LastName || '',
    email: currentStudent?.ParentEmail || '',
    avatarType: currentStudent?.AvatarType || 'initials', // 'initials' or 'custom'
    customAvatar: currentStudent?.Avatar_URL || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const generateInitialsAvatar = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getAvatarBackgroundColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-cyan-400 to-cyan-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-emerald-400 to-emerald-600'
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatarType: 'custom',
          customAvatar: e.target.result
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error uploading image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    const updatedStudent = {
      ...currentStudent,
      AvatarType: profileData.avatarType,
      Avatar_URL: profileData.customAvatar
    };

    onUpdateProfile(updatedStudent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(prev => ({
      ...prev,
      avatarType: currentStudent?.AvatarType || 'initials',
      customAvatar: currentStudent?.Avatar_URL || ''
    }));
    setIsEditing(false);
  };

  const renderAvatar = () => {
    if (profileData.avatarType === 'custom' && profileData.customAvatar) {
      return (
        <img 
          src={profileData.customAvatar} 
          alt="Profile" 
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
        />
      );
    }

    const initials = generateInitialsAvatar(profileData.firstName, profileData.lastName);
    const bgColor = getAvatarBackgroundColor(`${profileData.firstName} ${profileData.lastName}`);

    return (
      <div className={`w-32 h-32 rounded-full ${bgColor} flex items-center justify-center border-4 border-white shadow-xl`}>
        <span className="text-4xl font-bold text-white">
          {initials}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-gray-600">View your profile information and manage your avatar</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-cyan-400">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {renderAvatar()}
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
                
                <button
                  onClick={() => setProfileData(prev => ({ ...prev, avatarType: 'initials' }))}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Use Initials
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Avatar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  disabled={true}
                  className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl font-semibold text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  disabled={true}
                  className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl font-semibold text-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled={true}
                  className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl font-semibold text-gray-600"
                />
              </div>
            </div>

            {/* Fundraising Stats */}
            <div className="mt-8 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Fundraising Progress</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${currentStudent?.NetRaised || 0}</div>
                  <div className="text-sm text-gray-600">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentStudent?.CardsSold || 0}</div>
                  <div className="text-sm text-gray-600">Cards Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentStudent?.ReferralPoints || 0}</div>
                  <div className="text-sm text-gray-600">Referral Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">#{currentStudent?.OverallRank || 0}</div>
                  <div className="text-sm text-gray-600">Overall Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
