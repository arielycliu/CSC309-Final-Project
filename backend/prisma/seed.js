const { createUser, createEvents, createPromotions, createTransaction, createTransactionPromotion, createEventOrganizer, createEventGuest, prisma } = require('./seed-helper');

// Seed database with 10 users (1 superuser, 1 manager, 1 cashier, 7 regular users)

// users 4 and 5 are unverified regular users
const seedUsers = [
    {
        utorid: 'johnson1',
        email: 'sarah.johnson@mail.utoronto.ca',
        password: 'SuperAdmin123!',
        name: 'Sarah Johnson',
        role: 'superuser',
        verified: true,
    },
    {
        utorid: 'chen456',
        email: 'michael.chen@mail.utoronto.ca',
        password: 'Manager456!',
        name: 'Michael Chen',
        role: 'manager',
        verified: true,
    },
    {
        utorid: 'patel789',
        email: 'priya.patel@mail.utoronto.ca',
        password: 'Cashier789!',
        name: 'Priya Patel',
        role: 'cashier',
        verified: true,
    },
    {
        utorid: 'smith234',
        email: 'james.smith@mail.utoronto.ca',
        password: 'Student123!',
        name: 'James Smith',
        role: 'regular',
        verified: false,
    },
    {
        utorid: 'garcia56',
        email: 'maria.garcia@mail.utoronto.ca',
        password: 'Password456!',
        name: 'Maria Garcia',
        role: 'regular',
        verified: false,
    },
    {
        utorid: 'wilson78',
        email: 'emily.wilson@mail.utoronto.ca',
        password: 'Emily789!',
        name: 'Emily Wilson',
        role: 'regular',
        verified: true,
    },
    {
        utorid: 'brown123',
        email: 'david.brown@mail.utoronto.ca',
        password: 'David123!',
        name: 'David Brown',
        role: 'regular',
        verified: true,
    },
    {
        utorid: 'lee9876',
        email: 'jessica.lee@mail.utoronto.ca',
        password: 'Jessica987!',
        name: 'Jessica Lee',
        role: 'regular',
        verified: true,
    },
    {
        utorid: 'martin12',
        email: 'robert.martin@mail.utoronto.ca',
        password: 'Robert456!',
        name: 'Robert Martin',
        role: 'regular',
        verified: true,
        
    },
    {
        utorid: 'ahmed345',
        email: 'aisha.ahmed@mail.utoronto.ca',
        password: 'Aisha789!',
        name: 'Aisha Ahmed',
        role: 'regular',
        verified: true,
    },
];

const seedEvents = [
    {
        name: 'Bingo Night',
        description: 'Bingo fun for all.',
        location: 'Toronto, ON',
        startTime: new Date('2025-12-08T09:00:00'),
        endTime: new Date('2025-12-08T17:00:00'),
        capacity: 150,
        pointsTotal: 5000,
        pointsRemain: 5000,
        published: true,
        createdById: 2,
    },
    {
        name: 'Coffee chat',
        description: 'Meet with others.',
        location: 'Vancouver, BC',
        startTime: new Date('2025-11-07T10:00:00'),
        endTime: new Date('2025-11-07T16:00:00'),
        capacity: 100,
        pointsTotal: 3000,
        pointsRemain: 0,
        published: true,
        createdById: 2,
    },
    {
        name: 'Christmas Baking',
        description: 'baking session.',
        location: 'Montreal, QC',
        startTime: new Date('2025-12-24T11:00:00'),
        endTime: new Date('2025-12-24T18:00:00'),
        capacity: 200,
        pointsTotal: 4000,
        pointsRemain: 4000,
        published: true,
        createdById: 2, //manager
    },
    {
        name: 'Learning Workshop',
        description: 'Hands-on workshop.',
        location: 'Calgary, AB',
        startTime: new Date('2025-12-15T13:00:00'),
        endTime: new Date('2025-12-15T17:00:00'),
        capacity: 80,
        pointsTotal: 2500,
        pointsRemain: 0,
        published: true,
        createdById: 1, //superuser
    },
    {
        name: '2026 Autumn Meeting',
        description: 'Fall meeting for all members.',
        location: 'Ottawa, ON',
        startTime: new Date('2026-10-12T18:00:00'),
        endTime: new Date('2026-10-12T22:00:00'),
        capacity: 120,
        pointsTotal: 6000,
        pointsRemain: 6000,
        published: false,
        createdById: 1, //superuser
    }
];

