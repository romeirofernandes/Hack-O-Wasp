import { 
  auth, 
  provider, 
  signInWithPopup 
} from '../firebase.config';
import { signOut } from 'firebase/auth';
import axios from 'axios';

// Let's fix the URL structure
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Login with Google
export const loginWithGoogle = async () => {
  try {
    // Sign in with Firebase using Google
    const result = await signInWithPopup(auth, provider);
    const { user } = result;
    
    console.log("Firebase login successful:", user);
    
    // Update login status in our backend
    try {
      // Log the request data and include the full URL for debugging
      const requestUrl = `${API_URL}/api/users/auth`;
      console.log(`Sending user data to backend (${requestUrl}):`, {
        name: user.displayName,
        email: user.email,
        firebaseUID: user.uid
      });
      
      // Make the API request to create/update the user in MongoDB with correct path
      const response = await axios.post(`${API_URL}/api/users/auth`, {
        name: user.displayName,
        email: user.email,
        firebaseUID: user.uid
      });
      
      console.log("Backend response:", response.data);
      return response.data;
    } catch (backendError) {
      console.error('Backend API error:', backendError);
      
      // If there's a specific error with the request, log it
      if (backendError.response) {
        console.error('Response data:', backendError.response.data);
        console.error('Response status:', backendError.response.status);
        console.error('Response headers:', backendError.response.headers);
      } else if (backendError.request) {
        console.error('No response received:', backendError.request);
      }
      
      // Return user anyway to allow frontend access even if backend call fails
      return { 
        success: true, 
        message: "Firebase authentication successful, but backend sync failed",
        user: {
          name: user.displayName,
          email: user.email,
          uid: user.uid
        }
      };
    }
  } catch (error) {
    console.error('Google login error:', error);
    if (error.code === 'auth/configuration-not-found') {
      throw new Error('Authentication configuration error. Please contact support.');
    }
    throw error;
  }
};

// Rest of the exports remain the same
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const isAuthenticated = () => {
  return !!auth.currentUser;
};

export const getUserToken = async () => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }
  return await auth.currentUser.getIdToken();
};

export const createAuthenticatedRequest = async () => {
  const token = await getUserToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};