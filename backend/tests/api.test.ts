import assert from "node:assert/strict"
import { once } from "node:events"
import { randomUUID } from "node:crypto"
import test from "node:test"
import app from "../src/app.js"
import { prisma } from "../src/config/prisma.js"

test("trip API preserves data, ownership and atomic writes", async (t) => {
  const server = app.listen(0, "127.0.0.1")
  await once(server, "listening")
  const address = server.address()
  assert.ok(address && typeof address === "object")
  const base = `http://127.0.0.1:${address.port}/api`
  const marker = randomUUID().replaceAll("-", "").slice(0, 14)
  const emails = [`owner-${marker}@example.invalid`, `other-${marker}@example.invalid`]
  const userIds: string[] = []
  const request = async (path: string, method = "GET", token?: string, body?: unknown) => {
    const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
    return { status: response.status, data: await response.json().catch(() => null) }
  }
  try {
    assert.equal((await request("/ready")).status, 200)
    const accounts = []
    for (const [index, email] of emails.entries()) {
      const result = await request("/auth/register", "POST", undefined, { firstName: "API", lastName: "Test", email, username: `test_${marker}_${index}`, password: randomUUID() })
      assert.equal(result.status, 201)
      accounts.push(result.data)
      userIds.push(result.data.user.id)
    }
    const owner = accounts[0].token
    const other = accounts[1].token
    const destinations = (await request("/destinations")).data
    assert.ok(destinations.length >= 2, "Seed the destination catalogue before running integration tests")

    await t.test("authentication and atomic trip creation", async () => {
      assert.equal((await request("/trips")).status, 401)
      const before = await prisma.trip.count({ where: { userId: userIds[0] } })
      const failed = await request("/trips", "POST", owner, { title: "Rollback test", stops: [{ destinationId: destinations[0].id }, { destinationId: "missing-destination" }] })
      assert.equal(failed.status, 400)
      assert.equal(await prisma.trip.count({ where: { userId: userIds[0] } }), before)
    })

    const created = await request("/trips", "POST", owner, { title: "Integration trip", startDate: "2026-11-10", endDate: "2026-11-20", totalBudget: 50000, currency: "USD", stops: [{ destinationId: destinations[0].id, daysCount: 3, estimatedCost: 1000 }, { destinationId: destinations[1].id, daysCount: 2, estimatedCost: 500 }] })
    assert.equal(created.status, 201)
    const id = created.data.trip.id
    let trip = (await request(`/trips/${id}`, "GET", owner)).data

    await t.test("foreign owners cannot read or change a trip", async () => {
      assert.equal((await request(`/trips/${id}`, "GET", other)).status, 404)
      assert.equal((await request(`/trips/${id}/stops/${trip.stops[0].id}`, "DELETE", other)).status, 404)
      assert.equal((await request(`/stops/${trip.stops[0].id}`, "PATCH", other, { notes: "unauthorized" })).status, 404)
    })
    await t.test("concurrent additions retain unique order and reordering persists", async () => {
      const results = await Promise.all([request(`/trips/${id}/stops`, "POST", owner, { destinationId: destinations[0].id }), request(`/trips/${id}/stops`, "POST", owner, { destinationId: destinations[1].id })])
      assert.deepEqual(results.map((result) => result.status), [201, 201])
      trip = (await request(`/trips/${id}`, "GET", owner)).data
      const ids = trip.stops.map((stop: { id: string }) => stop.id).reverse()
      assert.equal((await request(`/trips/${id}/stops/order`, "PUT", owner, { stopIds: ids })).status, 200)
      trip = (await request(`/trips/${id}`, "GET", owner)).data
      assert.deepEqual(trip.stops.map((stop: { id: string }) => stop.id), ids)
      assert.equal((await request(`/trips/${id}/stops/order`, "PUT", owner, { stopIds: [ids[0], ids[0]] })).status, 400)
    })
    await t.test("dates validate and null clears an existing date", async () => {
      assert.equal((await request(`/trips/${id}`, "PATCH", owner, { startDate: "2026-11-22" })).status, 400)
      assert.equal((await request(`/trips/${id}`, "PATCH", owner, { startDate: "2026-02-30" })).status, 400)
      assert.equal((await request(`/stops/${trip.stops[0].id}`, "PATCH", owner, { startDate: "2026-11-11", endDate: "2026-11-12" })).status, 200)
      assert.equal((await request(`/stops/${trip.stops[0].id}`, "PATCH", owner, { startDate: null, endDate: null })).status, 200)
      trip = (await request(`/trips/${id}`, "GET", owner)).data
      assert.equal(trip.stops[0].startDate, null)
    })
    await t.test("auto planning saves activities and is repeatable without duplicates", async () => {
      assert.equal((await request(`/trips/${id}/auto-plan`, "POST", owner)).status, 200)
      const first = await prisma.tripActivity.count({ where: { tripStop: { tripId: id } } })
      assert.ok(first > 0)
      assert.equal((await request(`/trips/${id}/auto-plan`, "POST", owner)).status, 200)
      assert.equal(await prisma.tripActivity.count({ where: { tripStop: { tripId: id } } }), first)
    })
    await t.test("budgets separate estimates and expenses and preserve currency", async () => {
      await prisma.expense.create({ data: { tripId: id, category: "FOOD", amount: 125.5, description: "Integration expense" } })
      const budget = (await request(`/trips/${id}/budget`, "GET", owner)).data
      assert.equal(budget.currency, "USD")
      assert.equal(budget.spent, 125.5)
      assert.ok(budget.estimated >= 1500)
      assert.equal(budget.actualBreakdown.food, 125.5)
    })
    await t.test("sharing respects ownership and shared copies persist", async () => {
      assert.equal((await request(`/trips/${id}/share`, "POST", other)).status, 404)
      const share = await request(`/trips/${id}/share`, "POST", owner)
      assert.equal(share.status, 200)
      assert.equal((await request(`/shared/${share.data.shareSlug}`)).status, 200)
      const copy = await request(`/shared/${share.data.shareSlug}/copy`, "POST", other)
      assert.equal(copy.status, 201)
      assert.equal((await request(`/trips/${copy.data.trip.id}`, "GET", other)).status, 200)
      assert.equal((await request("/community", "POST", other, { tripId: id, caption: "Foreign trip" })).status, 400)
    })
  } finally {
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect()
  }
})