const seedEventsOrganizers = [
    { eventId: 1, userId: 3 }, // Priya Patel
    { eventId: 2, userId: 2 }, // Michael Chen
    { eventId: 3, userId: 1 }, // sarah Johnson
    { eventId: 4, userId: 7 }, // David Brown
    { eventId: 5, userId: 9 }, // robert Martin
];

const seedEventGuest = [
    { eventId: 1, userId: 1 }, // Sarah Johnson
    { eventId: 1, userId: 2 },  // Michael Chen   
    { eventId: 3, userId: 6 },
    { eventId: 3, userId: 7 },
    { eventId: 4, userId: 6 },
    { eventId: 4, userId: 9 }, 
    { eventId: 2, userId: 10 },
    { eventId: 2, userId: 6 },  
];

const seedPromotions = [
    {
        name: 'New Year Bonus',
        description: 'Get extra points on all purchases in January',
        type: 'automatic',
        startTime: new Date('2026-01-01T00:00:00'),
        endTime: new Date('2026-01-31T23:59:59'),
        minSpending: null,
        rate: 2.0,
        points: null,
    },
    {
        name: 'Big Spender Reward',
        description: 'Spend $50 or more and get bonus points',
        type: 'automatic',
        startTime: new Date('2025-01-01T00:00:00'),
        endTime: new Date('2025-12-31T23:59:59'),
        minSpending: 50.0,
        rate: 1.5,
        points: null,
    },
    {
        name: 'First Purchase Bonus',
        description: 'Get 100 bonus points on your first purchase',
        type: 'onetime',
        startTime: new Date('2025-01-01T00:00:00'),
        endTime: new Date('2025-12-31T23:59:59'),
        minSpending: null,
        rate: null,
        points: 100,
    },
    {
        name: 'Spring Sale',
        description: 'Triple points on all spring purchases',
        type: 'automatic',
        startTime: new Date('2026-03-20T00:00:00'),
        endTime: new Date('2026-06-20T23:59:59'),
        minSpending: null,
        rate: 3.0,
        points: null,
    },
    {
        name: 'Welcome Gift',
        description: 'One-time 50 point bonus for new members',
        type: 'onetime',
        startTime: new Date('2025-01-01T00:00:00'),
        endTime: new Date('2025-12-31T23:59:59'),
        minSpending: null,
        rate: null,
        points: 50,
    },
];

