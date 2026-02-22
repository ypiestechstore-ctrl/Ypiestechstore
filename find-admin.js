
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSuperAdmin() {
    try {
        const superAdmin = await prisma.user.findFirst({
            where: {
                role: 'super-admin',
            },
        });

        if (superAdmin) {
            console.log('Super Admin found:');
            console.log('Email:', superAdmin.email);
        } else {
            console.log('No super-admin found.');

            // Check for any admin
            const admin = await prisma.user.findFirst({
                where: { role: 'admin' }
            });

            if (admin) {
                console.log('Admin found (but not super-admin):', admin.email);
            } else {
                console.log('No admin users found either.');
            }
        }
    } catch (error) {
        console.error('Error fetching super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findSuperAdmin();
