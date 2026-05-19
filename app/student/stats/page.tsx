"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function StatsLogic() {
  const searchParams = useSearchParams();
  const testId = searchParams?.get('testId');
  const studentName = searchParams?.get('studentName') || "";

  const [stats, setStats] = useState<any[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!testId) {
      setError("Geçersiz sınav kimliği.");
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const res = await fetch(`/api/tests/${testId}/live`);
        const json = await res.json();
        if (json.success) {
          setStats(json.stats || []);
          setTestTitle(json.testTitle || "İngilizce Sınavı");
        } else {
          setError(json.error || "İstatistikler alınamadı.");
        }
      } catch (err) {
        console.error(err);
        setError("Sunucu hatası oluştu.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    // Poll stats every 5 seconds to keep it updated in real-time
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [testId]);

  if (loading) {
    return (
      <div className="container flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.1)',
            borderTop: '5px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h3>Sınıf İstatistikleri Yükleniyor...</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Lütfen bekleyin, canlı veriler hesaplanıyor.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Hata Oluştu</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/student'}>
            Öğrenci Girişine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ 
            background: 'rgba(79, 70, 229, 0.1)', 
            color: 'var(--primary)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 'bold',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'inline-block',
            marginBottom: '0.5rem'
          }}>
            SINIF DEĞERLENDİRME PANELİ
          </span>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: 0 }}>{testTitle}</h2>
          {studentName && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Giriş Yapan Öğrenci: <strong style={{ color: 'var(--text-main)' }}>{studentName}</strong>
            </p>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => window.location.href = `/student?testId=${testId}`}>
          ⬅ Sınav Sayfasına Dön
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {stats.map((s) => {
          const successColor = s.correctPct >= 70 ? 'var(--success)' : s.correctPct >= 40 ? '#f59e0b' : 'var(--danger)';
          return (
            <div key={s.questionId} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  Soru {s.questionIndex}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  color: successColor, 
                  background: `rgba(${s.correctPct >= 70 ? '34, 197, 94' : s.correctPct >= 40 ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  border: `1px solid ${successColor}33`
                }}>
                  Class Accuracy: %{s.correctPct}
                </div>
              </div>

              <div style={{ fontSize: '1.15rem', marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {s.content}
              </div>

              {/* Progress Distribution */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {['A', 'B', 'C', 'D'].map((option) => {
                  const pct = s.optionsPct?.[option] || 0;
                  return (
                    <div key={option} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>Şık {option}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>%{pct}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease-out'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                Toplam {s.totalAnswers} öğrenci yanıtı listeleniyor • Canlı Güncellenir
              </div>
            </div>
          );
        })}
      </div>
      
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Lise İngilizce Soru Bankası • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function StudentStatsPage() {
  return (
    <Suspense fallback={
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3>Yükleniyor...</h3>
        </div>
      </div>
    }>
      <StatsLogic />
    </Suspense>
  );
}