const seedTransactions = [
    // Event transactions 6 (for event 2 - Coffee chat, which has ended, created by user 2) (done)
    { type: 'event', userId: 10, createdById: 2, eventId: 2, amount: 500, remark: 'Coffee chat attendance', createdAt: new Date('2025-11-07T16:30:00') },
    { type: 'event', userId: 6, createdById: 2, eventId: 2, amount: 500, remark: 'Coffee chat attendance', createdAt: new Date('2025-11-07T16:30:00') },
    { type: 'event', userId: 10, createdById: 2, eventId: 2, amount: 1000, remark: 'Coffee chat winner - best conversationalist', createdAt: new Date('2025-11-07T16:30:00') },
    { type: 'event', userId: 6, createdById: 2, eventId: 2, amount: 500, remark: 'Coffee chat participation bonus', createdAt: new Date('2025-11-07T16:30:00') },
    { type: 'event', userId: 10, createdById: 2, eventId: 2, amount: 250, remark: 'Coffee chat raffle winner', createdAt: new Date('2025-11-07T16:30:00') },
    { type: 'event', userId: 6, createdById: 2, eventId: 2, amount: 250, remark: 'Coffee chat engagement award', createdAt: new Date('2025-11-07T16:30:00') },

    // Purchase transactions 8 (with promotions applied)
    // Base rate: $1 = 4 points (done)
    { type: 'purchase', userId: 1, createdById: 3, spent: 10.00, amount: 40, remark: 'Coffee purchase', createdAt: new Date('2025-12-05T10:00:00') },
    { type: 'purchase', userId: 3, createdById: 2, spent: 25.00, amount: 100, remark: 'Textbook', createdAt: new Date('2025-11-27T11:00:00') },
    { type: 'purchase', userId: 6, createdById: 3, spent: 50.00, amount: 175, remark: 'Snacks', createdAt: new Date('2025-12-07T14:00:00') }, // Error: should be 200 points, adjustment will add missing 25
    { type: 'purchase', userId: 7, createdById: 3, spent: 15.00, amount: 55, remark: 'Lunch', createdAt: new Date('2025-12-07T12:30:00') }, // Error: should be 60 points, adjustment will add missing 5
    { type: 'purchase', userId: 8, createdById: 3, spent: 40.00, amount: 150, remark: 'Course materials', createdAt: new Date('2025-12-06T09:00:00') }, // Error: should be 160 ($40 * 4), adjustment will add missing 10
    { type: 'purchase', userId: 9, createdById: 3, spent: 8.00, amount: 147, remark: 'Drink', createdAt: new Date('2025-12-06T15:00:00') }, // Error: 32 base + 100 bonus + 15 extra by mistake, adjustment will remove 15
    { type: 'purchase', userId: 10, createdById: 3, spent: 20.00, amount: 130, remark: 'Supplies', createdAt: new Date('2025-12-07T16:00:00') }, // 80 base + 50 bonus
    { type: 'purchase', userId: 2, createdById: 3, spent: 12.00, amount: 48, remark: 'Breakfast', createdAt: new Date('2025-11-12T08:00:00') }, 

    // Adjustment transactions 4 (done)
    { type: 'adjustment', userId: 8, createdById: 2, amount: 10, remark: 'Correction: missing points', relatedTransactionId: 11, createdAt: new Date('2025-12-07T09:00:00') }, // Fixing purchase 11 (user 8)
    { type: 'adjustment', userId: 9, createdById: 2, amount: -15, remark: 'Correction: extra points', relatedTransactionId: 12, createdAt: new Date('2025-12-07T15:00:00') }, // Fixing purchase 12 (user 9)
    { type: 'adjustment', userId: 6, createdById: 1, amount: 25, remark: 'Correction: missing points', relatedTransactionId: 9, createdAt: new Date('2025-12-08T14:00:00') }, // Fixing purchase 9 (user 6)
    { type: 'adjustment', userId: 7, createdById: 1, amount: 5, remark: 'Correction: missing points', relatedTransactionId: 10, createdAt: new Date('2025-12-08T12:30:00') }, // Fixing purchase 10 (user 7)

    // Transfer transactions 6 
    { type: 'transfer', userId: 3, createdById: 3, relatedUserId: 2, amount: 5, remark: 'Gift', createdAt: new Date('2025-11-27T14:00:00') }, // After user 3 purchase (Nov 27)
    { type: 'transfer', userId: 7, createdById: 7, relatedUserId: 8, amount: 10, remark: 'Birthday present', createdAt: new Date('2025-12-08T14:00:00') }, // After user 7 gets adjusted points (Dec 8)
    { type: 'transfer', userId: 6, createdById: 6, relatedUserId: 7, amount: 15, remark: 'Thank you', createdAt: new Date('2025-12-08T14:30:00') }, // After user 6 event points (Nov 7) + adjustment (Dec 8)
    { type: 'transfer', userId: 10, createdById: 10, relatedUserId: 6, amount: 15, remark: 'Sharing points', createdAt: new Date('2025-11-08T10:00:00') }, // After user 10 event points (Nov 7)
    { type: 'transfer', userId: 10, createdById: 10, relatedUserId: 9, amount: 20, remark: 'Gift points', createdAt: new Date('2025-11-08T11:00:00') }, // After user 10 event points (Nov 7)
    { type: 'transfer', userId: 9, createdById: 9, relatedUserId: 8, amount: 20, remark: 'Thank you', createdAt: new Date('2025-12-08T10:00:00') }, // After user 9 purchase (Dec 6) + adjustment (Dec 7)

    // Redemption transactions 6  not yet processed (done)
    { type: 'redemption', userId: 1, createdById: 1, amount: -10, remark: 'Gift card' },
    { type: 'redemption', userId: 3, createdById: 3, amount: -50, remark: 'Merchandise' },
    { type: 'redemption', userId: 7, createdById: 7, amount: -15, remark: 'Voucher' },
    { type: 'redemption', userId: 8, createdById: 8, amount: -80, remark: 'TV' },
    { type: 'redemption', userId: 9, createdById: 9, amount: -20, remark: 'Coupon' },
    { type: 'redemption', userId: 10, createdById: 10, amount: -5, remark: 'apples' },

];

