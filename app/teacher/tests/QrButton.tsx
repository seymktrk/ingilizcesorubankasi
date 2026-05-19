"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QrButton({ testId }: { testId: string }) {
  const [showQr, setShowQr] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setShowQr(true);
    // Wait 5 seconds, then redirect to student page
    setTimeout(() => {
      // Passing testId to student interface (student interface currently uses mock data, 
      // but this sets up the correct real architecture)
      router.push(`/student?testId=${testId}`);
    }, 5000);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={handleClick} style={{ whiteSpace: 'nowrap' }}>
        QR Kod Oluştur / Çözmeye Başla
      </button>

      {showQr && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <h2 style={{ marginBottom: '2rem', color: 'white', fontSize: '2rem', textAlign: 'center' }}>
            Öğrenciler İçin Sınav Bağlantısı
          </h2>
          
          <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', animation: 'fadeIn 0.3s ease' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://localhost:5000/student?testId=${testId}`} 
              alt="Sınav QR Kodu" 
              width={250}
              height={250}
            />
          </div>

          <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '1.2rem', animation: 'fadeIn 1s ease' }}>
            ⏳ 5 saniye içinde sınav ekranına yönlendiriliyorsunuz...
          </p>
        </div>
      )}
    </>
  );
}
