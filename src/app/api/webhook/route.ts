import { db } from "@/lib/db/client"
import { webhookEvents } from "@/lib/webhooks/schema"
import { NextRequest, NextResponse } from "next/server"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // from Cloudflare dashboard
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const payloadJson = formData.get("payload_json")
  const payload = JSON.parse(payloadJson as string)

  let imageUrl: string | null = null
  const file = formData.get("file") as File | null

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `webhook-images/${Date.now()}-${file.name}`

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`
  }

  await db.insert(webhookEvents).values({ payload, source: "discord", imageUrl })

  return NextResponse.json({ ok: true })
}