"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const defaultMockQuestions = [
  { id: "m1", content: "I _______ to Paris three times in my life.", options: ["went", "have gone", "have been", "had been"], correctIndex: 2 },
  { id: "m2", content: "By the time the police arrived, the burglar _______ the house.", options: ["has left", "left", "had left", "was leaving"], correctIndex: 2 },
  { id: "m3", content: "She _______ her keys, so she can't open the door now.", options: ["lost", "has lost", "had lost", "was losing"], correctIndex: 1 },
  { id: "m4", content: "I didn't want to watch the movie because I _______ it before.", options: ["have seen", "saw", "had seen", "was seeing"], correctIndex: 2 },
  { id: "m5", content: "We _______ each other since we were in high school.", options: ["knew", "have known", "had known", "are knowing"], correctIndex: 1 },
  { id: "m6", content: "When I got to the station, the train _______.", options: ["already left", "has already left", "had already left", "was already leaving"], correctIndex: 2 },
  { id: "m7", content: "_______ you ever _______ Japanese food?", options: ["Did / eat", "Have / eaten", "Had / eaten", "Are / eating"], correctIndex: 1 },
  { id: "m8", content: "He was very tired because he _______ all day.", options: ["has worked", "worked", "had worked", "works"], correctIndex: 2 },
  { id: "m9", content: "I can't find my umbrella. Someone _______ it.", options: ["took", "has taken", "had taken", "was taking"], correctIndex: 1 },
  { id: "m10", content: "They _______ the project by the time the manager asked for it.", options: ["have finished", "finished", "had finished", "were finishing"], correctIndex: 2 }
];

