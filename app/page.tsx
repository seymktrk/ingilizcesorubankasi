import Link from 'next/link';

export default function Home() {
  return (
    <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', width: '100%' }}>
      <h1 style={{ background: 'linear-gradient(to right, var(--secondary), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Lise İngilizce Soru Bankası
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Özellikle Present Perfect ve Past Perfect zamanlarına odaklanan, B1-B2 seviyesi yeni nesil soru platformu.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Link href="/teacher" className="btn btn-primary">
          Öğretmen Girişi
        </Link>
        <Link href="/student" className="btn btn-secondary">
          Öğrenci Girişi
        </Link>
      </div>
    </div>
  );
}
