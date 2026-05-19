"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LiveTestDashboard({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/tests/${params.id}/live`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{testTitle} (Canlı)</h2>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>🔴 Sınav Takibi Aktif (3 saniyede bir güncellenir)</p>
        </div>
        <Link href="/teacher/tests" className="btn btn-secondary">Geri Dön</Link>
      </header>

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
