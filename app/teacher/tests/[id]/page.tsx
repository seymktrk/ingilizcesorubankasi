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
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

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

  const toggleExpandQuestion = (questionId: string) => {
    setExpandedQuestionId(prev => prev === questionId ? null : questionId);
  };

  const getStudentsByAnswerStatus = (questionId: string) => {
    const correctStudents: string[] = [];
    const incorrectOrUnansweredStudents: string[] = [];

    data.forEach((student: any) => {
      const answer = student.details.find((d: any) => d.questionId === questionId);
      if (answer) {
        if (answer.isCorrect) {
          correctStudents.push(`${student.studentName} (${answer.selectedOption} şıkkı)`);
        } else {
          incorrectOrUnansweredStudents.push(`${student.studentName} (${answer.selectedOption} şıkkı)`);
        }
      } else {
        incorrectOrUnansweredStudents.push(`${student.studentName} (Henüz Yanıtlamadı)`);
      }
    });

    return { correctStudents, incorrectOrUnansweredStudents };
  };

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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            💡 Hangi soruyu hangi öğrencilerin doğru veya yanlış yaptığını görmek için <strong>soru kartının üzerine tıklayın</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.map((s) => {
              const isExpanded = expandedQuestionId === s.questionId;
              const { correctStudents, incorrectOrUnansweredStudents } = getStudentsByAnswerStatus(s.questionId);
              
              return (
                <div 
                  key={s.questionId} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem', 
                    padding: '1.25rem', 
                    background: isExpanded ? 'rgba(79, 70, 229, 0.08)' : 'rgba(0,0,0,0.2)', 
                    border: isExpanded ? '1px solid var(--primary)' : '1px solid transparent',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleExpandQuestion(s.questionId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isExpanded ? 'var(--primary)' : 'inherit' }}>
                      Soru {s.questionIndex} {isExpanded ? '▼' : '▶'}
                    </div>
                    <div style={{ fontWeight: 'bold', color: s.correctPct >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                      % {s.correctPct} Doğru
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{s.content}</div>
                  
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

                  {/* Expanded Student List */}
                  {isExpanded && (
                    <div style={{ 
                      marginTop: '1.25rem', 
                      paddingTop: '1.25rem', 
                      borderTop: '1px solid var(--border)', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                      gap: '1.5rem',
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking inside lists
                    >
                      <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                        <h5 style={{ color: 'var(--success)', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
                          🟢 Doğru Yapanlar ({correctStudents.length})
                        </h5>
                        {correctStudents.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Henüz doğru cevap veren yok.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {correctStudents.map((st, i) => (
                              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✓ {st}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <h5 style={{ color: 'var(--danger)', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
                          🔴 Yanlış Yapanlar / Cevaplamayanlar ({incorrectOrUnansweredStudents.length})
                        </h5>
                        {incorrectOrUnansweredStudents.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Herkes doğru yanıtladı!</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {incorrectOrUnansweredStudents.map((st, i) => (
                              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✗ {st}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
                    Toplam {s.totalAnswers} yanıt • Tıklayarak detayları göster/gizle
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Progress List Section */}
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

                {/* Numbered and Color-coded question boxes for all 1-to-N questions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {stats.map((s) => {
                    const studentAnswer = d.details.find((ans: any) => ans.questionId === s.questionId);
                    
                    let bgColor = 'rgba(255, 255, 255, 0.05)';
                    let borderStyle = '1px solid var(--border)';
                    let titleText = `Soru ${s.questionIndex}: Yanıt Bekleniyor`;
                    let textColor = 'var(--text-muted)';
                    
                    if (studentAnswer) {
                      bgColor = studentAnswer.isCorrect ? 'var(--success)' : 'var(--danger)';
                      borderStyle = 'none';
                      textColor = 'white';
                      titleText = `Soru ${s.questionIndex}: ${studentAnswer.selectedOption} (${studentAnswer.isCorrect ? 'Doğru' : 'Yanlış'})`;
                    }
                    
                    return (
                      <div 
                        key={s.questionId} 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '6px', 
                          background: bgColor, 
                          border: borderStyle,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          color: textColor,
                          transition: 'all 0.2s',
                          cursor: 'default'
                        }} 
                        title={titleText}
                      >
                        {s.questionIndex}
                      </div>
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
