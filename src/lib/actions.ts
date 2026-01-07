'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProductStock(id: string, newStock: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: { stock: newStock },
        });
        revalidatePath('/admin/products');
        revalidatePath('/catalog');
        revalidatePath(`/product/${id}`);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update stock:', error);
        return { success: false, error: 'Failed to update stock' };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id }
        });
        revalidatePath('/admin/products');
        revalidatePath('/catalog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}


export async function deleteProducts(ids: string[]) {
    try {
        await prisma.product.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        revalidatePath('/admin/products');
        revalidatePath('/catalog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete products:', error);
        return { success: false, error: 'Failed to delete products' };
    }
}
