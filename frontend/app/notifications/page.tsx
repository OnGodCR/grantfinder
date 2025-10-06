'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavbar from '@/components/TopNavbar';
import { Bell, Check, X, AlertCircle, Award, Bookmark, TrendingUp, Calendar, Filter, CheckCheck, Info, AlertTriangle } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getPriorityColor, getPriorityIcon, type Notification } from '@/lib/notifications';

export default function NotificationsPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const data = await getNotifications(token || undefined);
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isLoaded, isSignedIn, getToken]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      const success = await markNotificationAsRead(notificationId, token || undefined);
      if (success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = await getToken();
      const success = await markAllNotificationsAsRead(token || undefined);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === 'critical' ? 'text-red-400' :
      priority === 'high' ? 'text-orange-400' :
      priority === 'medium' ? 'text-yellow-400' :
      'text-blue-400'
    }`;

    switch (type) {
      case 'deadline_urgent':
      case 'deadline_approaching':
        return <Calendar className={iconClass} />;
      case 'high_match':
        return <TrendingUp className={iconClass} />;
      case 'bookmark_reminder':
        return <Bookmark className={iconClass} />;
      case 'application_reminder':
        return <Award className={iconClass} />;
      case 'weekly_digest':
        return <Bell className={iconClass} />;
      case 'grant_updated':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case 'critical':
        return `${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`;
      case 'high':
        return `${baseClasses} bg-orange-500/20 text-orange-300 border border-orange-500/30`;
      case 'medium':
        return `${baseClasses} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
      case 'low':
        return `${baseClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      default:
        return `${baseClasses} bg-slate-500/20 text-slate-300 border border-slate-500/30`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'high-priority') return notification.priority === 'high' || notification.priority === 'critical';
    if (filter === 'deadlines') return notification.type.includes('deadline');
    if (filter === 'matches') return notification.type === 'high_match';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'high-priority', label: 'High Priority', count: notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length },
    { id: 'deadlines', label: 'Deadlines', count: notifications.filter(n => n.type.includes('deadline')).length },
    { id: 'matches', label: 'Matches', count: notifications.filter(n => n.type === 'high_match').length },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-56">
        <TopNavbar onSearch={() => {}} showSearch={false} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 bg-slate-900">
            <div className="w-full p-4">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bell className="w-8 h-8 text-teal-400 mr-3" />
                    <div>
                      <h1 className="text-4xl font-bold text-white">Notifications</h1>
                      <p className="text-slate-400 text-lg">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                      </p>
                    </div>
                  </div>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark All Read
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setFilter(filterItem.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === filterItem.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {filterItem.label}
                      {filterItem.count > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-slate-600 text-xs rounded-full">
                          {filterItem.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                  <span className="ml-4 text-slate-300 text-lg font-medium">Loading notifications...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                  <p className="text-red-300 text-lg font-medium">Error: {error}</p>
                </div>
              )}

              {!loading && !error && filteredNotifications.length === 0 && (
                <div className="text-center py-16">
                  <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-xl font-medium">No notifications found</p>
                  <p className="text-slate-500 mt-2">
                    {filter === 'unread' ? 'All notifications are read' : 'No notifications match your filter'}
                  </p>
                </div>
              )}

              {!loading && !error && filteredNotifications.length > 0 && (
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
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                              )}
                              <span className={getPriorityBadge(notification.priority)}>
                                {notification.priority.toUpperCase()}
                              </span>
                            </div>
                            
                            <p className="text-slate-300 mb-3">{notification.message}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              {notification.grantTitle && (
                                <>
                                  <span>{notification.grantTitle}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                              {notification.metadata?.matchScore && (
                                <>
                                  <span>•</span>
                                  <span>Match: {Math.round(notification.metadata.matchScore)}%</span>
                                </>
                              )}
                              {notification.metadata?.daysUntilDeadline && (
                                <>
                                  <span>•</span>
                                  <span>{notification.metadata.daysUntilDeadline} days left</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                            >
                              View
                            </a>
                          )}
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
    </div>
  );
}