"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LiveTestDashboard({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/tests/${params.id}/live`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setStats(json.stats || []);
          setTestTitle(json.testTitle);
        } else {
          setError(json.error || "Hata oluştu.");
        }
      } catch (err) {
        console.error(err);
        setError("Veri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) return <div className="container flex-center">Canlı İzleme Yükleniyor...</div>;
  if (error) return <div className="container flex-center"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{testTitle} (Canlı İzleme)</h2>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>🔴 Sınav Takibi Aktif (3 saniyede bir güncellenir)</p>
        </div>
        <Link href="/teacher/tests" className="btn btn-secondary">Geri Dön</Link>
      </header>

      {/* QR Code Section for Smartboard Projection */}
      {origin && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '16px' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${origin}/student?testId=${params.id}`} 
              alt="Sınav QR Kodu" 
              width={200}
              height={200}
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Öğrenciler İçin Sınav Bağlantısı</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Öğrencilerinizin sınava katılması için yandaki QR kodu telefonlarından okutmalarını isteyin.
            </p>
            <p style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block' }}>
              {origin}/student?testId={params.id}
            </p>
          </div>
        </div>
      )}

      {/* Question Statistics Section */}
      {stats && stats.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Sınıf Geneli Soru İstatistikleri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.map((s, idx) => (
              <div key={s.questionId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>Soru {s.questionIndex}</div>
                  <div style={{ fontWeight: 'bold', color: s.correctPct >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                    % {s.correctPct} Doğru
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.content}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>A:</span> %{s.optionsPct?.A}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>B:</span> %{s.optionsPct?.B}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>C:</span> %{s.optionsPct?.C}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>D:</span> %{s.optionsPct?.D}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
                  Toplam {s.totalAnswers} yanıt
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel">
        {data.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Henüz hiçbir öğrenci bu sınava katılmadı.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {data.map(d => (
              <div key={d.resultId} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{d.studentName}</h3>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Skor: {d.score}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>İlerleme:</span>
                  <span style={{ fontWeight: 'bold' }}>{d.answersCount} / {d.totalQuestions} Soru</span>
                </div>

                <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                  {/* Create a small block for each answered question */}
                  {Array.from({ length: d.totalQuestions }).map((_, i) => {
                    const ans = d.details[i];
                    if (!ans) {
                      return <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} title={`Soru ${i+1} Bekleniyor`} />;
                    }
                    return (
                      <div 
                        key={i} 
                        style={{ width: '20px', height: '20px', borderRadius: '4px', background: ans.isCorrect ? 'var(--success)' : 'var(--danger)' }} 
                        title={`Soru ${i+1}: ${ans.selectedOption} (${ans.isCorrect ? 'Doğru' : 'Yanlış'})`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
