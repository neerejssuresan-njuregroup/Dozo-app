
import { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'DOZO-9A4B1C8E',
    productId: 'p1', // Canon Camera, Excellent Quality
    userEmail: 'priya.patel@yahoo.co.in',
    renterName: 'Priya Patel',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    status: 'completed',
    totalPrice: 5500, // 2 days @ 2750/day (displayPrice)
    lenderEarnings: 4350, // 4100 (base) + 250 (50% of 500 premium)
  },
  {
    id: 'DOZO-F2D8E7C5',
    productId: 'p3', // Sofa, Excellent Quality
    userEmail: 'amit.singh.dev@gmail.com',
    renterName: 'Amit Singh',
    startDate: '2024-05-01',
    endDate: '2024-08-01',
    status: 'active',
    totalPrice: 5940, // 3 months @ 1980/mo (displayPrice)
    lenderEarnings: 5022, // 4752 (base) + 270 (50% of 540 premium)
  },
  {
    id: 'DOZO-7G1H3I4J',
    productId: 'p6', // Drill, Standard
    userEmail: 'vijay.kumar92@gmail.com',
    renterName: 'Vijay Kumar',
    startDate: '2024-04-28',
    endDate: '2024-04-29',
    status: 'completed',
    totalPrice: 450,
    lenderEarnings: 405,
  },
  {
    id: 'DOZO-K6L5M4N3',
    productId: 'p5', // Fridge, Standard
    userEmail: 'rahul.sharma@outlook.com',
    renterName: 'Rahul Sharma',
    startDate: '2024-05-15',
    endDate: '2025-05-15',
    status: 'pending',
    totalPrice: 14400, // 12 months @ 1200/mo
    lenderEarnings: 12240,
  },
  {
    id: 'DOZO-P9O8I7U6',
    productId: 'p2', // Projector, Standard
    userEmail: 'sunita.menon21@gmail.com',
    renterName: 'Sunita Menon',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    status: 'active',
    totalPrice: 2400, // 2 days @ 1200/day
    lenderEarnings: 2040,
  },
  {
    id: 'DOZO-Z1X2C3V4',
    productId: 'p7', // Tent, Standard
    userEmail: 'vijay.kumar92@gmail.com',
    renterName: 'Vijay Kumar',
    startDate: '2024-05-25',
    endDate: '2024-05-28',
    status: 'pending',
    totalPrice: 1800, // 3 days @ 600/day
    lenderEarnings: 1656,
  },
  {
    id: 'DOZO-B5N6M7A8',
    productId: 'p8', // Dining Table, Standard
    userEmail: 'priya.patel@yahoo.co.in',
    renterName: 'Priya Patel',
    startDate: '2024-05-18',
    endDate: '2024-08-18',
    status: 'rejected',
    totalPrice: 4800, // 3 months @ 1600/mo
    lenderEarnings: 4224,
  },
];
