import { PrismaClient, AnnouncementStatus, InterestStatus, RequestStatus, RequestResponseStatus, Region } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random number within range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick random element from array
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

async function main() {
  console.log('🌱 Starting medicine-related data seeding...');

  // Get all medicines from database
  console.log('💊 Fetching medicines from database...');
  const medicines = await prisma.medicine.findMany();
  
  if (medicines.length === 0) {
    console.log('❌ No medicines found in database. Please import medicine data first.');
    process.exit(1);
  }
  
  console.log(`✅ Found ${medicines.length} medicines in database`);

  // Get all users
  console.log('👥 Fetching users from database...');
  const pharmacyUsers = await prisma.user.findMany({
    where: { role: { name: 'PHARMACY' } },
    include: { city: true }
  });
  
  const supplierUsers = await prisma.user.findMany({
    where: { role: { name: 'SUPPLIER' } },
    include: { city: true }
  });

  if (pharmacyUsers.length === 0 || supplierUsers.length === 0) {
    console.log('❌ No pharmacy or supplier users found. Please run the first seed script first.');
    process.exit(1);
  }

  console.log(`✅ Found ${pharmacyUsers.length} pharmacy users and ${supplierUsers.length} supplier users`);

  // Create announcements (suppliers announcing available medicines)
  console.log('📢 Creating announcements...');
  const announcementStatuses = [AnnouncementStatus.AVAILABLE, AnnouncementStatus.RESERVED, AnnouncementStatus.EXPIRED];
  const regions = Object.values(Region);
  
  const createdAnnouncements = [];
  const numAnnouncements = Math.min(medicines.length * 0.3, 100); // 30% of medicines or max 100

  for (let i = 0; i < numAnnouncements; i++) {
    const medicine = randomChoice(medicines);
    const supplier = randomChoice(supplierUsers);
    const pharmacy = randomChoice(pharmacyUsers);
    const quantity = randomInt(10, 500);
    const expiryDate = randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2)); // Within 2 years
    const status = randomChoice(announcementStatuses);
    const visibleToSupplier = Math.random() < 0.9; // 90% visible
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());

    const announcement = await prisma.announcement.create({
      data: {
        pharmacyUserId: pharmacy.id,
        supplierUserId: supplier.id,
        medicineId: medicine.id,
        quantity,
        expiryDate,
        visibleToSupplier,
        status,
        createdAt,
      },
    });
    createdAnnouncements.push(announcement);
  }

  console.log(`✅ Created ${createdAnnouncements.length} announcements`);

  // Create interests (pharmacies showing interest in announcements)
  console.log('❤️ Creating interests...');
  const interestStatuses = [InterestStatus.PENDING, InterestStatus.ACCEPTED, InterestStatus.REFUSED];
  
  const createdInterests = [];
  const numInterests = Math.min(createdAnnouncements.length * 0.4, 150); // 40% of announcements or max 150

  for (let i = 0; i < numInterests; i++) {
    const announcement = randomChoice(createdAnnouncements);
    const pharmacy = randomChoice(pharmacyUsers);
    const status = randomChoice(interestStatuses);
    const createdAt = randomDate(announcement.createdAt, new Date());

    // Check if interest already exists
    const existingInterest = await prisma.interest.findUnique({
      where: {
        announcementId_pharmacyUserId: {
          announcementId: announcement.id,
          pharmacyUserId: pharmacy.id,
        },
      },
    });

    if (!existingInterest) {
      const interest = await prisma.interest.create({
        data: {
          announcementId: announcement.id,
          pharmacyUserId: pharmacy.id,
          status,
          createdAt,
        },
      });
      createdInterests.push(interest);
    }
  }

  console.log(`✅ Created ${createdInterests.length} interests`);

  // Create requests (pharmacies requesting medicines)
  console.log('📋 Creating medicine requests...');
  const requestStatuses = [RequestStatus.OPEN, RequestStatus.ACCEPTED, RequestStatus.CLOSED, RequestStatus.EXPIRED];
  
  const createdRequests = [];
  const numRequests = Math.min(medicines.length * 0.2, 80); // 20% of medicines or max 80

  for (let i = 0; i < numRequests; i++) {
    const medicine = randomChoice(medicines);
    const pharmacy = randomChoice(pharmacyUsers);
    const quantity = randomInt(5, 100);
    const status = randomChoice(requestStatuses);
    const region = pharmacy.city?.region || randomChoice(regions);
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());

    const request = await prisma.request.create({
      data: {
        userId: pharmacy.id,
        medicineId: medicine.id,
        quantity,
        status,
        region,
        createdAt,
      },
    });
    createdRequests.push(request);
  }

  console.log(`✅ Created ${createdRequests.length} medicine requests`);

  // Create request responses (pharmacies responding to requests)
  console.log('💬 Creating request responses...');
  const responseStatuses = [RequestResponseStatus.PENDING, RequestResponseStatus.ACCEPTED, RequestResponseStatus.REFUSED];
  
  const createdResponses = [];
  const numResponses = Math.min(createdRequests.length * 0.6, 100); // 60% of requests or max 100

  for (let i = 0; i < numResponses; i++) {
    const request = randomChoice(createdRequests);
    const pharmacy = randomChoice(pharmacyUsers);
    const status = randomChoice(responseStatuses);
    const createdAt = randomDate(request.createdAt, new Date());

    // Check if response already exists
    const existingResponse = await prisma.requestResponse.findUnique({
      where: {
        requestId_pharmacyUserId: {
          requestId: request.id,
          pharmacyUserId: pharmacy.id,
        },
      },
    });

    if (!existingResponse) {
      const response = await prisma.requestResponse.create({
        data: {
          requestId: request.id,
          pharmacyUserId: pharmacy.id,
          status,
          createdAt,
        },
      });
      createdResponses.push(response);
    }
  }

  console.log(`✅ Created ${createdResponses.length} request responses`);

  // Create additional notifications for medicine-related events
  console.log('🔔 Creating medicine-related notifications...');
  const medicineNotificationTitles = [
    'Nouvelle annonce disponible',
    'Intérêt exprimé pour votre annonce',
    'Demande de médicament reçue',
    'Réponse à votre demande',
    'Médicament disponible dans votre région',
    'Annonce expirée',
    'Demande acceptée',
    'Intérêt accepté',
  ];
  const medicineNotificationMessages = [
    'Un nouveau médicament est disponible dans votre région.',
    'Une pharmacie a exprimé son intérêt pour votre annonce.',
    'Vous avez reçu une nouvelle demande de médicament.',
    'Une pharmacie a répondu à votre demande.',
    'Le médicament que vous cherchez est maintenant disponible.',
    'Votre annonce a expiré.',
    'Votre demande a été acceptée.',
    'Votre intérêt a été accepté par le fournisseur.',
  ];

  for (const user of [...pharmacyUsers, ...supplierUsers]) {
    const numNotifications = randomInt(2, 6);
    for (let i = 0; i < numNotifications; i++) {
      const title = randomChoice(medicineNotificationTitles);
      const message = randomChoice(medicineNotificationMessages);
      const isRead = Math.random() < 0.6; // 60% chance of being read
      const isImportant = Math.random() < 0.3; // 30% chance of being important
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());

      await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type: 'INTEREST',
          isRead,
          isImportant,
          createdAt,
        },
      });
    }
  }

  console.log('✅ Medicine-related notifications created successfully');

  // Create additional audit logs for medicine-related actions
  console.log('📝 Creating medicine-related audit logs...');
  const medicineAuditActions = [
    'CREATE_ANNOUNCEMENT',
    'UPDATE_ANNOUNCEMENT',
    'DELETE_ANNOUNCEMENT',
    'VIEW_ANNOUNCEMENT',
    'CREATE_INTEREST',
    'UPDATE_INTEREST',
    'CREATE_REQUEST',
    'UPDATE_REQUEST',
    'RESPOND_TO_REQUEST',
    'VIEW_MEDICINE',
    'SEARCH_MEDICINE',
    'EXPORT_MEDICINE_DATA',
  ];

  for (const user of [...pharmacyUsers, ...supplierUsers]) {
    const numLogs = randomInt(5, 15);
    for (let i = 0; i < numLogs; i++) {
      const action = randomChoice(medicineAuditActions);
      const entityId = randomInt(1, 1000).toString();
      const details = {
        ip: `192.168.1.${randomInt(1, 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date().toISOString(),
        medicineId: randomChoice(medicines).id,
      };
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action,
          entityType: 'Medicine',
          entityId,
          details,
          createdAt,
        },
      });
    }
  }

  console.log('✅ Medicine-related audit logs created successfully');

  console.log('🎉 Medicine-related data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${createdAnnouncements.length} announcements created`);
  console.log(`- ${createdInterests.length} interests created`);
  console.log(`- ${createdRequests.length} medicine requests created`);
  console.log(`- ${createdResponses.length} request responses created`);
  console.log(`- Additional notifications for medicine events`);
  console.log(`- Medicine-related audit logs`);
  console.log('\n💡 The system now has realistic medicine trading data for comprehensive testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error during medicine data seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
