import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
const Settings = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: false,
    lowAlerts: false,
  });
  
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    lastLogin: user?.lastLogin || 'Never',
  });
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const [modals, setModals] = useState({
    security: false,
    notifications: false,
    profile: false,
    integrations: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotifications(prev => ({ ...prev, ...parsed.notifications }));
        setSecurity(prev => ({ ...prev, ...parsed.security }));
        setTheme(parsed.theme || 'dark');
      } catch (e) {}
    }
  }, []);
  const saveSettings = () => {
    const settings = { notifications, security, theme };
    localStorage.setItem('settings', JSON.stringify(settings));
    showMessage('Settings saved successfully!', 'success');
  };
  
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      showMessage('Passwords do not match!', 'error');
      setLoading(false);
      return;
    }
    
    try {
      const updateData = {
        username: profile.username,
        email: profile.email,
      };
      if (profile.newPassword) {
        updateData.password = profile.newPassword;
      }
      
      const response = await authService.updateProfile(updateData);
      updateUser(response.data.user);
      showMessage('Profile updated successfully!', 'success');
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      closeModal('profile');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Update failed', 'error');
    }
    setLoading(false);
  };
  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = () => {
    setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }));
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    showMessage(`Switched to ${newTheme} mode`, 'success');
  };
  const openModal = (key) => setModals(prev => ({ ...prev, [key]: true }));
  const closeModal = (key) => setModals(prev => ({ ...prev, [key]: false }));
  const settingSections = [
    {
      id: 'profile',
      icon: '👤',
      title: 'Profile',
      description: 'Update your personal information and avatar',
      color: 'border-blue-500/20 bg-blue-500/5',
    },
    {
      id: 'security',
      icon: '',
      title: 'Security',
      description: 'Two-factor authentication, password policies',
      color: 'border-red-500/20 bg-red-500/5',
    },
    {
      id: 'notifications',
      icon: '',
      title: 'Notifications',
      description: 'Alert preferences, email, SMS, push',
      color: 'border-yellow-500/20 bg-yellow-500/5',
    },
    {
      id: 'integrations',
      icon: '',
      title: 'Integrations',
      description: 'Connect third-party security tools',
      color: 'border-green-500/20 bg-green-500/5',
    },
  ];
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#1a1a2e] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };
  const Toggle = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-all ${
        value ? 'bg-[#00e5ff]' : 'bg-gray-600'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white transition-all ${
          value ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0b132b] font-mono p-4 md:p-8">
      <style>{`
        .light { background: #f5f5f5; color: #222; }
        .light .bg-\\[\\#0b132b\\] { background: #f5f5f5; }
        .light .text-white { color: #222; }
        .light .border-\\[rgba\\(255,255,255,0.1\\)\\] { border-color: rgba(0,0,0,0.1); }
        .light .bg-\\[\\#1a1a2e\\] { background: #fff; }
      `}</style>

      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider">
               Settings
            </h1>
            <p className="text-[0.8rem] text-[rgba(0,229,255,0.5)] tracking-wider mt-1">
              Configure your security preferences
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] text-[#00e5ff] text-sm font-mono hover:bg-[rgba(0,229,255,0.1)] transition-all"
            >
              {theme === 'dark' ? ' Light Mode' : ' Dark Mode'}
            </button>
            <button
              onClick={saveSettings}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff007f] to-[#cc0066] text-white text-sm font-bold font-mono hover:shadow-[0_0_30px_rgba(255,0,127,0.2)] transition-all"
            >
               Save All
            </button>
          </div>
        </div>
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingSections.map((section) => (
            <div
              key={section.id}
              className={`p-6 rounded-xl border ${section.color} hover:border-[rgba(255,255,255,0.2)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,255,0.05)]`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {section.icon} {section.title}
                  </h3>
                  <p className="text-[0.8rem] text-[rgba(255,255,255,0.4)] mb-4">
                    {section.description}
                  </p>
                </div>
                <button
                  onClick={() => openModal(section.id)}
                  className="px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#00e5ff] bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] rounded-lg hover:bg-[rgba(0,229,255,0.1)] transition-all"
                >
                  Configure →
                </button>
              </div>
            </div>
          ))}
        </div>
        <Modal isOpen={modals.profile} onClose={() => closeModal('profile')} title="👤 Edit Profile">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm text-[rgba(255,255,255,0.5)] mb-1">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-2 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none focus:border-[rgba(0,229,255,0.15)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[rgba(255,255,255,0.5)] mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none focus:border-[rgba(0,229,255,0.15)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[rgba(255,255,255,0.5)] mb-1">New Password (optional)</label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-2 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none focus:border-[rgba(0,229,255,0.15)]"
              />
            </div>
            {profile.newPassword && (
              <div>
                <label className="block text-sm text-[rgba(255,255,255,0.5)] mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none focus:border-[rgba(0,229,255,0.15)]"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#ff007f] to-[#cc0066] rounded-lg text-white text-sm font-bold font-mono hover:shadow-[0_0_30px_rgba(255,0,127,0.2)] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </Modal>
        <Modal isOpen={modals.security} onClose={() => closeModal('security')} title=" Security Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg">
              <div>
                <span className="text-white font-semibold">Two-Factor Authentication</span>
                <p className="text-sm text-[rgba(255,255,255,0.4)]">Add an extra layer of security</p>
              </div>
              <Toggle value={security.twoFactorAuth} onChange={handleSecurityToggle} />
            </div>
            
            <div className="p-4 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg">
              <span className="text-white font-semibold">Last Login</span>
              <p className="text-sm text-[rgba(255,255,255,0.4)]">{security.lastLogin}</p>
            </div>
            
            <button
              onClick={() => {
                showMessage('Security settings updated!', 'success');
                closeModal('security');
              }}
              className="w-full py-2 bg-gradient-to-r from-[#ff007f] to-[#cc0066] rounded-lg text-white text-sm font-bold font-mono hover:shadow-[0_0_30px_rgba(255,0,127,0.2)] transition-all"
            >
              Save Security Settings
            </button>
          </div>
        </Modal>
        <Modal isOpen={modals.notifications} onClose={() => closeModal('notifications')} title=" Notification Preferences">
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications' },
              { key: 'sms', label: 'SMS Notifications' },
              { key: 'push', label: 'Push Notifications' },
              { key: 'criticalAlerts', label: 'Critical Alerts' },
              { key: 'highAlerts', label: 'High Priority Alerts' },
              { key: 'mediumAlerts', label: 'Medium Priority Alerts' },
              { key: 'lowAlerts', label: 'Low Priority Alerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg">
                <span className="text-white text-sm">{item.label}</span>
                <Toggle 
                  value={notifications[item.key]} 
                  onChange={() => handleNotificationToggle(item.key)} 
                />
              </div>
            ))}
            <button
              onClick={() => {
                showMessage('Notification preferences saved!', 'success');
                closeModal('notifications');
              }}
              className="w-full py-2 bg-gradient-to-r from-[#ff007f] to-[#cc0066] rounded-lg text-white text-sm font-bold font-mono hover:shadow-[0_0_30px_rgba(255,0,127,0.2)] transition-all"
            >
              Save Notification Preferences
            </button>
          </div>
        </Modal>
        <Modal isOpen={modals.integrations} onClose={() => closeModal('integrations')} title=" Integrations">
          <div className="space-y-3">
            {[
              { name: 'Slack', desc: 'Receive alerts in Slack channels', icon: '' },
              { name: 'Teams', desc: 'Microsoft Teams integration', icon: '' },
              { name: 'Discord', desc: 'Send alerts to Discord servers', icon: '' },
              { name: 'Email', desc: 'Email digest reports', icon: '' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg hover:border-[rgba(0,229,255,0.15)] transition-all">
                <div>
                  <span className="text-white font-semibold">{item.icon} {item.name}</span>
                  <p className="text-sm text-[rgba(255,255,255,0.4)]">{item.desc}</p>
                </div>
                <button className="px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-[#00e5ff] bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] rounded-lg hover:bg-[rgba(0,229,255,0.1)] transition-all">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
};
export default Settings;