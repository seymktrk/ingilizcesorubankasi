import Link from 'next/link';
import prisma from '@/lib/prisma';
import ReportsCharts from './Charts';

export const revalidate = 0; // Disable cache to always show fresh results

export default async function ReportsPage() {
  // Fetch results and include details
  const results = await prisma.result.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: true,
      test: true,
      details: {
        include: { question: true }
      }
    }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Sınıf Analizleri & Raporlar</h2>
        <Link href="/teacher" className="btn btn-secondary">Geri Dön</Link>
      </header>
      
      {results.length === 0 ? (
        <div className="glass-panel">
          <p style={{ color: 'var(--text-muted)' }}>Henüz çözülmüş bir sınav bulunmamaktadır.</p>
        </div>
      ) : (
        <>
          <ReportsCharts results={results} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map(r => {
            const correct = r.details.filter(d => d.isCorrect).length;
            const answered = r.details.length;
            const total = r.test.timeLimitSec ? r.test.timeLimitSec / 60 : 10; // hacky fallback
            
            return (
              <div key={r.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{r.test.title}</h3>
                  <div style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString('tr-TR')}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Öğrenci</p>
                    <p style={{ fontWeight: 'bold' }}>{r.student.name || 'Öğrenci'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Hedef Sınıf</p>
                    <p style={{ fontWeight: 'bold' }}>{r.test.targetClass}. Sınıf</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Doğru Sayısı</p>
                    <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>{correct} Doğru</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Genel Puan</p>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>{r.totalScore} Puan</p>
                  </div>
                </div>

                <details style={{ marginTop: '1.5rem', cursor: 'pointer' }}>
                  <summary style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Öğrencinin Cevap Detayları</summary>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    {r.details.map((d: any) => (
                      <div key={d.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Soru:</strong> {d.question.content}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Öğrenci Cevabı: <strong>{d.selectedOption || 'Boş'}</strong>
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Doğru Cevap: <strong>{d.question.correctAnswer}</strong>
                          </span>
                          <span style={{ color: d.isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                            {d.isCorrect ? '✔ Doğru' : '✖ Yanlış'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
