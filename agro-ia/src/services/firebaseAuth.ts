import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
  } from 'firebase/auth';
  import { auth } from '../firebase/config';
  
  const googleProvider = new GoogleAuthProvider();
  
  export const firebaseAuth = {
    // Login con email/contraseña
    login: (email: string, password: string) => 
      signInWithEmailAndPassword(auth, email, password),
    
    // Registro con email/contraseña
    register: (email: string, password: string) => 
      createUserWithEmailAndPassword(auth, email, password),
    
    // Login con Google
    loginWithGoogle: () => 
      signInWithPopup(auth, googleProvider),
    
    // Cerrar sesión
    logout: () => 
      signOut(auth),
    
    // Reset de contraseña
    resetPassword: (email: string) => 
      sendPasswordResetEmail(auth, email)
  };