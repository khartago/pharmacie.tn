import { PrismaClient, RoleType, Region, SubscriptionStatus, NotificationType, SupportTicketStatus, AnnouncementStatus, InterestStatus, RequestStatus, RequestResponseStatus, SupplierStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import path from 'path';

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

// Function to import medicines from Excel file
async function importMedicines() {
  console.log('💊 Importing medicines from Excel file...');
  
  try {
    const filePath = path.join(__dirname, '../src/utils/liste_amm.xls');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName!];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Found ${data.length} medicines in Excel file`);
    
    const medicines = [];
    for (const row of data as any[]) {
      if (row['Nom'] && row['DCI']) {
        const medicine = await prisma.medicine.upsert({
          where: { 
            dci_brandName_dosage_form_laboratoire: { 
              dci: row['DCI'],
              brandName: row['Nom'],
              dosage: row['Dosage'] || 'Non spécifié',
              form: row['Forme'] || 'Non spécifiée',
              laboratoire: row['Laboratoire'] || 'Non spécifié'
            } 
          },
          update: {},
          create: {
            brandName: row['Nom'],
            dci: row['DCI'],
            laboratoire: row['Laboratoire'] || 'Non spécifié',
            form: row['Forme'] || 'Non spécifiée',
            dosage: row['Dosage'] || 'Non spécifié',
          },
        });
        medicines.push(medicine);
      }
    }
    
    console.log(`✅ Imported ${medicines.length} medicines successfully`);
    return medicines;
  } catch (error) {
    console.log('⚠️ Could not import from Excel file, creating sample medicines...');
    
    // Create sample medicines if Excel import fails
    const sampleMedicines = [
      { brandName: 'Doliprane 1000mg', dci: 'Paracétamol', laboratoire: 'Sanofi', forme: 'Comprimé', dosage: '1000mg', conditionnement: 'Boîte de 16' },
      { brandName: 'Aspégic 1000mg', dci: 'Aspirine', laboratoire: 'Bayer', forme: 'Poudre', dosage: '1000mg', conditionnement: 'Sachet de 20' },
      { brandName: 'Voltarène 50mg', dci: 'Diclofénac', laboratoire: 'Novartis', forme: 'Comprimé', dosage: '50mg', conditionnement: 'Boîte de 30' },
      { brandName: 'Augmentin 1g', dci: 'Amoxicilline + Acide clavulanique', laboratoire: 'GlaxoSmithKline', forme: 'Comprimé', dosage: '1g', conditionnement: 'Boîte de 14' },
      { brandName: 'Ventoline', dci: 'Salbutamol', laboratoire: 'GlaxoSmithKline', forme: 'Aérosol', dosage: '100mcg', conditionnement: 'Flacon de 200 doses' },
      { brandName: 'Lasilix 40mg', dci: 'Furosémide', laboratoire: 'Sanofi', forme: 'Comprimé', dosage: '40mg', conditionnement: 'Boîte de 30' },
      { brandName: 'Cardensiel 1.25mg', dci: 'Bisoprolol', laboratoire: 'Merck', forme: 'Comprimé', dosage: '1.25mg', conditionnement: 'Boîte de 30' },
      { brandName: 'Amlor 5mg', dci: 'Amlodipine', laboratoire: 'Pfizer', forme: 'Comprimé', dosage: '5mg', conditionnement: 'Boîte de 30' },
      { brandName: 'Zestril 10mg', dci: 'Lisinopril', laboratoire: 'AstraZeneca', forme: 'Comprimé', dosage: '10mg', conditionnement: 'Boîte de 30' },
      { brandName: 'Glucophage 850mg', dci: 'Metformine', laboratoire: 'Merck', forme: 'Comprimé', dosage: '850mg', conditionnement: 'Boîte de 60' },
    ];
    
    const medicines = [];
    for (const medicineData of sampleMedicines) {
      const medicine = await prisma.medicine.upsert({
        where: { 
          dci_brandName_dosage_form_laboratoire: { 
            dci: medicineData.dci,
            brandName: medicineData.brandName,
            dosage: medicineData.dosage,
            form: medicineData.forme,
            laboratoire: medicineData.laboratoire
          } 
        },
        update: {},
        create: {
          brandName: medicineData.brandName,
          dci: medicineData.dci,
          laboratoire: medicineData.laboratoire,
          form: medicineData.forme,
          dosage: medicineData.dosage,
        },
      });
      medicines.push(medicine);
    }
    
    console.log(`✅ Created ${medicines.length} sample medicines`);
    return medicines;
  }
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding with medicine import...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.requestResponse.deleteMany();
  await prisma.request.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.role.deleteMany();
  console.log('✅ Existing data cleared');

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

  // Import medicines
  const medicines = await importMedicines();

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

  // Create announcements with dual status workflow
  console.log('📢 Creating announcements with dual status workflow...');
  const announcementStatuses = [AnnouncementStatus.AVAILABLE, AnnouncementStatus.RESERVED, AnnouncementStatus.SOLD, AnnouncementStatus.EXPIRED];
  const supplierStatuses = [SupplierStatus.NONE, SupplierStatus.PENDING, SupplierStatus.DONE, SupplierStatus.REFUSED];
  
  const createdAnnouncements = [];
  const numAnnouncements = Math.min(medicines.length * 0.4, 150); // 40% of medicines or max 150

  for (let i = 0; i < numAnnouncements; i++) {
    const medicine = randomChoice(medicines);
    const pharmacy = randomChoice(createdPharmacyUsers);
    const supplier = Math.random() < 0.7 ? randomChoice(createdSupplierUsers) : null; // 70% have supplier
    const quantity = randomInt(10, 500);
    const expiryDate = randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2)); // Within 2 years
    const status = randomChoice(announcementStatuses);
    const supplierStatus = randomChoice(supplierStatuses);
    const visibleToSupplier = Math.random() < 0.8; // 80% visible to suppliers
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());

    const announcement = await prisma.announcement.create({
      data: {
        pharmacyUserId: pharmacy.id,
        supplierUserId: supplier?.id || null,
        manualSupplierName: !supplier ? `Fournisseur ${randomInt(1, 100)}` : null,
        medicineId: medicine.id,
        quantity,
        expiryDate,
        visibleToSupplier,
        status,
        supplierStatus,
        createdAt,
      },
    });
    createdAnnouncements.push(announcement);
  }

  console.log(`✅ Created ${createdAnnouncements.length} announcements with dual status workflow`);

  // Create interests (pharmacies showing interest in announcements)
  console.log('❤️ Creating interests...');
  const interestStatuses = [InterestStatus.PENDING, InterestStatus.ACCEPTED, InterestStatus.REFUSED];
  
  const createdInterests = [];
  const numInterests = Math.min(createdAnnouncements.length * 0.5, 200); // 50% of announcements or max 200

  for (let i = 0; i < numInterests; i++) {
    const announcement = randomChoice(createdAnnouncements);
    const pharmacy = randomChoice(createdPharmacyUsers);
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
  const regions = Object.values(Region);
  
  const createdRequests = [];
  const numRequests = Math.min(medicines.length * 0.3, 100); // 30% of medicines or max 100

  for (let i = 0; i < numRequests; i++) {
    const medicine = randomChoice(medicines);
    const pharmacy = randomChoice(createdPharmacyUsers);
    const quantity = randomInt(5, 100);
    const status = randomChoice(requestStatuses);
    const region = randomChoice(regions);
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
  const numResponses = Math.min(createdRequests.length * 0.6, 120); // 60% of requests or max 120

  for (let i = 0; i < numResponses; i++) {
    const request = randomChoice(createdRequests);
    const pharmacy = randomChoice(createdPharmacyUsers);
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
    'Intérêt accepté',
    'Retour finalisé',
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
    'Votre intérêt pour une annonce a été accepté.',
    'Le retour de médicament est terminé.',
  ];

  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const numNotifications = randomInt(5, 12);
    for (let i = 0; i < numNotifications; i++) {
      const type = randomChoice(notificationTypes);
      const title = randomChoice(notificationTitles);
      const message = randomChoice(notificationMessages);
      const isRead = Math.random() < 0.6; // 60% chance of being read
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
    'EXPRESS_INTEREST',
    'ACCEPT_INTEREST',
    'REFUSE_INTEREST',
    'MARK_AS_SOLD',
    'SUPPLIER_ACCEPT_RETOUR',
    'SUPPLIER_REFUSE_RETOUR',
    'MARK_RETOUR_DONE',
  ];
  const entityTypes = ['User', 'Announcement', 'Request', 'Medicine', 'Notification', 'Subscription', 'Interest'];

  for (const user of [...createdPharmacyUsers, ...createdSupplierUsers]) {
    const numLogs = randomInt(15, 40);
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

  console.log('🎉 Comprehensive database seeding with dual status workflow completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${medicines.length} medicines imported/created`);
  console.log(`- ${createdCities.length} cities across Tunisian regions`);
  console.log(`- ${adminUsers.length} admin users`);
  console.log(`- ${createdPharmacyUsers.length} pharmacy users`);
  console.log(`- ${createdSupplierUsers.length} supplier users`);
  console.log(`- ${createdAnnouncements.length} announcements with dual status workflow`);
  console.log(`- ${createdInterests.length} interests`);
  console.log(`- ${createdRequests.length} medicine requests`);
  console.log(`- ${createdResponses.length} request responses`);
  console.log(`- Subscriptions for all users`);
  console.log(`- Multiple notifications per user`);
  console.log(`- Support tickets for various issues`);
  console.log(`- Comprehensive audit logs`);
  console.log('\n🔑 Test Credentials:');
  console.log('All users use password: password123');
  console.log('Admin: admin@pharmacie.tn');
  console.log('Sample Pharmacy: pharmacy.carthage@pharmacie.tn');
  console.log('Sample Supplier: supplier.medical@pharmacie.tn');
  console.log('\n🔄 Dual Status Workflow:');
  console.log('- B2B Status: AVAILABLE → RESERVED → SOLD/EXPIRED');
  console.log('- Supplier Status: NONE → PENDING → DONE/REFUSED');
  console.log('- Both flows can operate simultaneously until one completes');
}

main()
  .catch((e) => {
    console.error('❌ Error during comprehensive seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
