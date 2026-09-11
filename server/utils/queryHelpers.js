// Helpers for safely handling untrusted query-string input before it
// touches a Mongo query or a RegExp constructor.

// Express's query parser turns `?field[$ne]=x` into `{ field: { $ne: 'x' } }`.
// Any query param that's meant to be a plain string must be rejected (not
// coerced) if it comes through as an object/array, or a MongoDB operator
// could be injected into the resulting filter.
export const asSafeString = (value) => {
  if (typeof value !== "string") return undefined;
  return value;
};

// Escapes regex metacharacters so user-supplied search text can't build an
// unintended (or catastrophically slow / ReDoS-prone) pattern when passed
// to `$regex` or `new RegExp(...)`.
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
