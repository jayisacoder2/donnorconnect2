import { prisma } from '../prisma/client.js'
import { evaluateSegment } from '../src/lib/api/segment-service.js'

async function main() {
  const segments = await prisma.segment.findMany({
    select: { id: true, name: true, rules: true, organizationId: true }
  })

  for (const segment of segments) {
    const { memberCount } = await evaluateSegment({
      organizationId: segment.organizationId,
      rules: segment.rules,
    })
    console.log(`${segment.name}: ${memberCount}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
