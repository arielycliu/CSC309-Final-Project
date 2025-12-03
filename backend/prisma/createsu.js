/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */

import { createUser, prisma } from './seed-helper.js';

(async function () {
    const args = process.argv;
    if (args.length !== 5) {
        console.error("Usage: node prisma/createsu.js <utorid> <email> <password>");
        process.exit(1);
    }

    const data = {
        utorid: args[2],
        email: args[3],
        password: args[4],
        role: 'superuser',
        verified: true,
    };

    try {
        const user = await createUser(data);
        console.log(`Superuser created: ${user.email}`);
    } catch (err) {
        console.error(`Error creating superuser: ${err.message}`);
        process.exit(1);
    } finally {
        // await prisma.$disconnect();
    }
})();
