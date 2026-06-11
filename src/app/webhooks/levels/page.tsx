import { db } from "@/lib/db/client"
import { webhookEvents } from "@/lib/webhooks/schema"
import { desc } from "drizzle-orm"

function extractLevelEvents(events: any[]) {
  return events
    .filter((e) => e.payload?.type === "LEVEL")
    .map((e) => ({
      id: e.id,
      playerName: e.playerName,
      timestamp: e.receivedAt,
      skills: e.payload.extra.allSkills,
      levelledSkills: e.payload.extra.levelledSkills,
      combatLevel: e.payload.extra.combatLevel?.value ?? null,
    }))
}

function aggregateSkillGains(levelEvents: any[]) {
  const map: Record<string, number> = {}

  for (const e of levelEvents) {
    for (const skill of Object.keys(e.levelledSkills ?? {})) {
      map[skill] = (map[skill] ?? 0) + 1
    }
  }

  return map
}

function averageSkillLevels(levelEvents: any[]) {
  const totals: Record<string, number> = {}
  const counts: Record<string, number> = {}

  for (const e of levelEvents) {
    for (const [skill, value] of Object.entries(e.skills ?? {})) {
      totals[skill] = (totals[skill] ?? 0) + (value as number)
      counts[skill] = (counts[skill] ?? 0) + 1
    }
  }

  const avg: Record<string, number> = {}
  for (const skill of Object.keys(totals)) {
    avg[skill] = Math.round(totals[skill] / counts[skill])
  }

  return avg
}

export default async function LevelAnalyticsPage() {
  const events = await db
    .select()
    .from(webhookEvents)
    .orderBy(desc(webhookEvents.receivedAt))
    .limit(2000)

  const levelEvents = extractLevelEvents(events)

  const skillGains = aggregateSkillGains(levelEvents)
  const avgLevels = averageSkillLevels(levelEvents)

  const maxGain = Math.max(...Object.values(skillGains), 1)
  const maxAvg = Math.max(...Object.values(avgLevels), 1)

  return (
    <main style={{ padding: "2rem", background: "#0d0d0d", color: "#e2e2e2" }}>
      <h1 style={{ color: "#7cfc6e", marginBottom: "2rem" }}>
        Level Analytics Dashboard
      </h1>

      {/* QUICK METRICS */}
      <section style={{ marginBottom: "2rem" }}>
        <div>Total level events: {levelEvents.length}</div>
      </section>

      {/* MOST TRAINED SKILLS */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ color: "#7cfc6e" }}>Most Trained Skills</h2>

        <table style={{ width: "100%", fontSize: "0.85rem" }}>
          <tbody>
            {Object.entries(skillGains)
              .sort((a, b) => b[1] - a[1])
              .map(([skill, value]) => (
                <tr key={skill}>
                  <td style={{ width: "20%", color: "#ccc" }}>{skill}</td>
                  <td style={{ width: "80%" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <div
                        style={{
                          height: "8px",
                          width: `${(value / maxGain) * 100}%`,
                          background: "#7cfc6e",
                        }}
                      />
                      <span style={{ color: "#666" }}>{value}</span>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* AVERAGE LEVELS */}
      <section>
        <h2 style={{ color: "#7cfc6e" }}>Average Skill Levels</h2>

        <table style={{ width: "100%", fontSize: "0.85rem" }}>
          <tbody>
            {Object.entries(avgLevels)
              .sort((a, b) => b[1] - a[1])
              .map(([skill, value]) => (
                <tr key={skill}>
                  <td style={{ width: "20%", color: "#ccc" }}>{skill}</td>
                  <td style={{ width: "80%" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <div
                        style={{
                          height: "8px",
                          width: `${(value / maxAvg) * 100}%`,
                          background: "#ffd700",
                        }}
                      />
                      <span style={{ color: "#666" }}>{value}</span>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}