import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  CheckCircle2,
  Play,
  UserRound,
  Star,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";

export default function RequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [techs, setTechs] = useState([]);
  const load = () =>
    api.get(`/requests/${id}`).then(({ data }) => setData(data.data));
  useEffect(() => {
    load();
    if (user.role === "admin")
      api
        .get("/admin/technicians")
        .then(({ data }) =>
          setTechs(data.data.technicians.filter((t) => t.isActive)),
        );
  }, [id]);
  if (!data) return <Spinner />;
  const r = data.request;
  const isOwner = r.createdBy?._id === user.id || r.createdBy?._id === user._id;
  const isTech = user.role === "technician" && r.assignedTo?._id === user.id;
  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/requests/${id}/comments`, { message: comment });
      setComment("");
      load();
      toast.success("Comment added");
    } catch (e) {
      toast.error(e.response?.data?.message || "Comment failed");
    }
  };
  const action = async (url, body) => {
    try {
      await api.put(url, body);
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };
  const rate = async () => {
    try {
      await api.post(`/requests/${id}/rating`, { rating, review });
      toast.success("Rating submitted");
      setShowRate(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Rating failed");
    }
  };
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={r.status} />
            <PriorityBadge priority={r.priority} />
          </div>
          <h1 className="mt-3 text-3xl font-black">{r.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {r.category} · {r.location} ·{" "}
            {new Date(r.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isTech && r.status === "ASSIGNED" && (
            <button
              className="btn-primary"
              onClick={() =>
                action(`/technician/requests/${id}/status`, {
                  status: "IN_PROGRESS",
                })
              }
            >
              <Play size={16} /> Start work
            </button>
          )}
          {isTech && r.status === "IN_PROGRESS" && (
            <button
              className="btn-primary"
              onClick={() => setShowResolve(true)}
            >
              <CheckCircle2 size={16} /> Resolve
            </button>
          )}
          {isOwner && r.status === "RESOLVED" && (
            <button
              className="btn-primary"
              onClick={() => action(`/requests/${id}/close`, {})}
            >
              <CheckCircle2 size={16} /> Close request
            </button>
          )}

          {isOwner &&
            ["RESOLVED", "CLOSED"].includes(r.status) &&
            !data.rating && (
              <button
                className="btn-secondary"
                onClick={() => setShowRate(true)}
              >
                <Star size={16} /> Rate
              </button>
            )}
          {user.role === "admin" && (
            <select
              className="input w-auto"
              value={r.priority}
              onChange={(e) =>
                action(`/admin/requests/${id}/priority`, {
                  priority: e.target.value,
                })
              }
            >
              {["Low", "Medium", "High", "Critical"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Request details</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
              {r.description}
            </p>
            {r.image && (
              <img
                src={r.image}
                className="mt-5 max-h-[420px] w-full rounded-2xl object-cover"
                alt="Request"
              />
            )}
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Timeline</h2>
            <div className="mt-5 space-y-5">
              {r.statusHistory?.map((h, i) => (
                <div className="flex gap-4" key={i}>
                  <div className="mt-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                  <div>
                    <p className="font-semibold">
                      {h.status.replace("_", " ")}
                    </p>
                    <p className="text-sm text-slate-500">{h.note}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MessageSquare size={19} /> Conversation
            </h2>
            <div className="mt-5 space-y-4">
              {data.comments?.map((c) => (
                <div className="rounded-xl bg-slate-50 p-4" key={c._id}>
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {c.userId?.name}{" "}
                      <span className="ml-1 text-xs font-normal capitalize text-slate-400">
                        {c.userId?.role}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <input
                className="input"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn-primary" onClick={addComment}>
                Send
              </button>
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Assignment</h2>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600">
                <UserRound />
              </div>
              <div>
                <p className="font-semibold">
                  {r.assignedTo?.name || "Unassigned"}
                </p>
                <p className="text-sm text-slate-500">
                  {r.assignedTo?.email || "Waiting for admin assignment"}
                </p>
              </div>
            </div>
            {user.role === "admin" && (
              <select
                className="input mt-5"
                value={r.assignedTo?._id || ""}
                onChange={(e) =>
                  action(`/admin/requests/${id}/assign`, {
                    technicianId: e.target.value,
                  })
                }
              >
                <option value="">Select technician</option>
                {techs.map((t) => (
                  <option value={t._id} key={t._id}>
                    {t.name} · {t.profile?.specialization || "Other"}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Resolution</h2>
            {r.resolution ? (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {r.resolution}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No resolution notes yet.
              </p>
            )}
            {data.rating && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <p className="font-bold">Rating: {data.rating.rating}/5</p>
                <p className="mt-1 text-sm text-slate-600">
                  {data.rating.review || "No written review."}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
      <Modal
        open={showResolve}
        title="Resolve request"
        onClose={() => setShowResolve(false)}
      >
        <textarea
          className="input min-h-32"
          placeholder="Describe what was fixed..."
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />
        <button
          className="btn-primary mt-4 w-full"
          onClick={async () => {
            await action(`/technician/requests/${id}/resolve`, { resolution });
            setShowResolve(false);
          }}
        >
          Mark resolved
        </button>
      </Modal>
      <Modal
        open={showRate}
        title="Rate technician"
        onClose={() => setShowRate(false)}
      >
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={n <= rating ? "text-amber-500" : "text-slate-300"}
            >
              <Star fill="currentColor" />
            </button>
          ))}
        </div>
        <textarea
          className="input mt-4 min-h-24"
          placeholder="Optional review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button className="btn-primary mt-4 w-full" onClick={rate}>
          Submit rating
        </button>
      </Modal>
    </div>
  );
}
