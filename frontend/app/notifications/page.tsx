'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavbar from '@/components/TopNavbar';
import { Bell, Check, X, AlertCircle, Award, Bookmark, TrendingUp, Calendar, Filter, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Mock notifications data
    const mockNotifications = [
      {
        id: '1',
        type: 'deadline',
        title: 'Grant Deadline Approaching',
        message: 'NSF AI Research Grant deadline is in 3 days',
        grantTitle: 'NSF AI Research Grant',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'high',
        actionUrl: '/grants/nsf-ai-research'
      },
      {
        id: '2',
        type: 'match',
        title: 'New High-Match Grant Found',
        message: 'Machine Learning Fellowship matches 92% of your profile',
        grantTitle: 'Machine Learning Fellowship',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/grants/ml-fellowship'
      },
      {
        id: '3',
        type: 'bookmark',
        title: 'Bookmark Reminder',
        message: 'You bookmarked this grant 7 days ago. Deadline is approaching.',
        grantTitle: 'Data Science Research Grant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'low',
        actionUrl: '/grants/data-science-grant'
      },
      {
        id: '4',
        type: 'application',
        title: 'Application Status Update',
        message: 'Your application for "AI Innovation Grant" has been reviewed',
        grantTitle: 'AI Innovation Grant',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        priority: 'medium',
        actionUrl: '/applications/ai-innovation-grant'
      },
      {
        id: '5',
        type: 'weekly',
        title: 'Weekly Grant Digest',
        message: '15 new grants found this week matching your interests',
        grantTitle: 'Weekly Summary',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        priority: 'low',
        actionUrl: '/discover'
      },
      {
        id: '6',
        type: 'deadline',
        title: 'Grant Deadline Tomorrow',
        message: 'NIH Research Fellowship deadline is tomorrow at 5 PM',
        grantTitle: 'NIH Research Fellowship',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        read: false,
        priority: 'high',
        actionUrl: '/grants/nih-fellowship'
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, [isLoaded]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-5 h-5 text-red-400" />;
      case 'match':
        return <TrendingUp className="w-5 h-5 text-teal-400" />;
      case 'bookmark':
        return <Bookmark className="w-5 h-5 text-blue-400" />;
      case 'application':
        return <Award className="w-5 h-5 text-green-400" />;
      case 'weekly':
        return <Bell className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'low':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'deadline', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline').length },
    { id: 'match', label: 'Matches', count: notifications.filter(n => n.type === 'match').length },
    { id: 'bookmark', label: 'Bookmarks', count: notifications.filter(n => n.type === 'bookmark').length },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-64">
        <TopNavbar onSearch={() => {}} />
        
        <div className="p-6 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-slate-400 text-lg">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Notifications</p>
                    <p className="text-2xl font-bold text-white">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Unread</p>
                    <p className="text-2xl font-bold text-white">{unreadCount}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-400/20 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">!</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Deadlines</p>
                    <p className="text-2xl font-bold text-white">
                      {notifications.filter(n => n.type === 'deadline').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">New Matches</p>
                    <p className="text-2xl font-bold text-white">
                      {notifications.filter(n => n.type === 'match').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-teal-400/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-8">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.id}
                  onClick={() => setFilter(filterItem.id)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === filterItem.id
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:scale-105'
                  }`}
                >
                  {filterItem.label}
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                    filter === filterItem.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {filterItem.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                <span className="ml-4 text-slate-300 text-lg font-medium">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-xl font-medium">No notifications found</p>
                <p className="text-slate-500 mt-2">
                  {filter === 'unread' ? 'All notifications are read' : 'No notifications match this filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-slate-800/50 rounded-xl p-6 border-l-4 ${getPriorityColor(notification.priority)} border border-slate-700/30 transition-all duration-200 hover:bg-slate-800/70 ${
                      !notification.read ? 'ring-2 ring-teal-500/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-slate-300 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{notification.grantTitle}</span>
                            <span>•</span>
                            <span>{notification.timestamp.toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{notification.priority} priority</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}