const seedTransactionPromotion = [
    { transactionId: 5, promotionId: 2 }, // big Spender Reward
    { transactionId: 7, promotionId: 5 }, // Welcome Gift
    { transactionId: 6, promotionId: 3 }, // First Purchase Bonus
];

(async function () {
    // to clear, first run npx prisma db push --force-reset in terminal 
    try {
        console.log('Starting database seed...\n');
        
        // Create users
        console.log('--- Creating Users ---');
        for (const userData of seedUsers) {
            try {
                const user = await createUser(userData);
                console.log(`created ${user.role}: ${user.name} (${user.email})`);
            } catch (err) {
                console.error(`Failed to create ${userData.name}: ${err.message}`);
            }
        }

        console.log('\n--- Creating Events ---');
        // Create events
        for (const eventData of seedEvents) {
            try {
                const event = await createEvents(eventData);
                console.log(`created event: ${event.name}`);
            } catch (err) {
                console.error(`Failed to create event: ${err.message}`);
            }
        }

        console.log('\n--- Creating Promotions ---');
        // Create promotions
        for (const promoData of seedPromotions) {
            try {
                const promo = await createPromotions(promoData);
                console.log(`created promotion: ${promo.name}`);
            } catch (err) {
                console.error(`Failed to create promotion: ${err.message}`);
            }
        }

        console.log('\n--- Creating Event Organizers ---');
        // Create event organizers
        for (const organizerData of seedEventsOrganizers) {
            try {
                const organizer = await createEventOrganizer(organizerData);
                console.log(`created organizer for event ${organizer.eventId}, user ${organizer.userId}`);
            } catch (err) {
                console.error(`Failed to create event organizer: ${err.message}`);
            }
        }

        console.log('\n--- Creating Event Guests ---');
        // Create event guests
        for (const guestData of seedEventGuest) {
            try {
                const guest = await createEventGuest(guestData);
                console.log(`created guest for event ${guest.eventId}, user ${guest.userId}`);
            } catch (err) {
                console.error(`Failed to create event guest: ${err.message}`);
            }
        }

        console.log('\n--- Creating Transactions ---');
        // Create transactions
        for (const txData of seedTransactions) {
            try{
                const tx = await createTransaction(txData);
                console.log(`created ${tx.type} transaction for user ${tx.userId}`);
            } catch (err) {
                console.error(`Failed to create transaction for user ${txData.userId}: ${err.message}`);
            }   
        }

        console.log('\n--- Linking Transactions to Promotions ---');
        // Create transaction promotion links
        for (const txPromoData of seedTransactionPromotion) {
            try {
                const txPromo = await createTransactionPromotion(txPromoData);
                console.log(`linked transaction ${txPromo.transactionId} to promotion ${txPromo.promotionId}`);
            } catch (err) {
                console.error(`Failed to link transaction to promotion: ${err.message}`);
            }
        }
    
        console.log('\n Database seed completed');
    } catch (err) {
        console.error(`Error during seeding: ${err.message}`);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();