
import { User } from '../types';
import { mockUsers } from '../data/mockUsers';

// IMPORTANT: This is a simple, non-cryptographically secure hashing function
// for demonstration purposes only. In a real-world application, you MUST use
// a strong, salted hashing algorithm like Bcrypt or Argon2 on a secure backend server.
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

const USERS_STORAGE_KEY = 'dozoUsers';
const CURRENT_USER_STORAGE_KEY = 'dozoUser';
const MAX_SESSIONS = 3;

interface StoredUser {
    name: string;
    password: string;
    kycVerified: boolean;
    emailVerified: boolean;
    isAdmin?: boolean;
    sessions: string[];
    verificationToken?: string;
}

// --- Data Encoding/Decoding ---
const encodeData = (data: object): string => {
    try {
        return btoa(JSON.stringify(data));
    } catch (e) {
        console.error("Failed to encode data", e);
        return '';
    }
}

const decodeData = <T>(encodedData: string): T | null => {
    try {
        return JSON.parse(atob(encodedData)) as T;
    } catch (e) {
        // Can happen if data is not encoded or corrupted
        return null;
    }
}

// --- User Management ---

const getAllUsers = (): Record<string, StoredUser> => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    const users = stored ? decodeData<Record<string, StoredUser>>(stored) || {} : {};
    // Data migration for users without sessions array
    Object.values(users).forEach(u => {
      if (!u.sessions) u.sessions = [];
    });
    return users;
};

const saveAllUsers = (users: Record<string, StoredUser>) => {
    localStorage.setItem(USERS_STORAGE_KEY, encodeData(users));
}

// --- Public API for the service ---

export const seedInitialUsers = () => {
    const users = getAllUsers();
    // Only seed if the user store is empty to avoid overwriting existing data.
    if (Object.keys(users).length > 0) {
        return;
    }

    console.log("Seeding initial mock users for demo...");
    const seededUsers: Record<string, StoredUser> = {};
    mockUsers.forEach(user => {
        seededUsers[user.email] = {
            name: user.name,
            password: simpleHash(user.password),
            kycVerified: user.kycVerified,
            emailVerified: user.emailVerified,
            sessions: [],
        };
    });
    saveAllUsers(seededUsers);
};

export const signUp = (email: string, password: string): { success: boolean; message: string; token?: string } => {
    const users = getAllUsers();
    
    if (email.toLowerCase() === 'njure.services@gmail.com') {
        return { success: false, message: "This email is reserved for administration." };
    }
    if (users[email]) {
        if (!users[email].emailVerified && users[email].verificationToken) {
            return {
                success: true,
                message: "This email is already pending verification. We've resent the verification link.",
                token: users[email].verificationToken,
            };
        }
        return { success: false, message: "An account with this email already exists." };
    }

    const hashedPassword = simpleHash(password);
    const verificationToken = `dozo_verify_${Date.now()}${Math.random()}`;
    // Derive a name from email for new sign-ups.
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    users[email] = {
        name,
        password: hashedPassword,
        kycVerified: false,
        emailVerified: false,
        sessions: [],
        verificationToken,
    };
    saveAllUsers(users);

    return { 
        success: true, 
        message: "Account created! Please check your email to verify your account.",
        token: verificationToken,
    };
};

export const verifyEmail = (token: string): { success: boolean; message: string } => {
    const users = getAllUsers();
    const userEmail = Object.keys(users).find(email => users[email].verificationToken === token);

    if (!userEmail) {
        return { success: false, message: "Invalid or expired verification token." };
    }

    users[userEmail].emailVerified = true;
    delete users[userEmail].verificationToken;
    saveAllUsers(users);
    
    return { success: true, message: "Email verified successfully! You can now log in." };
};


export const login = (email: string, password: string): { success: boolean; user?: User; message: string } => {
    const users = getAllUsers();
    const hashedPassword = simpleHash(password);
    const sessionId = `sess_${Date.now()}`;

    // Special super admin login
    if (email.toLowerCase() === 'njure.services@gmail.com' && password === 'Navya@262005') {
        const adminUser: User = { name: 'Navya J', email: 'njure.services@gmail.com', kycVerified: true, emailVerified: true, isAdmin: true, sessionId };
        saveCurrentUser(adminUser);
        return { success: true, user: adminUser, message: "Admin login successful." };
    }

    const userData = users[email];

    if (!userData || userData.password !== hashedPassword) {
        return { success: false, message: "Invalid email or password." };
    }
    
    if (!userData.emailVerified) {
         return { success: false, message: "Your email is not verified. Please check your inbox for the verification link." };
    }
    
    // Device limit check
    if (!userData.isAdmin && userData.sessions.length >= MAX_SESSIONS) {
      return { success: false, message: `Device limit of ${MAX_SESSIONS} reached. Please log out from another device.` };
    }
    
    userData.sessions.push(sessionId);
    saveAllUsers(users);

    const user: User = { name: userData.name, email, kycVerified: userData.kycVerified, emailVerified: userData.emailVerified, isAdmin: userData.isAdmin, sessionId };
    saveCurrentUser(user);
    return { success: true, user, message: "Login successful." };
};

export const logout = () => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.sessionId) {
        const users = getAllUsers();
        const userData = users[currentUser.email];
        if (userData) {
            userData.sessions = userData.sessions.filter(s => s !== currentUser.sessionId);
            saveAllUsers(users);
        }
    }
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

export const createAdmin = (email: string, password: string, creator: User): { success: boolean; message: string } => {
    if (!creator.isAdmin) {
        return { success: false, message: "Unauthorized: Only admins can create new admins." };
    }
    const users = getAllUsers();
    if (users[email]) {
        return { success: false, message: "An account with this email already exists." };
    }
     if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters long." };
    }

    const hashedPassword = simpleHash(password);
    const name = email.split('@')[0];
    users[email] = { name, password: hashedPassword, kycVerified: true, emailVerified: true, isAdmin: true, sessions: [] };
    saveAllUsers(users);
    
    return { success: true, message: "Admin account created successfully." };
};

export const saveCurrentUser = (user: User) => {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, encodeData(user));
}

export const getCurrentUser = (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return stored ? decodeData<User>(stored) : null;
}

export const updateUserKycStatus = (email: string, isVerified: boolean) => {
    const users = getAllUsers();
    if (users[email]) {
        users[email].kycVerified = isVerified;
        saveAllUsers(users);
    }
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
        currentUser.kycVerified = isVerified;
        saveCurrentUser(currentUser);
    }
}

export const getDisplayUsers = (): { name: string, email: string; kycVerified: boolean, emailVerified: boolean, isAdmin: boolean }[] => {
    const users = getAllUsers();
    return Object.entries(users).map(([email, data]) => ({
        name: data.name,
        email,
        kycVerified: data.kycVerified,
        emailVerified: data.emailVerified,
        isAdmin: !!data.isAdmin
    }));
}