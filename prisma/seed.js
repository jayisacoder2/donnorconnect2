// Seed script for DonorConnect database
// Creates realistic test data: organizations, users, donors, donations, campaigns, etc.

import prisma from './client.js'
import bcrypt from 'bcryptjs'

// Helper: Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper: Pick random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.activityLog.deleteMany()
  await prisma.workflowExecution.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.segmentMember.deleteMany()
  await prisma.segment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.donor.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create 2 Organizations
  console.log('🏢 Creating organizations...')
  const org1 = await prisma.organization.create({
    data: { 
      name: 'Hope Foundation',
      slug: 'hope-foundation',
      description: 'Empowering communities through education and support programs.',
      website: 'https://hopefoundation.org',
      isPublic: true
    }
  })

  const org2 = await prisma.organization.create({
    data: { 
      name: 'Community Care Network',
      slug: 'community-care',
      description: 'Providing essential services to families in need.',
      website: 'https://communitycare.org',
      isPublic: true
    }
  })

  // Create 5 Users per organization
  console.log('👥 Creating users...')
  const users = await Promise.all([
    // Org 1 users
    prisma.user.create({
      data: {
        email: 'admin@hopefoundation.org',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Admin',
        role: 'ADMIN',
        organizationId: org1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'john.staff@hopefoundation.org',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'STAFF',
        organizationId: org1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'mary.staff@hopefoundation.org',
        password: hashedPassword,
        firstName: 'Mary',
        lastName: 'Johnson',
        role: 'STAFF',
        organizationId: org1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'marketing@hopefoundation.org',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Marketing',
        role: 'MARKETING',
        organizationId: org1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'readonly@hopefoundation.org',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Viewer',
        role: 'READONLY',
        organizationId: org1.id
      }
    }),
    // Org 2 users
    prisma.user.create({
      data: {
        email: 'admin@ccnetwork.org',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Director',
        role: 'ADMIN',
        organizationId: org2.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'staff1@ccnetwork.org',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'STAFF',
        organizationId: org2.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'staff2@ccnetwork.org',
        password: hashedPassword,
        firstName: 'Jennifer',
        lastName: 'Brown',
        role: 'STAFF',
        organizationId: org2.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'marketing@ccnetwork.org',
        password: hashedPassword,
        firstName: 'Tom',
        lastName: 'Marketing',
        role: 'MARKETING',
        organizationId: org2.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'readonly@ccnetwork.org',
        password: hashedPassword,
        firstName: 'Susan',
        lastName: 'Viewer',
        role: 'READONLY',
        organizationId: org2.id
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create Campaigns (5-8 per org)
  console.log('📢 Creating campaigns...')
  const campaigns = await Promise.all([
    // Org 1 campaigns
    prisma.campaign.create({
      data: {
        name: 'Annual Fund 2024',
        description: 'Year-end annual fund drive',
        goal: 100000,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        type: 'Annual Fund',
        status: 'ACTIVE',
        organizationId: org1.id
      }
    }),
    prisma.campaign.create({
      data: {
        name: 'Spring Gala',
        description: 'Annual spring fundraising gala',
        goal: 50000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-05-15'),
        type: 'Event',
        status: 'COMPLETED',
        organizationId: org1.id
      }
    }),
    prisma.campaign.create({
      data: {
        name: 'Monthly Giving Program',
        description: 'Sustaining donor program',
        goal: 25000,
        startDate: new Date('2024-01-01'),
        endDate: null,
        type: 'Recurring',
        status: 'ACTIVE',
        organizationId: org1.id
      }
    }),
    prisma.campaign.create({
      data: {
        name: 'Capital Campaign',
        description: 'New building fund',
        goal: 500000,
        startDate: new Date('2023-06-01'),
        endDate: new Date('2025-06-01'),
        type: 'Capital',
        status: 'ACTIVE',
        organizationId: org1.id
      }
    }),
    // Org 2 campaigns
    prisma.campaign.create({
      data: {
        name: 'Year-End Appeal 2024',
        description: 'December giving campaign',
        goal: 75000,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        type: 'Annual Fund',
        status: 'ACTIVE',
        organizationId: org2.id
      }
    }),
    prisma.campaign.create({
      data: {
        name: 'Community Walk 2024',
        description: 'Annual walk-a-thon',
        goal: 30000,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-15'),
        type: 'Event',
        status: 'COMPLETED',
        organizationId: org2.id
      }
    }),
    prisma.campaign.create({
      data: {
        name: 'Holiday Giving',
        description: 'Holiday season campaign',
        goal: 40000,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2025-01-05'),
        type: 'Annual Fund',
        status: 'ACTIVE',
        organizationId: org2.id
      }
    })
  ])

  console.log(`✅ Created ${campaigns.length} campaigns`)

  // Create Donors with varied profiles
  console.log('💝 Creating donors...')

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
    'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle']

  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego']
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA']

  // Personalized notes for donors to give AI more context
  const donorNotes = [
    'Board member introduced this donor at the spring gala. Very passionate about education programs.',
    'Prefers email communication only. Works in healthcare and interested in community health initiatives.',
    'Long-time volunteer before becoming a donor. Knows several staff members personally.',
    'Corporate match eligible through employer. Reminder to send matching gift forms.',
    'Attended our open house last fall. Expressed interest in planned giving.',
    'Connected through local church group. Prefers to give during holiday season.',
    'Met at community event. Has connections to local business community.',
    'Referred by existing major donor. Interested in capital campaign.',
    'Monthly donor prospect - mentioned interest in recurring giving.',
    'Prefers phone calls over email. Best reached in evenings.',
    'Recently retired teacher. Passionate about youth programs.',
    'Small business owner. May be interested in corporate sponsorship.',
    'Has given to similar organizations. Moved to area recently.',
    'Attended memorial service for founder. Emotional connection to mission.',
    'LinkedIn connection with ED. Works in nonprofit consulting.',
    'Gave first gift in memory of family member. Send anniversary acknowledgment.',
    'Active on social media. Shares our posts frequently.',
    'Volunteers at local food bank. Interested in hunger initiatives.',
    'Former program participant. Now wants to give back.',
    'Attends annual events regularly. Brings guests who also donate.',
    'Requested tour of facilities. Very detail-oriented.',
    'Donor advised fund holder. Prefers year-end giving.',
    'Young professional. Engaged through workplace giving program.',
    'Snowbird - winters in Florida. Adjust mailing address seasonally.',
    'Interested in naming opportunities for new building.',
    'Prefers to remain anonymous in donor listings.',
    'Has included us in estate plans. Confirm legacy society membership.',
    'Gave after reading newsletter story. Responds to impact stories.',
    'Child participated in summer program. Parent became donor.',
    'Local realtor. Good community connector.',
    null, // Some donors have no notes
    null,
    'Doctor at regional hospital. Limited availability during weekdays.',
    'Retired military. Appreciates formal communication style.',
    'Artist and gallery owner. Interested in arts programming.',
    'Environmental advocate. Interested in sustainability initiatives.',
    null,
    'College professor. Could be good speaker for events.',
    'Recently widowed. Be sensitive in communications.',
    'Tech industry. Comfortable with online giving.',
    null,
    'Moved from out of state. New to community.',
    'Local politician. Handle with discretion.',
    'Faith-based motivation for giving. Quotes scripture in correspondence.',
    null,
    'Sports enthusiast. Interested in youth athletics programs.',
    'Pet lover. Responds to animal-related appeals.',
    'History buff. Interested in organization heritage.',
    null,
    'Accountant. Asks detailed questions about financials.',
    'Works night shift. Call in afternoons only.',
    'Large family. Interested in family volunteer opportunities.',
    null,
    'Union member. Workplace campaign participant.',
    'Frequent traveler. Best reached by email.',
    'Health challenges. Send get-well card when appropriate.',
    null,
    'Very private. Do not share info publicly.',
    'Enthusiastic supporter. Good candidate for testimonial.',
    'New homeowner in area. Welcome packet sent.',
  ]

  const donors = []
  for (let i = 0; i < 75; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const org = i < 40 ? org1 : org2 // 40 for org1, 35 for org2
    const notes = donorNotes[i % donorNotes.length]

    const donor = await prisma.donor.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: randomItem(cities),
        state: randomItem(states),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        notes,
        status: 'ACTIVE',
        retentionRisk: 'UNKNOWN', // Will be updated based on donations
        organizationId: org.id
      }
    })
    donors.push(donor)
  }

  console.log(`✅ Created ${donors.length} donors`)

  // Create Donations with distribution:
  // - 40% first-time (1 donation, 60+ days ago) → HIGH risk
  // - 30% two-gift (2 donations) → MEDIUM risk
  // - 20% loyal (3-6 donations) → LOW risk
  // - 10% lapsed (1+ donation, 12+ months ago) → CRITICAL risk

  console.log('💰 Creating donations...')

  const now = new Date()
  const oneMonth = new Date(now); oneMonth.setMonth(oneMonth.getMonth() - 1)
  const twoMonths = new Date(now); twoMonths.setMonth(twoMonths.getMonth() - 2)
  const sixtyDays = new Date(now); sixtyDays.setDate(sixtyDays.getDate() - 60)
  const sixMonths = new Date(now); sixMonths.setMonth(sixMonths.getMonth() - 6)
  const twelveMonths = new Date(now); twelveMonths.setMonth(twelveMonths.getMonth() - 12)
  const eighteenMonths = new Date(now); eighteenMonths.setMonth(eighteenMonths.getMonth() - 18)

  let donationCount = 0

  // First-time donors (40%) - 1 donation, 60+ days ago, HIGH risk
  for (let i = 0; i < Math.floor(donors.length * 0.4); i++) {
    const donor = donors[i]
    const amount = Math.floor(Math.random() * 400) + 50
    const date = randomDate(sixtyDays, sixMonths)
    const campaign = campaigns.find(c => c.organizationId === donor.organizationId)

    await prisma.donation.create({
      data: {
        donorId: donor.id,
        campaignId: campaign?.id,
        amount,
        date,
        type: 'ONE_TIME',
        method: randomItem(['Credit Card', 'Check', 'PayPal', 'Wire'])
      }
    })

    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        totalGifts: 1,
        totalAmount: amount,
        firstGiftDate: date,
        lastGiftDate: date,
        retentionRisk: 'HIGH'
      }
    })
    donationCount++
  }

  // Two-gift donors (30%) - 2 donations, MEDIUM risk
  const twoGiftStart = Math.floor(donors.length * 0.4)
  const twoGiftEnd = Math.floor(donors.length * 0.7)
  for (let i = twoGiftStart; i < twoGiftEnd; i++) {
    const donor = donors[i]
    const campaign = campaigns.find(c => c.organizationId === donor.organizationId)

    // First donation (older)
    const amount1 = Math.floor(Math.random() * 300) + 50
    const date1 = randomDate(sixMonths, twelveMonths)

    await prisma.donation.create({
      data: {
        donorId: donor.id,
        campaignId: campaign?.id,
        amount: amount1,
        date: date1,
        type: 'ONE_TIME',
        method: randomItem(['Credit Card', 'Check', 'PayPal'])
      }
    })

    // Second donation (recent)
    const amount2 = Math.floor(Math.random() * 300) + 50
    const date2 = randomDate(twoMonths, oneMonth)

    await prisma.donation.create({
      data: {
        donorId: donor.id,
        campaignId: campaign?.id,
        amount: amount2,
        date: date2,
        type: 'ONE_TIME',
        method: randomItem(['Credit Card', 'Check', 'PayPal'])
      }
    })

    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        totalGifts: 2,
        totalAmount: amount1 + amount2,
        firstGiftDate: date1,
        lastGiftDate: date2,
        retentionRisk: 'MEDIUM'
      }
    })
    donationCount += 2
  }

  // Loyal donors (20%) - 3-6 donations, LOW risk
  const loyalStart = Math.floor(donors.length * 0.7)
  const loyalEnd = Math.floor(donors.length * 0.9)
  for (let i = loyalStart; i < loyalEnd; i++) {
    const donor = donors[i]
    const campaign = campaigns.find(c => c.organizationId === donor.organizationId)
    const numDonations = Math.floor(Math.random() * 4) + 3 // 3-6 donations

    let totalAmount = 0
    let firstDate = null
    let lastDate = null

    for (let j = 0; j < numDonations; j++) {
      const amount = Math.floor(Math.random() * 500) + 100
      const monthsAgo = Math.floor(Math.random() * 12) + 1
      const date = new Date(now)
      date.setMonth(date.getMonth() - monthsAgo)

      await prisma.donation.create({
        data: {
          donorId: donor.id,
          campaignId: campaign?.id,
          amount,
          date,
          type: j % 3 === 0 ? 'RECURRING' : 'ONE_TIME',
          method: randomItem(['Credit Card', 'Check', 'PayPal', 'Wire'])
        }
      })

      totalAmount += amount
      if (!firstDate || date < firstDate) firstDate = date
      if (!lastDate || date > lastDate) lastDate = date
      donationCount++
    }

    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        totalGifts: numDonations,
        totalAmount,
        firstGiftDate: firstDate,
        lastGiftDate: lastDate,
        retentionRisk: 'LOW'
      }
    })
  }

  // Lapsed donors (10%) - 1+ donation, 12+ months ago, CRITICAL risk
  const lapsedStart = Math.floor(donors.length * 0.9)
  for (let i = lapsedStart; i < donors.length; i++) {
    const donor = donors[i]
    const campaign = campaigns.find(c => c.organizationId === donor.organizationId)

    const amount = Math.floor(Math.random() * 500) + 100
    const date = randomDate(twelveMonths, eighteenMonths)

    await prisma.donation.create({
      data: {
        donorId: donor.id,
        campaignId: campaign?.id,
        amount,
        date,
        type: 'ONE_TIME',
        method: randomItem(['Credit Card', 'Check'])
      }
    })

    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        totalGifts: 1,
        totalAmount: amount,
        firstGiftDate: date,
        lastGiftDate: date,
        retentionRisk: 'CRITICAL',
        status: 'LAPSED'
      }
    })
    donationCount++
  }

  console.log(`✅ Created ${donationCount} donations`)

  // Create Interactions (emails, calls, meetings)
  console.log('📧 Creating interactions...')
  let interactionCount = 0
  for (let i = 0; i < 120; i++) {
    const donor = randomItem(donors)
    const type = randomItem(['EMAIL', 'PHONE_CALL', 'MEETING', 'NOTE'])
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    await prisma.interaction.create({
      data: {
        donorId: donor.id,
        type,
        subject: type === 'EMAIL' ? 'Thank you for your support' :
                 type === 'PHONE_CALL' ? 'Follow-up call' :
                 type === 'MEETING' ? 'Coffee meeting' : 'General note',
        notes: 'This is a sample interaction note',
        date
      }
    })
    interactionCount++
  }
  console.log(`✅ Created ${interactionCount} interactions`)

  // Create Segments
  console.log('📊 Creating segments...')
  const segments = await Promise.all([
    prisma.segment.create({
      data: {
        name: 'First-Time Donors',
        description: 'Donors who have given exactly once',
        rules: { field: 'totalGifts', operator: 'equals', value: 1 },
        organizationId: org1.id,
        memberCount: 0
      }
    }),
    prisma.segment.create({
      data: {
        name: 'High-Risk Retention',
        description: 'Donors at high or critical retention risk',
        rules: { field: 'retentionRisk', operator: 'in', value: ['HIGH', 'CRITICAL'] },
        organizationId: org1.id,
        memberCount: 0
      }
    }),
    prisma.segment.create({
      data: {
        name: 'Major Donors',
        description: 'Donors who have given $1000 or more total',
        rules: { field: 'totalAmount', operator: 'greaterThan', value: 1000 },
        organizationId: org1.id,
        memberCount: 0
      }
    }),
    prisma.segment.create({
      data: {
        name: 'Lapsed Donors',
        description: 'Donors who have not given in 12+ months',
        rules: { field: 'status', operator: 'equals', value: 'LAPSED' },
        organizationId: org1.id,
        memberCount: 0
      }
    }),
    prisma.segment.create({
      data: {
        name: 'Active Recurring Donors',
        description: 'Donors with recurring gifts',
        rules: { field: 'hasRecurring', operator: 'equals', value: true },
        organizationId: org2.id,
        memberCount: 0
      }
    })
  ])
  console.log(`✅ Created ${segments.length} segments`)

  // Create Workflows
  console.log('⚙️ Creating workflows...')
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: 'First Gift Follow-Up',
        description: 'Automated thank you and engagement workflow for first-time donors',
        trigger: 'FIRST_DONATION',
        steps: [
          { type: 'email', delay: 1, subject: 'Thank you for your first gift!' },
          { type: 'task', delay: 7, action: 'Call to introduce organization' },
          { type: 'email', delay: 30, subject: 'Impact story: See your gift in action' }
        ],
        isActive: true,
        organizationId: org1.id
      }
    }),
    prisma.workflow.create({
      data: {
        name: 'Second Gift Journey',
        description: 'Encourage second gift within 60 days',
        trigger: 'DONATION_RECEIVED',
        steps: [
          { type: 'wait', delay: 45 },
          { type: 'task', action: 'Send personalized appeal for second gift' },
          { type: 'email', delay: 60, subject: 'Will you give again?' }
        ],
        isActive: true,
        organizationId: org1.id
      }
    }),
    prisma.workflow.create({
      data: {
        name: 'Lapsed Donor Re-engagement',
        description: 'Win back donors who have not given in 12+ months',
        trigger: 'INACTIVITY_THRESHOLD',
        steps: [
          { type: 'email', delay: 0, subject: 'We miss you!' },
          { type: 'task', delay: 14, action: 'Personal outreach call' }
        ],
        isActive: false,
        organizationId: org1.id
      }
    })
  ])
  console.log(`✅ Created ${workflows.length} workflows`)

  // Create Tasks
  console.log('✅ Creating tasks...')
  const staffUsers = users.filter(u => u.role === 'STAFF' || u.role === 'ADMIN')
  const org1Donors = donors.filter(d => d.organizationId === org1.id)
  const org1Staff = staffUsers.filter(u => u.organizationId === org1.id)
  
  const taskTemplates = [
    { title: 'Follow up on recent donation', desc: 'Send personalized thank you and share impact story', priority: 'HIGH' },
    { title: 'Schedule coffee meeting', desc: 'Meet to discuss increased giving and upcoming campaign', priority: 'MEDIUM' },
    { title: 'Send thank you note', desc: 'Handwritten note acknowledging their support', priority: 'LOW' },
    { title: 'Call to discuss recurring giving', desc: 'Introduce monthly giving program and benefits', priority: 'HIGH' },
    { title: 'Introduce to board member', desc: 'Connect donor with board member in their industry', priority: 'MEDIUM' },
    { title: 'Send annual report', desc: 'Mail physical copy with personal note from ED', priority: 'LOW' },
    { title: 'Invite to donor appreciation event', desc: 'Add to guest list for spring gala', priority: 'MEDIUM' },
    { title: 'Update donor record', desc: 'Verify contact information and preferences', priority: 'LOW' },
    { title: 'Request testimonial', desc: 'Ask for story about why they give', priority: 'MEDIUM' },
    { title: 'Site visit coordination', desc: 'Arrange tour of program facilities', priority: 'HIGH' },
    { title: 'Lapsed donor outreach', desc: 'Personal call to re-engage after 18 months', priority: 'URGENT' },
    { title: 'Major gift proposal', desc: 'Prepare and present $10k+ giving opportunity', priority: 'URGENT' },
    { title: 'Birthday card', desc: 'Send birthday wishes and small gift', priority: 'LOW' },
    { title: 'Email campaign follow-up', desc: 'Check if they received and opened appeal', priority: 'MEDIUM' },
    { title: 'Grant reporting', desc: 'Provide update on funded project outcomes', priority: 'HIGH' },
  ]

  const tasks = []
  for (let i = 0; i < 25; i++) {
    const donor = randomItem(org1Donors)
    const assignedUser = randomItem(org1Staff)
    const template = randomItem(taskTemplates)
    
    // Weight status toward active tasks (more TODO/IN_PROGRESS than COMPLETED)
    const statusWeights = ['TODO', 'TODO', 'TODO', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED']
    const status = randomItem(statusWeights)
    
    // Some tasks overdue, some upcoming, some completed
    let daysOffset
    if (status === 'COMPLETED') {
      daysOffset = Math.floor(Math.random() * -30) // Completed in past 30 days
    } else {
      daysOffset = Math.floor(Math.random() * 20) - 5 // Range from 5 days ago to 15 days ahead
    }
    
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + daysOffset)

    const task = await prisma.task.create({
      data: {
        donorId: donor.id,
        assignedTo: assignedUser.id,
        title: template.title,
        description: template.desc,
        status,
        priority: template.priority,
        dueDate,
        completedAt: status === 'COMPLETED' ? randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now) : null
      }
    })
    tasks.push(task)
  }
  console.log(`✅ Created ${tasks.length} tasks`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${await prisma.organization.count()} organizations`)
  console.log(`   - ${await prisma.user.count()} users`)
  console.log(`   - ${await prisma.donor.count()} donors`)
  console.log(`   - ${await prisma.donation.count()} donations`)
  console.log(`   - ${await prisma.campaign.count()} campaigns`)
  console.log(`   - ${await prisma.interaction.count()} interactions`)
  console.log(`   - ${await prisma.segment.count()} segments`)
  console.log(`   - ${await prisma.workflow.count()} workflows`)
  console.log(`   - ${await prisma.task.count()} tasks`)
  console.log('\n👤 Test Login:')
  console.log('   Email: admin@hopefoundation.org')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
