import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
      // The page-level notifications screen remains the source of truth.
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openNotification = async (notification) => {
    setLoading(true);
    try {
      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`);
      }
      setOpen(false);
      await load();
      if (notification.requestId?._id) navigate(`/request/${notification.requestId._id}`);
      else navigate("/notifications");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not open notification");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark notifications as read");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="font-bold">Notifications</p>
              <p className="text-xs text-slate-400">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                <CheckCheck size={14} className="mr-1 inline" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length ? notifications.slice(0, 8).map((notification) => (
              <button
                type="button"
                key={notification._id}
                disabled={loading}
                onClick={() => openNotification(notification)}
                className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${notification.isRead ? "" : "bg-blue-50/50"}`}
              >
                <div className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300" : "bg-blue-600"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">You're all caught up.</div>
            )}
          </div>

          <button type="button" onClick={() => { setOpen(false); navigate("/notifications"); }} className="w-full border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-50">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
