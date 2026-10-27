import "dotenv/config"
import cors from "cors"
import express from "express"
import { env } from "./config/env.js"
import { adminRouter } from "./routes/admin.routes.js"
import { authRouter } from "./routes/auth.routes.js"
import { activitiesRouter, destinationsRouter } from "./routes/explore.routes.js"
import { communityRouter } from "./routes/community.routes.js"
import { sharedRouter, stopsRouter, tripActivitiesRouter, tripsRouter } from "./routes/trips.routes.js"
import { usersRouter } from "./routes/users.routes.js"
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js"
import { prisma } from "./config/prisma.js"

const app = express()

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false,
  })
)
app.use(express.json({ limit: "2mb" }))
app.disable("x-powered-by")

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  })
})

app.get("/api/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", database: "connected" })
  } catch {
    res.status(503).json({ error: "The database is temporarily unavailable" })
  }
})

app.use("/api/auth", authRouter)
app.use("/api/users", usersRouter)
app.use("/api/trips", tripsRouter)
app.use("/api/stops", stopsRouter)
app.use("/api/trip-activities", tripActivitiesRouter)
app.use("/api/destinations", destinationsRouter)
app.use("/api/activities", activitiesRouter)
app.use("/api/community", communityRouter)
app.use("/api/shared", sharedRouter)
app.use("/api/admin", adminRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
