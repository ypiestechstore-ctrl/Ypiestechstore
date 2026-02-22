
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSuperAdmin() {
    const email = 'super@ypiestechstore.co.za';
    const password = 'password123';

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { role: 'super-admin' },
            create: {
                email,
                password,
                name: 'Super Admin',
                role: 'super-admin',
            },
        });
        console.log('Super Admin created/updated:');
        console.log('Email:', user.email);
    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
