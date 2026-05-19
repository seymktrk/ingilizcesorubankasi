"use client";

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function TeacherDashboard() {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <h2>Öğretmen Paneli</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/teacher/reports" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginRight: '1rem' }}>
            📊 Raporlar
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {!showOptions ? (
          <button 
            className="btn btn-primary animate-fade-in" 
            onClick={() => setShowOptions(true)}
            style={{ 
              fontSize: '2.5rem', 
              padding: '2rem 4rem', 
              borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            🚀 Sınav Başlat
          </button>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem', maxWidth: '600px', width: '100%' }}>
            <h3 style={{ textAlign: 'center', fontSize: '1.8rem', color: 'var(--primary)' }}>Nasıl Başlamak İstersiniz?</h3>
            
            <Link 
              href="/teacher/test/new" 
              className="btn btn-primary" 
              style={{ fontSize: '1.2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '2rem' }}>✨</span>
              <span>Yapay Zeka ile Yeni Sınav Üret</span>
            </Link>

            <Link 
              href="/teacher/tests" 
              className="btn btn-secondary" 
              style={{ fontSize: '1.2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '2rem' }}>📁</span>
              <span>Hazır (Kayıtlı) Sınavlardan Seç</span>
            </Link>

            <button 
              onClick={() => setShowOptions(false)}
              style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Vazgeç ve Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
