import { PrismaClient, RoleType, Region, SubscriptionStatus, NotificationType, SupportTicketStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

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
  console.log('🌱 Starting comprehensive database seeding...');

  // Seed Roles
  console.log('📋 Seeding roles...');
  const roles = [
    { name: RoleType.ADMIN },
    { name: RoleType.PHARMACY },
    { name: RoleType.SUPPLIER },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded successfully');

  // Seed Cities across different regions
  console.log('🏙️ Seeding cities across Tunisian regions...');
  const citiesData = [
    // Tunis region
    { name: 'Tunis', region: Region.TUNIS },
    { name: 'Carthage', region: Region.TUNIS },
    { name: 'Sidi Bou Said', region: Region.TUNIS },
    { name: 'La Marsa', region: Region.TUNIS },
    
    // Ariana region
    { name: 'Ariana', region: Region.ARIANA },
    { name: 'La Soukra', region: Region.ARIANA },
    { name: 'Raoued', region: Region.ARIANA },
    
    // Ben Arous region
    { name: 'Ben Arous', region: Region.BEN_AROUS },
    { name: 'Rades', region: Region.BEN_AROUS },
    { name: 'Hammam Lif', region: Region.BEN_AROUS },
    
    // Sousse region
    { name: 'Sousse', region: Region.SOUSSE },
    { name: 'Monastir', region: Region.MONASTIR },
    { name: 'Mahdia', region: Region.MAHDIA },
    { name: 'Kairouan', region: Region.KAIROUAN },
    
    // Sfax region
    { name: 'Sfax', region: Region.SFAX },
    { name: 'Gabès', region: Region.GABES },
    { name: 'Médenine', region: Region.MEDENINE },
    
    // Northern regions
    { name: 'Bizerte', region: Region.BIZERTE },
    { name: 'Nabeul', region: Region.NABEUL },
    { name: 'Zaghouan', region: Region.ZAGHOUAN },
    
    // Central regions
    { name: 'Béja', region: Region.BEJA },
    { name: 'Jendouba', region: Region.JENDOUBA },
    { name: 'Kef', region: Region.KEF },
    { name: 'Siliana', region: Region.SILIANA },
    
    // Southern regions
    { name: 'Kasserine', region: Region.KASSERINE },
    { name: 'Sidi Bouzid', region: Region.SIDI_BOUZID },
    { name: 'Gafsa', region: Region.GAFSA },
    { name: 'Tozeur', region: Region.TOZEUR },
    { name: 'Kébili', region: Region.KEBILI },
    { name: 'Tataouine', region: Region.TATAOUINE },
  ];

  const createdCities = [];
  for (const cityData of citiesData) {
    const city = await prisma.city.upsert({
      where: { 
        name_region: { 
          name: cityData.name, 
          region: cityData.region 
        } 
      },
      update: {},
      create: cityData,
    });
    createdCities.push(city);
  }
  console.log(`✅ ${createdCities.length} cities seeded successfully`);

  // Get roles for user creation
  const adminRole = await prisma.role.findUnique({ where: { name: RoleType.ADMIN } });
  const pharmacyRole = await prisma.role.findUnique({ where: { name: RoleType.PHARMACY } });
  const supplierRole = await prisma.role.findUnique({ where: { name: RoleType.SUPPLIER } });

  if (!adminRole || !pharmacyRole || !supplierRole) {
    throw new Error('Roles not found');
  }

  // Hash passwords
  const saltRounds = 12;
  const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);

  // Create multiple users
  console.log('👥 Creating multiple test users...');
  
  // Admin users
  const adminUsers = [
    {
      name: 'System Administrator',
      email: 'admin@pharmacie.tn',
      phone: '+216 71 000 000',
      address: '123 Admin Street, Tunis',
      cityId: createdCities.find(c => c.name === 'Tunis')?.id || null,
    },
    {
      name: 'Regional Admin Sousse',
      email: 'admin.sousse@pharmacie.tn',
      phone: '+216 73 000 000',
      address: '456 Avenue Habib Bourguiba, Sousse',
      cityId: createdCities.find(c => c.name === 'Sousse')?.id || null,
    }
  ];

  for (const userData of adminUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash: defaultPasswordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    });
  }

  // Pharmacy users (20 pharmacies across different regions)
  const pharmacyUsers = [
    { name: 'Pharmacie Carthage', email: 'pharmacy.carthage@pharmacie.tn', phone: '+216 71 123 456', address: '456 Avenue Habib Bourguiba, Carthage', city: 'Carthage' },
    { name: 'Pharmacie Tunis Centre', email: 'pharmacy.tunis@pharmacie.tn', phone: '+216 71 234 567', address: '123 Avenue de France, Tunis', city: 'Tunis' },
    { name: 'Pharmacie Sidi Bou Said', email: 'pharmacy.sbs@pharmacie.tn', phone: '+216 71 345 678', address: '789 Rue Sidi Bou Said', city: 'Sidi Bou Said' },
    { name: 'Pharmacie La Marsa', email: 'pharmacy.marsa@pharmacie.tn', phone: '+216 71 456 789', address: '321 Corniche La Marsa', city: 'La Marsa' },
    { name: 'Pharmacie Ariana', email: 'pharmacy.ariana@pharmacie.tn', phone: '+216 71 567 890', address: '654 Avenue de la République, Ariana', city: 'Ariana' },
    { name: 'Pharmacie Ben Arous', email: 'pharmacy.benarous@pharmacie.tn', phone: '+216 71 678 901', address: '987 Rue de la Santé, Ben Arous', city: 'Ben Arous' },
    { name: 'Pharmacie Rades', email: 'pharmacy.rades@pharmacie.tn', phone: '+216 71 789 012', address: '147 Avenue de l\'Indépendance, Rades', city: 'Rades' },
    { name: 'Pharmacie Sousse Centre', email: 'pharmacy.sousse@pharmacie.tn', phone: '+216 73 123 456', address: '258 Avenue Habib Bourguiba, Sousse', city: 'Sousse' },
    { name: 'Pharmacie Monastir', email: 'pharmacy.monastir@pharmacie.tn', phone: '+216 73 234 567', address: '369 Rue de la République, Monastir', city: 'Monastir' },
    { name: 'Pharmacie Mahdia', email: 'pharmacy.mahdia@pharmacie.tn', phone: '+216 73 345 678', address: '741 Avenue Farhat Hached, Mahdia', city: 'Mahdia' },
    { name: 'Pharmacie Kairouan', email: 'pharmacy.kairouan@pharmacie.tn', phone: '+216 77 123 456', address: '852 Rue Ali Belhouane, Kairouan', city: 'Kairouan' },
    { name: 'Pharmacie Sfax Centre', email: 'pharmacy.sfax@pharmacie.tn', phone: '+216 74 123 456', address: '963 Avenue Habib Bourguiba, Sfax', city: 'Sfax' },
    { name: 'Pharmacie Gabès', email: 'pharmacy.gabes@pharmacie.tn', phone: '+216 75 123 456', address: '159 Rue de la République, Gabès', city: 'Gabès' },
    { name: 'Pharmacie Bizerte', email: 'pharmacy.bizerte@pharmacie.tn', phone: '+216 72 123 456', address: '357 Avenue de l\'Indépendance, Bizerte', city: 'Bizerte' },
    { name: 'Pharmacie Nabeul', email: 'pharmacy.nabeul@pharmacie.tn', phone: '+216 72 234 567', address: '468 Rue de la République, Nabeul', city: 'Nabeul' },
    { name: 'Pharmacie Béja', email: 'pharmacy.beja@pharmacie.tn', phone: '+216 78 123 456', address: '579 Avenue Habib Bourguiba, Béja', city: 'Béja' },
    { name: 'Pharmacie Jendouba', email: 'pharmacy.jendouba@pharmacie.tn', phone: '+216 78 234 567', address: '680 Rue de la Santé, Jendouba', city: 'Jendouba' },
    { name: 'Pharmacie Kef', email: 'pharmacy.kef@pharmacie.tn', phone: '+216 78 345 678', address: '791 Avenue de l\'Indépendance, Kef', city: 'Kef' },
    { name: 'Pharmacie Gafsa', email: 'pharmacy.gafsa@pharmacie.tn', phone: '+216 76 123 456', address: '802 Rue de la République, Gafsa', city: 'Gafsa' },
    { name: 'Pharmacie Tozeur', email: 'pharmacy.tozeur@pharmacie.tn', phone: '+216 76 234 567', address: '913 Avenue Habib Bourguiba, Tozeur', city: 'Tozeur' },
  ];

  const createdPharmacyUsers = [];
  for (const userData of pharmacyUsers) {
    const city = createdCities.find(c => c.name === userData.city);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash: defaultPasswordHash,
        phone: userData.phone,
        address: userData.address,
        cityId: city?.id || null,
        roleId: pharmacyRole.id,
        isActive: true,
      },
    });
    createdPharmacyUsers.push(user);
  }

  // Supplier users (10 suppliers)
  const supplierUsers = [
    { name: 'Fournisseur Médical Plus', email: 'supplier.medical@pharmacie.tn', phone: '+216 71 789 012', address: '789 Rue du Commerce, Tunis', city: 'Tunis' },
    { name: 'Distributeur Santé Tunisie', email: 'supplier.sante@pharmacie.tn', phone: '+216 71 890 123', address: '456 Avenue de la Santé, Tunis', city: 'Tunis' },
    { name: 'Importateur Médicaments', email: 'supplier.import@pharmacie.tn', phone: '+216 73 456 789', address: '123 Avenue de l\'Industrie, Sousse', city: 'Sousse' },
    { name: 'Grossiste Pharmaceutique', email: 'supplier.grossiste@pharmacie.tn', phone: '+216 74 567 890', address: '789 Rue de la Pharmacie, Sfax', city: 'Sfax' },
    { name: 'Distributeur Central', email: 'supplier.central@pharmacie.tn', phone: '+216 72 678 901', address: '321 Avenue Centrale, Bizerte', city: 'Bizerte' },
    { name: 'Médicaments Express', email: 'supplier.express@pharmacie.tn', phone: '+216 75 789 012', address: '654 Rue Express, Gabès', city: 'Gabès' },
    { name: 'Pharma Distribution', email: 'supplier.pharma@pharmacie.tn', phone: '+216 78 890 123', address: '987 Avenue Pharma, Béja', city: 'Béja' },
    { name: 'Santé Plus Distribution', email: 'supplier.santeplus@pharmacie.tn', phone: '+216 76 901 234', address: '147 Rue Santé Plus, Gafsa', city: 'Gafsa' },
    { name: 'Médicaments du Sud', email: 'supplier.sud@pharmacie.tn', phone: '+216 76 012 345', address: '258 Avenue du Sud, Tozeur', city: 'Tozeur' },
    { name: 'Distributeur National', email: 'supplier.national@pharmacie.tn', phone: '+216 71 123 789', address: '369 Rue Nationale, Tunis', city: 'Tunis' },
  ];

  const createdSupplierUsers = [];
  for (const userData of supplierUsers) {
    const city = createdCities.find(c => c.name === userData.city);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash: defaultPasswordHash,
        phone: userData.phone,
        address: userData.address,
        cityId: city?.id || null,
        roleId: supplierRole.id,
        isActive: true,
      },
    });
    createdSupplierUsers.push(user);
  }

  console.log(`✅ Created ${adminUsers.length} admin users, ${createdPharmacyUsers.length} pharmacy users, ${createdSupplierUsers.length} supplier users`);

  // Create subscriptions for users
  console.log('💳 Creating subscriptions...');
  const subscriptionStatuses = [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED];
  
  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const status = randomChoice(subscriptionStatuses);
    const startDate = randomDate(new Date(2024, 0, 1), new Date());
    const endDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year later

    await prisma.subscription.create({
      data: {
        userId: user.id,
        startDate,
        endDate,
        status,
      },
    });
  }
  console.log('✅ Subscriptions created successfully');

  // Create notifications
  console.log('🔔 Creating notifications...');
  const notificationTypes = [NotificationType.INTEREST, NotificationType.REQUEST, NotificationType.SUBSCRIPTION, NotificationType.SYSTEM, NotificationType.RETOUR];
  const notificationTitles = [
    'Nouvelle demande d\'intérêt',
    'Demande de médicament reçue',
    'Abonnement expiré',
    'Mise à jour système',
    'Retour de médicament accepté',
    'Nouvelle annonce disponible',
    'Demande traitée',
    'Rappel d\'abonnement',
  ];
  const notificationMessages = [
    'Vous avez reçu une nouvelle demande d\'intérêt pour votre annonce.',
    'Une nouvelle demande de médicament a été créée dans votre région.',
    'Votre abonnement expire bientôt. Renouvelez-le pour continuer à utiliser nos services.',
    'Une mise à jour importante du système est disponible.',
    'Votre demande de retour de médicament a été acceptée.',
    'De nouveaux médicaments sont disponibles dans votre région.',
    'Votre demande a été traitée avec succès.',
    'N\'oubliez pas de renouveler votre abonnement.',
  ];

  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const numNotifications = randomInt(3, 8);
    for (let i = 0; i < numNotifications; i++) {
      const type = randomChoice(notificationTypes);
      const title = randomChoice(notificationTitles);
      const message = randomChoice(notificationMessages);
      const isRead = Math.random() < 0.7; // 70% chance of being read
      const isImportant = Math.random() < 0.2; // 20% chance of being important
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());

      await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type,
          isRead,
          isImportant,
          createdAt,
        },
      });
    }
  }
  console.log('✅ Notifications created successfully');

  // Create support tickets
  console.log('🎫 Creating support tickets...');
  const supportSubjects = [
    'Problème de connexion',
    'Demande de fonctionnalité',
    'Bug dans l\'interface',
    'Question sur l\'abonnement',
    'Problème de paiement',
    'Demande d\'assistance technique',
    'Suggestion d\'amélioration',
    'Problème avec les notifications',
  ];
  const supportMessages = [
    'Je n\'arrive pas à me connecter à mon compte.',
    'J\'aimerais avoir une nouvelle fonctionnalité pour gérer mes stocks.',
    'Il y a un bug dans l\'interface utilisateur.',
    'J\'ai une question concernant mon abonnement.',
    'J\'ai un problème avec le paiement.',
    'J\'ai besoin d\'assistance technique.',
    'J\'aimerais suggérer une amélioration.',
    'Je ne reçois pas les notifications.',
  ];
  const supportStatuses = [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS, SupportTicketStatus.RESOLVED];

  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const numTickets = randomInt(1, 4);
    for (let i = 0; i < numTickets; i++) {
      const subject = randomChoice(supportSubjects);
      const message = randomChoice(supportMessages);
      const status = randomChoice(supportStatuses);
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());
      const updatedAt = randomDate(createdAt, new Date());

      await prisma.supportTicket.create({
        data: {
          userId: user.id,
          subject,
          message,
          status,
          createdAt,
          updatedAt,
        },
      });
    }
  }
  console.log('✅ Support tickets created successfully');

  // Create audit logs
  console.log('📝 Creating audit logs...');
  const auditActions = [
    'LOGIN',
    'LOGOUT',
    'CREATE_ANNOUNCEMENT',
    'UPDATE_ANNOUNCEMENT',
    'DELETE_ANNOUNCEMENT',
    'CREATE_REQUEST',
    'UPDATE_REQUEST',
    'RESPOND_TO_REQUEST',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'VIEW_MEDICINE',
    'SEARCH_MEDICINE',
    'EXPORT_DATA',
    'IMPORT_DATA',
  ];
  const entityTypes = ['User', 'Announcement', 'Request', 'Medicine', 'Notification', 'Subscription'];

  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const numLogs = randomInt(10, 30);
    for (let i = 0; i < numLogs; i++) {
      const action = randomChoice(auditActions);
      const entityType = randomChoice(entityTypes);
      const entityId = randomInt(1, 1000).toString();
      const details = {
        ip: `192.168.1.${randomInt(1, 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date().toISOString(),
      };
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action,
          entityType,
          entityId,
          details,
          createdAt,
        },
      });
    }
  }
  console.log('✅ Audit logs created successfully');

  console.log('🎉 Comprehensive database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${createdCities.length} cities across Tunisian regions`);
  console.log(`- ${adminUsers.length} admin users`);
  console.log(`- ${createdPharmacyUsers.length} pharmacy users`);
  console.log(`- ${createdSupplierUsers.length} supplier users`);
  console.log(`- Subscriptions for all users`);
  console.log(`- Multiple notifications per user`);
  console.log(`- Support tickets for various issues`);
  console.log(`- Comprehensive audit logs`);
  console.log('\n🔑 Test Credentials:');
  console.log('All users use password: password123');
  console.log('Admin: admin@pharmacie.tn');
  console.log('Sample Pharmacy: pharmacy.carthage@pharmacie.tn');
  console.log('Sample Supplier: supplier.medical@pharmacie.tn');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });