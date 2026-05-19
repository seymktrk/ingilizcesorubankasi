import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function TeacherDashboard() {
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Öğretmen Paneli</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <LogoutButton />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3>Test Yönetimi</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Yeni nesil yapay zeka destekli sorularla testler oluşturun.</p>
          <Link href="/teacher/test/new" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
            Yeni Test Oluştur (AI / OCR)
          </Link>
        </div>

        <div className="glass-panel">
          <h3>Sınıf Analizleri</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>9, 10, 11 ve 12. sınıfların Present/Past Perfect başarı istatistikleri.</p>
          <Link href="/teacher/reports" className="btn btn-secondary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
            Raporları Görüntüle
          </Link>
        </div>
        
        <div className="glass-panel">
          <h3>Aktif Sınavlar</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Şu an devam eden QR kodlu sınavlarınızı yönetin.</p>
          <Link href="/teacher/tests" className="btn btn-secondary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
            Sınavları Yönet
          </Link>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>Öğrenci Girişi QR Kodu</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0', textAlign: 'center' }}>
            Öğrencilerinizin ana sayfaya veya öğrenci paneline hızlıca erişmesi için bu QR kodu okutmasını sağlayabilirsiniz.
          </p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ingilizcesorubankasi-rpnr.vercel.app/student" 
            alt="Öğrenci Girişi QR" 
            style={{ borderRadius: '12px', padding: '10px', background: 'white' }} 
          />
        </div>
      </div>
    </div>
  );
}
