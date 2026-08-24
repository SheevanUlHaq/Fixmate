import { useEffect, useState } from "react";
import api from "../../services/api";
import RequestFilters from "../../components/RequestFilters";
import RequestTable from "../../components/RequestTable";
import Spinner from "../../components/Spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminRequests() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState(null);
  const [techs, setTechs] = useState([]);

  useEffect(() => {
    api
      .get("/admin/technicians")
      .then(({ data }) => setTechs(data.data.technicians));
  }, []);

  useEffect(() => {
    api
      .get("/admin/requests", { params: filters })
      .then(({ data }) => setData(data.data))
      .catch(() => setData({ requests: [] }));
  }, [filters]);

  const page = data?.pagination?.page || 1;
  const pages = data?.pagination?.pages || 1;
  const go = (p) => {
    if (p < 1 || p > pages) return;
    setFilters((f) => ({ ...f, page: p }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">All requests</h1>
        <p className="mt-2 text-sm text-slate-500">
          Search, filter and manage every service request.
        </p>
      </div>
      <RequestFilters
        values={filters}
        onChange={setFilters}
        showTechnician
        technicians={techs}
        showSort
      />
      {data === null ? (
        <Spinner />
      ) : (
        <>
          <RequestTable requests={data.requests} />
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => go(page - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs text-slate-400">
              Page {page} of {pages}
            </span>
            <button
              className="btn-secondary"
              disabled={page >= pages}
              onClick={() => go(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
