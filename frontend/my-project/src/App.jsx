// the file where we set up the routes by react-roter-dom and use lazy loading to load the page when needed for the first time

import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Navbar = lazy(() => import('./components/Navbar'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

import { useAuth } from "./store/UseAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, isCheckingAuth, onlineUsers } = useAuth();

  console.log({ authUser });
  console.log(onlineUsers);

  if (isCheckingAuth && !authUser)
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    );
  return (
    <div >

      <Navbar />
      <Suspense fallback={<div><Loader2 className="h-5 w-5 animate-spin" />Loading...</div>}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
      <Toaster />

    </div>
  )
}

export default App
