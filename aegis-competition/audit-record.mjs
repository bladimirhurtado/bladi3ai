import { createHash, sign, verify } from "node:crypto";

function eventChain(events) {
  let previous = "GENESIS";
  for (const event of events) {
    previous = createHash("sha256")
      .update(previous + "|" + JSON.stringify(event))
      .digest("hex");
  }
  return previous;
}

function signedPayload(record) {
  return JSON.stringify({
    schemaVersion: record.schemaVersion,
    createdAt: record.createdAt,
    eventCount: record.eventCount,
    chainHead: record.chainHead,
    publicKey: record.publicKey
  });
}

/**
 * Create an independently verifiable audit record.
 * Keep the private key outside the repository and protect it with proper key custody.
 */
export function createAuditRecord(events, privateKey, publicKey, createdAt = new Date().toISOString()) {
  if (!Array.isArray(events)) throw new TypeError("events must be an array");
  const record = {
    schemaVersion: 1,
    createdAt,
    eventCount: events.length,
    chainHead: eventChain(events),
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString()
  };
  record.signature = sign(null, Buffer.from(signedPayload(record)), privateKey).toString("base64");
  return record;
}

/**
 * The trusted public key must come from a separate trusted channel.
 * The key embedded in the record is not trusted by itself.
 */
export function verifyAuditRecord(record, events, trustedPublicKey) {
  try {
    if (!record || typeof record !== "object" || !Array.isArray(events)) return false;
    if (record.schemaVersion !== 1 ||
        typeof record.createdAt !== "string" ||
        record.eventCount !== events.length ||
        typeof record.chainHead !== "string" ||
        typeof record.signature !== "string" ||
        typeof record.publicKey !== "string") return false;

    const trustedPem = trustedPublicKey.export({ type: "spki", format: "pem" }).toString();
    if (record.publicKey !== trustedPem) return false;
    if (record.chainHead !== eventChain(events)) return false;

    return verify(
      null,
      Buffer.from(signedPayload(record)),
      trustedPublicKey,
      Buffer.from(record.signature, "base64")
    );
  } catch {
    return false;
  }
}
