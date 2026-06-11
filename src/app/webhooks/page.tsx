import { db } from "@/lib/db/client"
import { webhookEvents } from "@/lib/webhooks/schema"
import { desc, count } from "drizzle-orm"
import Link from "next/link"

const PAGE_SIZE = 20

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const offset = (page - 1) * PAGE_SIZE

  const [events, [{ total }]] = await Promise.all([
    db
      .select()
      .from(webhookEvents)
      .orderBy(desc(webhookEvents.receivedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(webhookEvents),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main style={{ fontFamily: "'IBM Plex Mono', monospace", padding: "2rem", background: "#0d0d0d", minHeight: "100vh", color: "#e2e2e2" }}>
      <h1 style={{ fontSize: "1.2rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7cfc6e", marginBottom: "2rem" }}>
        Webhook Events <span style={{ color: "#555", fontSize: "0.8rem" }}>({total} total)</span>
      </h1>

      <Link href="/webhooks/levels" style={{ color: "#7cfc6e", marginLeft: "1rem" }}>
        level analytics →
      </Link>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #2a2a2a", color: "#666", textAlign: "left" }}>
            <th style={{ padding: "0.5rem 1rem 0.5rem 0" }}>ID</th>
            <th style={{ padding: "0.5rem 1rem" }}>Type</th>
            <th style={{ padding: "0.5rem 1rem" }}>Player</th>
            <th style={{ padding: "0.5rem 1rem" }}>Received</th>
            <th style={{ padding: "0.5rem 1rem" }}>Payload</th>
            <th style={{ padding: "0.5rem 1rem" }}>Image</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
              <td style={{ padding: "0.75rem 1rem 0.75rem 0", color: "#444" }}>#{event.id}</td>
              <td style={{ padding: "0.75rem 1rem" }}>
                <span style={{
                  background: typeColor(event.eventType),
                  color: "#000",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "3px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}>
                  {event.eventType ?? "UNKNOWN"}
                </span>
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "#ccc" }}>{event.playerName ?? "—"}</td>
              <td style={{ padding: "0.75rem 1rem", color: "#666" }}>
                {new Date(event.receivedAt!).toLocaleString()}
              </td>
              <td style={{ padding: "0.75rem 1rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#888" }}>
                {JSON.stringify(event.payload)}
              </td>
              <td style={{ padding: "0.75rem 1rem" }}>
                {event.imageUrl ? (
                  <a href={event.imageUrl} target="_blank" rel="noreferrer" style={{ color: "#7cfc6e" }}>view</a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem", alignItems: "center" }}>
        {page > 1 && (
          <Link href={`?page=${page - 1}`} style={{ color: "#7cfc6e", textDecoration: "none" }}>← prev</Link>
        )}
        <span style={{ color: "#555", fontSize: "0.8rem" }}>page {page} of {totalPages}</span>
        {page < totalPages && (
          <Link href={`?page=${page + 1}`} style={{ color: "#7cfc6e", textDecoration: "none" }}>next →</Link>
        )}
      </div>
    </main>
  )
}

function typeColor(type: string | null) {
  switch (type) {
    case "CLUE": return "#ffd700"
    case "SLAYER": return "#ff6b6b"
    case "COLLECTION": return "#7cfc6e"
    default: return "#555"
  }
}