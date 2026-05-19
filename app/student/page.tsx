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
  const [resultId, setResultId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes global timer
  
  // Track answer details for DB
  const [answerDetails, setAnswerDetails] = useState<any[]>([]);
  
  // Track class stats for post-test evaluation
  const [classStats, setClassStats] = useState<any[]>([]);

  useEffect(() => {
    async function loadTest() {
      if (testId) {
        try {
          const res = await fetch(`/api/tests/${testId}`);
          const data = await res.json();
          if (data.test && data.test.questions) {
            // Map the DB questions to the format we use locally
            const formatted = data.test.questions.map((q: any) => ({
              id: q.id,
              content: q.content,
              options: [q.optionA, q.optionB, q.optionC, q.optionD],
              correctIndex: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)
            }));
            setQuestions(formatted.sort(() => Math.random() - 0.5));
            setTimeLeft(data.test.questions.length * data.test.timeLimitSec); // Calculate total time based on per-question limit
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback demo questions if no testId
        setQuestions([...defaultMockQuestions].sort(() => Math.random() - 0.5));
      }
      setLoading(false);
    }
    loadTest();
  }, [testId]);

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

  const startTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    
    setStarting(true);
    if (testId) {
      try {
        const res = await fetch('/api/results/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId, studentName })
        });
        const data = await res.json();
        if (data.success) {
          setResultId(data.resultId);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsStarted(true);
    setStarting(false);
  };

  const finishTest = async () => {
    setIsFinished(true);
    
    // Fetch class stats for evaluation
    if (testId) {
      try {
        const res = await fetch(`/api/tests/${testId}/live`);
        const json = await res.json();
        if (json.success && json.stats) {
          setClassStats(json.stats);
        }
      } catch (e) {
        console.error("Stats fetch error:", e);
      }
    }
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

  if (loading) return <div className="container flex-center">Sınav Yükleniyor...</div>;
  if (questions.length === 0) return <div className="container flex-center">Test bulunamadı.</div>;

  if (!isStarted) {
    return (
      <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Sınava Giriş</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Lütfen başlamadan önce adınızı ve soyadınızı giriniz.</p>
          <form onSubmit={startTest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Adınız Soyadınız"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none'
              }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={starting}>
              {starting ? 'Başlatılıyor...' : 'Sınava Başla'}
            </button>
          </form>
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
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Ana Sayfaya Dön
          </button>
        </div>

        {classStats.length > 0 && (
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Sınıfın Genel Durumu
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {classStats.map((s, idx) => (
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
                </div>
              ))}
            </div>
          </div>
        )}
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
