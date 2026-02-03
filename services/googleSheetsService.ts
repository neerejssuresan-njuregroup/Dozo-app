
import { Product, User, Order } from '../types';
import { products as mockProducts } from '../data/mockData';
import { mockOrders } from '../data/mockOrders';
import * as authService from './authService';

/**
 * NOTE: This service simulates fetching data from a Google Sheets backend.
 * In a real-world application, you would replace the logic in these functions
 * with calls to the Google Sheets API (gapi) to read data from your sheets.
 * This provides a powerful, free-tier "database" for an MVP.
 */

// Simulated database tables
let products: Product[] = [...mockProducts];
let orders: Order[] = [...mockOrders];

// Realistic names for simulation to make the demo more impressive.
const realisticNames = ['Aarav Gupta', 'Sanya Iyer', 'Rohan Das', 'Meera Krishnan', 'Arjun Reddy', 'Diya Mehta', 'Kabir Shah'];


export const getProducts = async (): Promise<Product[]> => {
    // In a real app: await gapi.client.sheets.spreadsheets.values.get(...)
    console.log("Fetching products from simulated Google Sheet...");
    return Promise.resolve(products);
};

export const getUsers = async (): Promise<{ email: string; kycVerified: boolean }[]> => {
    // In a real app: await gapi.client.sheets.spreadsheets.values.get(...)
     console.log("Fetching users from simulated Google Sheet...");
    return Promise.resolve(authService.getDisplayUsers());
};

export const getOrders = async (): Promise<Order[]> => {
    // In a real app: await gapi.client.sheets.spreadsheets.values.get(...)
     console.log("Fetching orders from simulated Google Sheet...");
    return Promise.resolve(orders);
};

export const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<boolean> => {
    console.log(`Updating order ${orderId} to status ${newStatus} in simulated Google Sheet...`);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        return true;
    }
    return false;
};


// --- Simulation Functions for Live Dashboard ---
// These functions simulate new data being added to the "database".

export const simulateNewUser = (): { name: string, email: string; kycVerified: boolean } => {
    const name = realisticNames[Math.floor(Math.random() * realisticNames.length)];
    const email = `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 100)}@gmail.com`;
    authService.signUp(email, 'password123');
    return { name, email, kycVerified: false };
}

export const simulateNewOrder = (): Order | null => {
    const availableProducts = products;
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const users = authService.getDisplayUsers().filter(u => !u.isAdmin);
    
    if (users.length === 0) return null; // No users to create orders for
    const randomUser = users[Math.floor(Math.random() * users.length)];

    if (!randomProduct || !randomUser) return null;

    const displayPrice = randomProduct.displayPricing.daily || randomProduct.displayPricing.monthly?.['12'] || 0;
    const lenderPrice = randomProduct.lenderPricing.daily || randomProduct.lenderPricing.monthly?.['12'] || 0;
    
    const aiPremium = displayPrice - lenderPrice;
    const lenderBaseEarnings = lenderPrice * (1 - randomProduct.commissionRate);
    const lenderPremiumShare = aiPremium * 0.5;
    const totalLenderEarnings = lenderBaseEarnings + lenderPremiumShare;

    const newOrder: Order = {
        id: `DOZO-${(Math.random().toString(36).substring(2, 10)).toUpperCase()}`,
        productId: randomProduct.id,
        userEmail: randomUser.email,
        renterName: randomUser.name,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        totalPrice: displayPrice,
        lenderEarnings: totalLenderEarnings,
    };
    orders.push(newOrder);
    return newOrder;
};
