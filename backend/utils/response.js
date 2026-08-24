export const success = (res, message, data = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const failure = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });
