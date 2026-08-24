const transitions = {
  REPORTED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: []
};

export const canTransition = (from, to) =>
  transitions[from]?.includes(to) || false;

export const allowedNextStatuses = (status) => transitions[status] || [];