function StudentTestLogic() {
  const searchParams = useSearchParams();
  const testId = searchParams?.get('testId');

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [nameInputStep, setNameInputStep] = useState(1); // 1: First name, 2: Last name
  const [resultId, setResultId] = useState<string | null>(null);
  
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes global timer
  
  useEffect(() => {
    let intervalId: any;
    
    async function fetchTests(isSilent = false) {
      if (!isSilent) setLoadingTests(true);
      try {
        const res = await fetch('/api/tests');
        const data = await res.json();
        if (data.success && data.tests) {
          setAllTests(data.tests);
        }
      } catch (err) {
        console.error("Error fetching active tests:", err);
      } finally {
        if (!isSilent) {
          setLoadingTests(false);
          setLoading(false);
        }
      }
    }
    
    // Initial fetch
    fetchTests(false);
    
    if (!isStarted) {
      intervalId = setInterval(() => {
        fetchTests(true);
      }, 4000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted || isFinished || timeLeft <= 0 || questions.length === 0 || loading) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft, questions.length, loading]);

  const handleNameStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInputStep === 1) {
      if (!studentFirstName.trim()) return;
      setNameInputStep(2);
    } else {
      if (!studentLastName.trim()) return;
      const fullName = `${studentFirstName.trim()} ${studentLastName.trim()}`;
      setStudentName(fullName);
      setIsNameSubmitted(true);
    }
  };

  const selectAndStartTest = async (chosenTestId: string | null) => {
    setStarting(true);
    setActiveTestId(chosenTestId);
    
    if (chosenTestId) {
      try {
        const res = await fetch(`/api/tests/${chosenTestId}`);
        const data = await res.json();
        if (data.test && data.test.questions) {
          const formatted = data.test.questions.map((q: any) => ({
            id: q.id,
            content: q.content,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctIndex: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)
          }));
          setQuestions(formatted.sort(() => Math.random() - 0.5));
          setTimeLeft(data.test.questions.length * data.test.timeLimitSec);
          
          const startRes = await fetch('/api/results/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId: chosenTestId, studentName })
          });
          const startData = await startRes.json();
          if (startData.success) {
            setResultId(startData.resultId);
          }
        }
      } catch (err) {
        console.error("Test load/start error:", err);
      }
    } else {
      // Fallback demo questions
      setQuestions([...defaultMockQuestions].sort(() => Math.random() - 0.5));
      setTimeLeft(300);
    }
    
    setIsStarted(true);
    setStarting(false);
  };

  const finishTest = async () => {
    setIsFinished(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const labels = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;
    
    if (isCorrect) setCorrectCount(prev => prev + 1);
    else setIncorrectCount(prev => prev + 1);

    if (resultId) {
      await fetch('/api/results/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId,
          questionId: currentQ.id,
          selectedOption: labels[selectedOption],
          isCorrect,
          timeSpentSec: 10
        })
      });
    }

    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      finishTest();
    }
  };

  if (loading) return <div className="container flex-center">Sınavlar Yükleniyor...</div>;

  if (!isStarted && allTests.length === 0) {
    return (
      <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh', maxWidth: '800px', width: '100%' }}>
        <div className="glass-panel" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.08), inset 0 0 20px rgba(239, 68, 68, 0.05)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          width: '100%'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0) 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)',
                animation: 'pulse 2.5s infinite ease-in-out'
              }}>
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>

            <h3 style={{ fontSize: '2rem', color: '#fca5a5', marginBottom: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Şu Anda Anlık Olarak Bir Sınav Yok!
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
              Şu anda öğretmeniniz tarafından başlatılmış veya tanımlanmış aktif bir sınav bulunmamaktadır. 
              Sınav girişlerinin açılabilmesi için öncelikle öğretmeninizin bir sınav başlatması gerekmektedir.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.65rem 1.5rem',
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(4px)',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e',
                display: 'inline-block',
                animation: 'greenPulse 1.5s infinite ease-in-out'
              }} />
              <span style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '600', letterSpacing: '0.3px' }}>
                Canlı Olarak Yeni Sınavlar Taranıyor...
              </span>
            </div>

            <div>
              <button className="btn btn-secondary" onClick={() => window.location.href = '/'} style={{ fontSize: '0.95rem', background: 'rgba(255,255,255,0.05)' }}>
                🏠 Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isNameSubmitted) {
    return (
      <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ 
          width: '100%', 
          maxWidth: '420px', 
          textAlign: 'center',
          position: 'relative',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(79, 70, 229, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)'
        }}>
          {/* Step indicator dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: nameInputStep === 1 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: nameInputStep === 1 ? '0 0 12px var(--primary)' : 'none',
              transform: nameInputStep === 1 ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: nameInputStep === 2 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: nameInputStep === 2 ? '0 0 12px var(--primary)' : 'none',
              transform: nameInputStep === 2 ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Öğrenci Girişi
          </h2>
          
          <form onSubmit={handleNameStepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {nameInputStep === 1 ? (
              <div key="step-1" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Sınavlara katılabilmek için lütfen ilk olarak <strong>adınızı</strong> giriniz.
                </p>
                <input
                  type="text"
                  placeholder="Adınız (Örn: Ahmet)"
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-main)',
                    fontSize: '1.05rem',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  autoFocus
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                  Devam Et ➔
                </button>
              </div>
            ) : (
              <div key="step-2" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Harika! Şimdi de lütfen <strong>soyadınızı</strong> giriniz.
                </p>
                <input
                  type="text"
                  placeholder="Soyadınız (Örn: Yılmaz)"
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-main)',
                    fontSize: '1.05rem',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  autoFocus
                  required
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setNameInputStep(1)} 
                    style={{ 
                      flex: 1, 
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}
                  >
                    ⬅ Geri
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem' }}>
                    Sınava Katıl ⚡
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    const qrTest = allTests.find(t => t.id === testId);

    return (
      <div className="container animate-fade-in" style={{ padding: '2rem 0', minHeight: '80vh', maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: 'var(--primary)' }}>Hoş Geldin, {studentName}!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Sınav durumunuz ve katılım paneli aşağıda gösterilmektedir.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => {
            setIsNameSubmitted(false);
            setNameInputStep(1);
            setStudentFirstName("");
            setStudentLastName("");
            setStudentName("");
          }} style={{ fontSize: '0.9rem' }}>
            İsmi Değiştir
          </button>
        </div>

        {testId && qrTest && (
          <div className="glass-panel" style={{ 
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(236, 72, 153, 0.15))', 
            border: '2px solid var(--primary)',
            marginBottom: '2rem',
            padding: '2rem',
            borderRadius: '16px'
          }}>
            <span style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              QR KOD İLE OKUTULAN SINAV
            </span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{qrTest.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Sınıf: {qrTest.targetClass}. Sınıf | Soru Sayısı: {qrTest.questions?.length || qrTest._count?.questions || 0} Soru | Süre: {qrTest.timeLimitSec}sn/soru
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => selectAndStartTest(qrTest.id)} 
              disabled={starting}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              {starting ? 'Başlatılıyor...' : 'Sınava Hemen Başla ⚡'}
            </button>
          </div>
        )}

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔴 Aktif ve Mevcut Sınavlar
          </h3>
          
          {loadingTests ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Sınavlar yükleniyor...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allTests.map(t => (
                <div key={t.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => !starting && selectAndStartTest(t.id)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{t.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Sınıf: {t.targetClass}. Sınıf | {t.questions?.length || t._count?.questions || 0} Soru | Süre: {t.timeLimitSec}sn/soru
                    </p>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={(e) => { e.stopPropagation(); selectAndStartTest(t.id); }} 
                    disabled={starting}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Katıl ➔
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4 style={{ color: 'var(--text)' }}>Pratik Yapmak İster Misin?</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Herhangi bir öğretmenin sınavı olmadan demo sorularla pratik yapabilirsiniz.</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => selectAndStartTest(null)}
              disabled={starting}
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Demo Sınavı Başlat ⚙️
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = questions.length;
    const emptyCount = total - correctCount - incorrectCount;
    
    const correctPct = Math.round((correctCount / total) * 100);
    const incorrectPct = Math.round((incorrectCount / total) * 100);
    const emptyPct = Math.round((emptyCount / total) * 100);

    return (
      <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2>Sınav Tamamlandı!</h2>
          {timeLeft === 0 && (
            <p style={{ color: 'var(--danger)', fontWeight: 'bold', margin: '1rem 0' }}>Süreniz dolduğu için sınav otomatik sonlandırıldı.</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '3rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>%{correctPct}</div>
              <div style={{ color: 'var(--text-muted)' }}>Doğru ({correctCount})</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>%{incorrectPct}</div>
              <div style={{ color: 'var(--text-muted)' }}>Yanlış ({incorrectCount})</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>%{emptyPct}</div>
              <div style={{ color: 'var(--text-muted)' }}>Boş ({emptyCount})</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
              Ana Sayfaya Dön
            </button>
            {activeTestId && (
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = `/student/stats?testId=${activeTestId}&studentName=${encodeURIComponent(studentName)}`}
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                📊 Sınıf İstatistiklerini İncele
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <h3>Soru {currentIndex + 1} / {questions.length}</h3>
          <div style={{ color: timeLeft <= 60 ? 'var(--danger)' : 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏳ {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          {currentQ.content}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQ.options.map((opt: string, i: number) => {
            let buttonStyle: any = { justifyContent: 'flex-start', padding: '1rem', fontSize: '1.1rem', transition: 'all 0.2s' };
            if (isSubmitted) {
              if (i === currentQ.correctIndex) {
                buttonStyle.backgroundColor = 'var(--success)';
                buttonStyle.color = 'white';
              } else if (selectedOption === i) {
                buttonStyle.backgroundColor = 'var(--danger)';
                buttonStyle.color = 'white';
              }
            } else if (selectedOption === i) {
              buttonStyle.border = '2px solid var(--primary)';
              buttonStyle.backgroundColor = 'var(--surface)';
            }
            return (
              <button 
                key={i} 
                onClick={() => handleOptionClick(i)}
                className={`btn ${selectedOption === i && !isSubmitted ? 'btn-primary' : 'btn-secondary'}`} 
                style={buttonStyle}
              >
                <span style={{ fontWeight: 'bold', marginRight: '1rem', color: isSubmitted && (i === currentQ.correctIndex || selectedOption === i) ? 'white' : 'var(--primary)' }}>
                  {labels[i]}
                </span> 
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          {!isSubmitted ? (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={selectedOption === null} style={{ opacity: selectedOption === null ? 0.5 : 1 }}>
              Cevapla
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext} style={{ background: 'var(--success)' }}>
              {currentIndex === questions.length - 1 ? 'Testi Bitir' : 'Sıradaki Soru ➔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="container flex-center">Sayfa Yükleniyor...</div>}>
      <StudentTestLogic />
    </Suspense>
  );
}
