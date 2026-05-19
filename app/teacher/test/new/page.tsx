"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function NewTestPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || 'Present vs Past Perfect', count: 10 })
      });
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (err) {
      alert("Soru üretilirken hata oluştu.");
    }
    setLoading(false);
  };

  const saveTest = async () => {
    if (!title || questions.length === 0) {
      alert("Lütfen test başlığı girin ve soru üretin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          targetClass: "10",
          timeLimitSec: 60,
          questions
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sınav başarıyla oluşturuldu! Sınav ID: " + data.test.id);
        window.location.href = '/teacher/tests/' + data.test.id;
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Sınav kaydedilemedi.");
    }
    setSaving(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Yeni Sınav Oluştur</h2>
        <Link href="/teacher" className="btn btn-secondary">İptal</Link>
      </header>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Sınav Başlığı</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            placeholder="Örn: 10. Sınıflar - Tense Quiz 1"
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'white' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Soru Üretilecek Konu veya Gramer Yapısı (AI İçin)</label>
          <input 
            type="text" 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            placeholder="Örn: Past Continuous vs Simple Past"
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'white' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={generateQuestions} 
          disabled={loading}
          style={{ width: '100%', marginBottom: '2rem' }}
        >
          {loading ? "Yapay Zeka Soruları Üretiyor..." : "Yapay Zeka ile Soru Üret"}
        </button>

        {questions.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Üretilen Sorular ({questions.length})
            </h3>
            {questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{idx + 1}. {q.content}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ color: q.correctAnswer === 'A' ? 'var(--success)' : 'inherit' }}>A) {q.optionA}</div>
                  <div style={{ color: q.correctAnswer === 'B' ? 'var(--success)' : 'inherit' }}>B) {q.optionB}</div>
                  <div style={{ color: q.correctAnswer === 'C' ? 'var(--success)' : 'inherit' }}>C) {q.optionC}</div>
                  <div style={{ color: q.correctAnswer === 'D' ? 'var(--success)' : 'inherit' }}>D) {q.optionD}</div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Odak: {q.grammarFocus} | İpucu: {q.contextHint}
                </div>
              </div>
            ))}

            <button 
              className="btn btn-primary" 
              onClick={saveTest} 
              disabled={saving}
              style={{ width: '100%', background: 'var(--success)' }}
            >
              {saving ? "Kaydediliyor..." : "Sınavı Veritabanına Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
