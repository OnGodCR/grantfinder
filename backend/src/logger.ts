// Minimal logger wrapper — no external deps
type Fields = Record<string, unknown>;

function fmt(msg: string, fields?: Fields) {
  if (!fields || Object.keys(fields).length === 0) return msg;
  return `${msg} ${JSON.stringify(fields)}`;
}

export const logger = {
  info: (msg: string, fields?: Fields) => console.log(fmt(msg, fields)),
  warn: (msg: string, fields?: Fields) => console.warn(fmt(msg, fields)),
  error: (msg: string, fields?: Fields) => console.error(fmt(msg, fields)),
};
