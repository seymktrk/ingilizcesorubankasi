# İngilizce Soru Bankası (Lise Modülü) 🚀

Bu proje, lise öğrencileri (9, 10, 11 ve 12. Sınıflar) için özel olarak geliştirilmiş, **Yapay Zeka (AI)** destekli ve **Karekod (QR Code)** entegrasyonlu modern bir İngilizce Soru Bankası platformudur.

🌐 **CANLI DEMO (VERCEL):** [https://ingilizcesorubankasi-rpnr.vercel.app](https://ingilizcesorubankasi-rpnr.vercel.app)

---

## 🌟 Öne Çıkan Özellikler

### 👩‍🏫 Öğretmen Paneli
- **Sadeleştirilmiş "Tek Tuş" Deneyimi:** Sınıf içinde kullanım (akıllı tahta) için tasarlanmış dev "Sınav Başlat" butonu. Saniyeler içinde yapay zekadan veya kayıtlardan sınav seçilebilir.
- **Yapay Zeka ile Soru Üretimi:** Google Gemini AI kullanılarak, öğretmenin girdiği konu başlığına (Örn: Present Perfect) uygun İngilizce sorular saniyeler içinde dinamik olarak üretilir.
- **Akıllı Tahta ve QR Entegrasyonu:** Sınav oluşturulduğu an akıllı tahtaya dev bir QR kod yansır.
- **Canlı Sınav Takibi ve Sınıf İstatistikleri:** 
  - Öğrenciler sınava girdiğinde, hangi öğrencinin kaç soruyu çözdüğü canlı olarak listelenir.
  - Sınav sırasındaki anlık doğru/yanlış dağılımı (Soru 1: %80 Doğru, A: %10, B: %80 vb.) her soru için "Genel Değerlendirme" ekranında gösterilir. Sınıfça soruların analizini yapmak için kusursuzdur.

### 👨‍🎓 Öğrenci Deneyimi
- **Hızlı Giriş:** Akıllı tahtadaki QR kodu okutarak veya ana sayfadan tıklayarak anında sınava katılım.
- **İsimle Katılım:** Öğrenciler kendi adlarını yazarak sınava başlar.
- **Toplu Değerlendirme Ekranı:** Öğrenci kendi sınavını bitirdiğinde, kendi skorunun yanı sıra "Sınıfın Genel Durumu" panelini de görür. Böylece zorlandığı bir soruyu sınıfın geneli nasıl yapmış, onu değerlendirebilir.
- **Modern Arayüz:** Glassmorphism tasarım trendi ile geliştirilmiş, göz yormayan, telefon ve tablet uyumlu (Responsive) ekran.

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** Next.js 14, React, Vanilla CSS (Glassmorphism UI)
- **Backend:** Next.js API Routes (Serverless)
- **Veritabanı:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Yapay Zeka:** Google GenAI (Gemini) API
- **Kimlik Doğrulama:** NextAuth.js
- **Ekstra Kütüphaneler:** html5-qrcode (Kamera okuma), qrcode.react (QR oluşturma)

---

## 🔐 Giriş Bilgileri (Demo İçin)
- **Öğretmen Paneli Şifresi:** `12345`

---

*Bu proje, öğretmenlerin sınıf içi sınav ve takip süreçlerini dijitalleştirmek amacıyla geliştirilmiştir.*
