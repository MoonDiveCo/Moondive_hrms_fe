"use client"
import LoginForm from '@/components/Loginpage/LoginForm'
import ForgotModal from '@/components/Loginpage/ForgotModal'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { NotificationProvider } from '@/context/notificationcontext';

const Page = () => {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const bgImage = "/mnt/data/f74cd845-284d-46a6-b45b-6b71300493c8.png";
  const [isInvited, setInvited] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
      setInvited(true);
    }
  }, [searchParams]);

  return (
    <NotificationProvider>
      <div className='relative  w-full flex justify-center'>
        <LoginForm
          email={email}
          setEmail={setEmail}
          setShowForgotModal={setShowForgotModal}
          redirectTo="hrms"
          isInvited={isInvited}
        />

        {showForgotModal && (
          <div
            className="absolute w-full flex items-center justify-center"
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
    </NotificationProvider>
  );
}

export default Page;