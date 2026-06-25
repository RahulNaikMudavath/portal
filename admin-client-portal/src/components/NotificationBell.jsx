import { useEffect, useRef, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { io } from "socket.io-client";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [arrivalMessage, setArrivalMessage] = useState("");
  const wrapperRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = parsedUser?._id || parsedUser?.id || null;

    const loadNotifications = async () => {
      await fetchNotifications();
    };

    loadNotifications();

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    socket.on("newNotification", (notification) => {
      if (!currentUserId || String(notification.userId) !== String(currentUserId)) {
        return;
      }

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setArrivalMessage(notification.message || "New notification received");

      window.clearTimeout(window.__notificationArrivalTimeout);
      window.__notificationArrivalTimeout = window.setTimeout(() => {
        setArrivalMessage("");
      }, 3500);
    });

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("newNotification");
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_created: "🎯",
      task_submitted: "📤",
      task_approved: "✅",
      task_rejected: "❌",
      task_started: "▶️"
    };
    return icons[type] || "📢";
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-2xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {arrivalMessage && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-slate-900/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-lg z-50">
          {arrivalMessage}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-light-border dark:border-dark-border cursor-pointer transition-colors duration-200 ${
                    notification.read
                      ? "bg-light-card dark:bg-dark-card"
                      : "bg-blue-50 dark:bg-blue-950"
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                        {notification.message}
                      </p>
                      {notification.actionBy && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          by {notification.actionBy.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
