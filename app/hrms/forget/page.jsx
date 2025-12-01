"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ForgotFlowModal from "../../../components/Loginpage/ForgotModal"; 

export default function ForgotPage() {
  const router = useRouter();
  const [initialEmail, setInitialEmail] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const e = sessionStorage.getItem("forgotEmail") || "";
    setInitialEmail(e);
    setShowModal(true);
  }, []);

  function handleClose() {
    sessionStorage.removeItem("forgotEmail");
    sessionStorage.removeItem("resetToken");
    setShowModal(false);
    router.push("/login");
  }

  const bgImage = "/mnt/data/f74cd845-284d-46a6-b45b-6b71300493c8.png";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/30 pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl p-4">
        {showModal && (
          <ForgotFlowModal initialEmail={initialEmail} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
