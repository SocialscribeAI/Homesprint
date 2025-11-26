import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { phone: '+972501234567' },
    update: {},
    create: {
      phone: '+972501234567',
      email: 'admin@homesprint.com',
      name: 'Admin User',
      role: Role.ADMIN,
      verifiedFlags: { phone_verified: true, email_verified: true },
    },
  })

  // Create sample listers
  const lister1 = await prisma.user.upsert({
    where: { phone: '+972502468135' },
    update: {},
    create: {
      phone: '+972502468135',
      email: 'sarah@homesprint.com',
      name: 'Sarah Cohen',
      role: Role.LISTER,
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true },
    },
  })

  const lister2 = await prisma.user.upsert({
    where: { phone: '+972503579246' },
    update: {},
    create: {
      phone: '+972503579246',
      email: 'david@homesprint.com',
      name: 'David Levy',
      role: Role.LISTER,
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true },
    },
  })

  // Create sample seekers
  const seeker1 = await prisma.user.upsert({
    where: { phone: '+972506843297' },
    update: {},
    create: {
      phone: '+972506843297',
      email: 'maya@homesprint.com',
      name: 'Maya Student',
      role: Role.SEEKER,
      verifiedFlags: { phone_verified: true },
    },
  })

  const seeker2 = await prisma.user.upsert({
    where: { phone: '+972507951468' },
    update: {},
    create: {
      phone: '+972507951468',
      email: 'yossi@homesprint.com',
      name: 'Yossi Professional',
      role: Role.SEEKER,
      verifiedFlags: { phone_verified: true },
    },
  })

  // Create profiles for seekers
  await prisma.profile.upsert({
    where: { userId: seeker1.id },
    update: {},
    create: {
      userId: seeker1.id,
      budgetMin: 3000,
      budgetMax: 4500,
      moveInEarliest: new Date('2024-12-01'),
      moveInLatest: new Date('2025-02-01'),
      areas: ['Rehavia', 'Nachlaot', 'German Colony'],
      occupancyType: 'room',
      lifestyle: {
        smoking: 'no',
        pets: 'cats',
        guests: 'occasionally',
        cleaning: 'somewhat_important',
        noise: 'moderate',
        religion: 'secular'
      },
      bio: 'Hebrew University student looking for a quiet room near campus. Love cats and enjoy cooking.'
    },
  })

  await prisma.profile.upsert({
    where: { userId: seeker2.id },
    update: {},
    create: {
      userId: seeker2.id,
      budgetMin: 5000,
      budgetMax: 7000,
      moveInEarliest: new Date('2024-11-15'),
      moveInLatest: new Date('2025-01-15'),
      areas: ['Talpiot', 'Bakaa', 'Malha'],
      occupancyType: 'apartment',
      lifestyle: {
        smoking: 'no',
        pets: 'no',
        guests: 'frequently',
        cleaning: 'flexible',
        noise: 'moderate',
        religion: 'traditional'
      },
      bio: 'Young professional looking for a spacious apartment. Work in tech and enjoy hosting friends.'
    },
  })

  // Create sample listings
  const listing1 = await prisma.listing.create({
    data: {
      ownerUserId: lister1.id,
      type: 'room',
      address: 'Rehavia 45, Jerusalem',
      neighborhood: 'Rehavia',
      geo: 'POINT(35.2094 31.7714)', // Approximate coordinates
      rent: 3500,
      billsAvg: 300,
      sizeM2: 25,
      rooms: 1,
      bathrooms: 1,
      furnished: true,
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
      accessibility: ['Elevator', 'Wheelchair accessible'],
      policies: {
        smoking: 'no',
        pets: 'cats_allowed',
        guests: 'occasionally',
        cleaning: 'shared_responsibility'
      },
      availableFrom: new Date('2024-12-01'),
      leaseTermMonths: 12,
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
      ],
      description: 'Beautiful furnished room in the heart of Rehavia. Walking distance to Hebrew University and downtown. Shared apartment with 2 other students. Modern kitchen, laundry facilities, and secure building.',
      completeness: 95,
      status: 'active'
    }
  })

  const listing2 = await prisma.listing.create({
    data: {
      ownerUserId: lister2.id,
      type: 'apartment',
      address: 'Beit Hakerem 12, Jerusalem',
      neighborhood: 'Beit Hakerem',
      geo: 'POINT(35.1854 31.7678)',
      rent: 6000,
      billsAvg: 400,
      deposit: 6000,
      sizeM2: 85,
      rooms: 3,
      bathrooms: 2,
      floor: 3,
      elevator: true,
      furnished: false,
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Balcony', 'Parking', 'Storage'],
      accessibility: ['Elevator'],
      policies: {
        smoking: 'no',
        pets: 'no',
        guests: 'frequently_allowed',
        cleaning: 'tenant_responsible'
      },
      availableFrom: new Date('2024-11-20'),
      leaseTermMonths: 24,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
      ],
      description: 'Spacious 3-bedroom apartment in quiet Beit Hakerem neighborhood. Perfect for young professionals or small families. Close to shopping centers and public transport. Renovated kitchen and bathrooms.',
      completeness: 92,
      status: 'active'
    }
  })

  const listing3 = await prisma.listing.create({
    data: {
      ownerUserId: lister1.id,
      type: 'room',
      address: 'Nachlaot 8, Jerusalem',
      neighborhood: 'Nachlaot',
      geo: 'POINT(35.2194 31.7684)',
      rent: 2800,
      billsAvg: 250,
      sizeM2: 18,
      rooms: 1,
      bathrooms: 1,
      furnished: true,
      amenities: ['WiFi', 'Shared Kitchen'],
      accessibility: ['Stairs only'],
      policies: {
        smoking: 'no',
        pets: 'no',
        guests: 'rarely',
        cleaning: 'shared_responsibility'
      },
      availableFrom: new Date('2025-01-01'),
      leaseTermMonths: 6,
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
      ],
      description: 'Cozy room in artistic Nachlaot neighborhood. Perfect for students. Walking distance to Machane Yehuda market and downtown. Shared apartment with creative professionals.',
      completeness: 78,
      status: 'active'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${await prisma.user.count()} users`)
  console.log(`Created ${await prisma.listing.count()} listings`)
  console.log(`Created ${await prisma.profile.count()} profiles`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })