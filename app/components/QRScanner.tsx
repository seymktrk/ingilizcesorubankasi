"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          // On success
          if (scanner) {
            scanner.clear();
          }
          setScanning(false);
          // Assuming the QR code is a valid URL to the test
          if (decodedText.startsWith("http")) {
            // we can redirect to the relative path if it's our own domain
            try {
              const url = new URL(decodedText);
              router.push(url.pathname);
            } catch {
              router.push(decodedText);
            }
          } else {
            router.push(decodedText);
          }
        },
        (error) => {
          // Optional: handle errors or just ignore them (it triggers frequently)
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [scanning, router]);

  return (
    <div style={{ margin: "2rem auto", maxWidth: "400px", width: "100%" }}>
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="btn btn-secondary"
          style={{ width: "100%", padding: "1.5rem", fontSize: "1.2rem" }}
        >
          📷 QR Kod Okut
        </button>
      ) : (
        <div className="glass-panel">
          <div id="reader" style={{ width: "100%" }}></div>
          <button
            onClick={() => setScanning(false)}
            className="btn btn-secondary"
            style={{ marginTop: "1rem", width: "100%", background: "rgba(255,0,0,0.2)" }}
          >
            İptal
          </button>
        </div>
      )}
    </div>
  );
}
