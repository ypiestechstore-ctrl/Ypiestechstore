import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

console.log('Checking DB URL env:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const prisma = new PrismaClient();

const products = [
    {
        id: "1",
        name: "Gaming Laptop X1",
        description: "High performance gaming laptop with RTX 4060",
        price: 24999,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000",
        category: "Laptops",
        isFeatured: true,
        stock: 10,
    },
    {
        id: "2",
        name: "Office Desktop Pro",
        description: "Reliable desktop for office work, i5 12th Gen",
        price: 12500,
        image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=1000",
        category: "Desktops",
        isFeatured: true,
        stock: 15,
    },
    {
        id: "3",
        name: "27-inch 4K Monitor",
        description: "Crystal clear display for professionals",
        price: 8999,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000",
        category: "Monitors",
        isFeatured: true,
        stock: 20,
    },
    {
        id: "4",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches",
        price: 1499,
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=1000",
        category: "Accessories",
        stock: 50,
    },
    {
        id: "5",
        name: "Wireless Gaming Mouse",
        description: "Ultra-low latency wireless mouse",
        price: 999,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=1000",
        category: "Accessories",
        stock: 45,
    },
];

async function main() {
    console.log('Start seeding ...')
    for (const product of products) {
        const p = await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                category: product.category,
                isFeatured: product.isFeatured || false,
                stock: product.stock,
            },
        })
        console.log(`Created product with id: ${p.id}`)
    }
    console.log('Seeding finished.')
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
