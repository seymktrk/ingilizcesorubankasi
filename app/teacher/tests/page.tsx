import Link from 'next/link';
import prisma from '@/lib/prisma';
import QrButton from './QrButton';

// Server Component fetching from DB
export default async function TestsPage() {
  // Fetch tests from DB to show they exist
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: 'desc' },
    include: { questions: true }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Aktif Sınavlar</h2>
        <Link href="/teacher" className="btn btn-secondary">Geri Dön</Link>
      </header>
      <div className="glass-panel">
        {tests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Henüz oluşturulmuş bir sınav yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tests.map(t => (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>{t.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Hedef: {t.targetClass}. Sınıf | {t.questions.length} Soru | Süre: {t.timeLimitSec}sn/soru
                    </p>
                  </div>
                  <QrButton testId={t.id} />
                </div>
                
                <details style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
                  <summary style={{ fontWeight: 'bold', color: 'var(--primary)', outline: 'none' }}>Soruları Görüntüle</summary>
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {t.questions.map((q, idx) => (
                      <div key={q.id} style={{ paddingBottom: '1rem', borderBottom: idx !== t.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{idx + 1}. {q.content}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                          <div style={{ color: q.correctAnswer === 'A' ? 'var(--success)' : 'inherit' }}>A) {q.optionA}</div>
                          <div style={{ color: q.correctAnswer === 'B' ? 'var(--success)' : 'inherit' }}>B) {q.optionB}</div>
                          <div style={{ color: q.correctAnswer === 'C' ? 'var(--success)' : 'inherit' }}>C) {q.optionC}</div>
                          <div style={{ color: q.correctAnswer === 'D' ? 'var(--success)' : 'inherit' }}>D) {q.optionD}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
