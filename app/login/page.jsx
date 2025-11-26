"use client"
import LoginForm from '@/components/Loginpage/LoginForm'
import ForgotModal from '@/components/Loginpage/ForgotModal'
import React, { useState } from 'react'
import { GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const page = () => {
  const [showForgotModal, setShowForgotModal] = useState(false);
    const [email, setEmail] = useState("");
 const bgImage = "/mnt/data/f74cd845-284d-46a6-b45b-6b71300493c8.png";
  const googleProvider = new GoogleAuthProvider();
 
   const handleGoogleSignup = async () => {
     try {
       const result = await signInWithPopup(auth, googleProvider);
       const user = result.user;
 
       // Extract user data from Google and show modal
       const googleData = {
         firstName: user.displayName?.split(" ")[0] || "",
         lastName: user.displayName?.split(" ")[1] || "",
         email: user.email || "",
         acceptedTerms: false,
       };
 
       setGoogleUserData(googleData);
       setShowGoogleModal(true);
     } catch (error) {
       console.error("Google Sign-in Error:", error);
     }
   };
  return (
    <div className='relative'>
    <LoginForm

        email={email}
        setEmail={setEmail}
        setShowForgotModal={setShowForgotModal}
        handleGoogleSignup={handleGoogleSignup}
      />
      {

      }
    
         {showForgotModal && (
          <div
      className="absolute  w-full flex items-center justify-center"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      
    >
        <ForgotModal
          email={email}
          onClose={() => {
            setShowForgotModal(false);
          }}
          setEmail={setEmail}
        />
          </div>
      )}
  
   
    </div>    
  )
    
}
export default page