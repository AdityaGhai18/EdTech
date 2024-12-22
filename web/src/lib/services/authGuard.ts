import { auth } from '../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

export const checkAuthState = () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(!!user);
        });
    });
};

export const redirectIfAuthenticated = async () => {
    const isAuthenticated = await checkAuthState();
    if (isAuthenticated) {
        window.location.href = '/demo';
        return true;
    }
    return false;
};

export const requireAuth = async () => {
    const isAuthenticated = await checkAuthState();
    if (!isAuthenticated) {
        window.location.href = '/login';
        return false;
    }
    return true;
};
