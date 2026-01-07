// components/Notification/NotificationCard.jsx
"use client";
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'Low':
        return 'bg-green-100 border-green-500 text-green-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getDomainIcon = (domain) => {
    const icons = {
      'Leave Management': '🏖️',
      'HR': '👥',
      'Payroll': '💰',
      'Attendance': '📅',
      'Shift Management': '🕐',
      'Recruitment': '📋',
      'Training': '📚',
      'Performance Review': '⭐',
      'Employee Benefits': '🎁',
      'Compliance': '⚖️',
      'Workplace Health': '🏥',
      'Employee Engagement': '🤝',
      'Company Announcements': '📢',
      'Task Assignment': '✅',
      'Customer Support': '💬',
      'Sales Targets': '🎯',
      'Project Management': '📊',
      'Corporate Policies': '📜',
      'policy': '📋',
    };
    return icons[domain] || '📬';
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const getMessage = () => {
    return notification.notificationMessage || 
           notification.message || 
           notification.body || 
           notification.content || 
           notification.description ||
           'No message available';
  };

  return (
    <div
      className={`relative p-3 mb-2 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
        notification.viewed
          ? 'bg-white border-gray-300'
          : 'bg-blue-50 border-blue-500'
      }`}
    >
      {/* Unread indicator */}
      {!notification.viewed && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm">{getDomainIcon(notification.relatedDomainType)}</span>
          <div className="flex-1">
            <p className="font-bold text-black text-md leading-tight">
              {notification.notificationTitle || notification.title || 'Notification'}
            </p>
            <span className="text-xs text-black">
              {notification.relatedDomainType || 'General'}
            </span>
          </div>
        </div>
        
        {/* Priority badge */}
        {notification.priority && (
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
              notification.priority
            )}`}
          >
            {notification.priority}
          </span>
        )}
      </div>

      {/* Message - Now smaller */}
      <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
        {getMessage()}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {formatTime(notification.createdAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!notification.viewed && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;