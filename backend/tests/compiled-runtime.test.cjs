const assert = require("node:assert/strict")
const { once } = require("node:events")
const test = require("node:test")

test("compiled API loads Prisma and reaches the database", { timeout: 30000 }, async () => {
  // Exercise emitted JavaScript: a TypeScript loader can hide module-format errors.
  const app = require("../dist/src/app.js").default
  const { prisma } = require("../dist/src/config/prisma.js")
  const server = app.listen(0, "127.0.0.1")
  try {
    await once(server, "listening")
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/ready`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: "ok", database: "connected" })
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    await prisma.$disconnect()
  }
})
