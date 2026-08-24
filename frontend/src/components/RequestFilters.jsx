export default function RequestFilters({
  values,
  onChange,
  showTechnician = false,
  technicians = [],
  showSort = false,
}) {
  const set = (key, value) => onChange({ ...values, [key]: value });

  return (
    <div className="card grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-5">
      <input
        className="input"
        placeholder="Search requests..."
        value={values.search || ""}
        onChange={(e) => set("search", e.target.value)}
      />
      <select
        className="input"
        value={values.status || ""}
        onChange={(e) => set("status", e.target.value)}
      >
        <option value="">All statuses</option>
        {[
          "REPORTED",
          "ASSIGNED",
          "IN_PROGRESS",
          "RESOLVED",
          "CLOSED",
          "CANCELLED",
        ].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <select
        className="input"
        value={values.priority || ""}
        onChange={(e) => set("priority", e.target.value)}
      >
        <option value="">All priorities</option>
        {["Low", "Medium", "High", "Critical"].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <select
        className="input"
        value={values.category || ""}
        onChange={(e) => set("category", e.target.value)}
      >
        <option value="">All categories</option>
        {[
          "Electrical",
          "Plumbing",
          "IT",
          "Cleaning",
          "Furniture",
          "HVAC",
          "Other",
        ].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      {showTechnician && (
        <select
          className="input"
          value={values.technician || ""}
          onChange={(e) => set("technician", e.target.value)}
        >
          <option value="">All technicians</option>
          {technicians.map((t) => (
            <option value={t._id} key={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
      {showSort && (
        <select
          className="input"
          value={values.sort || "-createdAt"}
          onChange={(e) => set("sort", e.target.value)}
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="priority">Priority (low → high)</option>
          <option value="-priority">Priority (high → low)</option>
          <option value="status">Status (A → Z)</option>
        </select>
      )}
    </div>
  );
}
