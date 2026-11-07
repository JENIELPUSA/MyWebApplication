/**
 * Room name helpers — single source of truth.
 * Pareho ito gamit sa server.js (join) at controllers (emit).
 */

// Role-based room: "role:admin", "role:user", "role:technician", "role:supply"
const roleRoom = (role) => `role:${String(role).toLowerCase().trim()}`;

// User-specific room: "user:<userId>" — direct targeting / self-message
const userRoom = (userId) => `user:${String(userId)}`;

// Private room per user per role: "private:<role>:<userId>"
const privateRoom = (role, userId) =>
  `private:${String(role).toLowerCase().trim()}:${String(userId)}`;

// Fixed shared room — LAHAT ng roles naka-join
const ROOM_ALL_ROLES = "all-roles";

module.exports = {
  roleRoom,
  userRoom,
  privateRoom,
  ROOM_ALL_ROLES,
};