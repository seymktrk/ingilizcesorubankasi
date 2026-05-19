"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QrButton({ testId }: { testId: string }) {
  const [showQr, setShowQr] = useState(false);
  const [origin, setOrigin] = useState("");
  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleClick = () => {
    setShowQr(true);
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
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${origin}/student?testId=${testId}`} 
              alt="Sınav QR Kodu" 
              width={250}
              height={250}
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', animation: 'fadeIn 1s ease' }}>
            <button className="btn btn-secondary" onClick={() => setShowQr(false)}>Kapat</button>
            <button className="btn btn-primary" onClick={() => router.push(`/teacher/tests/${testId}`)}>
              Canlı İzleme Ekranına Git
            </button>
          </div>
        </div>
      )}
    </>
  );
}
