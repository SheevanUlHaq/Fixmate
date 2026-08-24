import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Notifications() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setRows(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const open = async (notification) => {
    try {
      if (!notification.isRead) await api.put(`/notifications/${notification._id}/read`);
      if (notification.requestId?._id) navigate(`/request/${notification.requestId._id}`);
      else load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update notification");
    }
  };

  const all = async () => {
    try {
      await api.put("/notifications/read-all");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark notifications as read");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600"><Bell size={18} /><span className="text-sm font-semibold">Updates</span></div>
          <h1 className="mt-1 text-3xl font-black">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">Important updates from your service workflow.</p>
        </div>
        {unreadCount > 0 && <button className="btn-secondary" onClick={all}><CheckCheck size={16} /> Mark all read</button>}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-slate-500">Loading notifications...</div>
        ) : rows.length ? rows.map((notification) => (
          <button
            key={notification._id}
            onClick={() => open(notification)}
            className={`card block w-full p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${notification.isRead ? "opacity-70" : "border-blue-200 bg-blue-50/30"}`}
          >
            <div className="flex gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300" : "bg-blue-600"}`} />
              <div>
                <p className="font-semibold">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                {notification.requestId && <p className="mt-2 text-xs font-semibold text-blue-600">Open request →</p>}
              </div>
            </div>
          </button>
        )) : (
          <div className="card p-10 text-center text-sm text-slate-500">You're all caught up.</div>
        )}
      </div>
    </div>
  );
}
