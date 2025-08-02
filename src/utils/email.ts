import nodemailer from 'nodemailer'

// Hostinger SMTP transporter'ı oluştur
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger SMTP sunucusu
  port: 465, // SSL port (Hostinger'ın resmi ayarı)
  secure: true, // SSL kullan (Hostinger'ın resmi ayarı)
  auth: {
    user: process.env.EMAIL_USER, // info@nerayapi.com
    pass: process.env.EMAIL_PASS  // Hostinger e-posta şifresi
  },
  tls: {
    rejectUnauthorized: false
  }
})

// Transporter'ı test et
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Bağlantı hatası:', error)
  } else {
    console.log('SMTP Sunucu hazır')
  }
})

// İletişim formu e-postası gönder
export async function sendContactEmail(contactData: {
  name: string
  email: string
  phone?: string
  message: string
}) {
  const { name, email, phone, message } = contactData

  console.log('E-posta gönderme başlıyor...')
  console.log('Gönderen:', process.env.EMAIL_USER)
  console.log('Alıcı:', process.env.EMAIL_USER)

  const mailOptions = {
    from: process.env.EMAIL_USER, // Basit from adresi
    to: process.env.EMAIL_USER, // Kendi e-posta adresinize gönderilecek
    subject: `Yeni İletişim Formu Mesajı - ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B6B; border-bottom: 2px solid #FF6B6B; padding-bottom: 10px;">
          Yeni İletişim Formu Mesajı
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D3436; margin-top: 0;">Gönderen Bilgileri:</h3>
          <p><strong>Ad Soyad:</strong> ${name}</p>
          <p><strong>E-posta:</strong> <a href="mailto:${email}" style="color: #FF6B6B;">${email}</a></p>
          ${phone ? `<p><strong>Telefon:</strong> <a href="tel:${phone}" style="color: #FF6B6B;">${phone}</a></p>` : ''}
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #2D3436; margin-top: 0;">Mesaj:</h3>
          <p style="line-height: 1.6; color: #636E72;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724; font-size: 14px;">
            <strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #636E72; font-size: 12px;">
          <p>Bu e-posta Nera Yapı web sitesi iletişim formundan gönderilmiştir.</p>
        </div>
      </div>
    `
  }

  try {
    console.log('Mail options:', mailOptions)
    const result = await transporter.sendMail(mailOptions)
    console.log('E-posta başarıyla gönderildi:', result)
    return { success: true }
  } catch (error) {
    console.error('E-posta gönderme hatası:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
  }
}

// Otomatik yanıt e-postası gönder
export async function sendAutoReply(toEmail: string, name: string) {
  console.log('Otomatik yanıt gönderme başlıyor...')
  console.log('Alıcı:', toEmail)

  const mailOptions = {
    from: process.env.EMAIL_USER, // Basit from adresi
    to: toEmail,
    subject: 'Mesajınız Alındı - Nera Yapı',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B6B; border-bottom: 2px solid #FF6B6B; padding-bottom: 10px;">
          Mesajınız Alındı
        </h2>
        
        <p>Sayın ${name},</p>
        
        <p>İletişim formunuzdan gönderdiğiniz mesaj başarıyla alınmıştır. En kısa sürede size geri dönüş yapacağız.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D3436; margin-top: 0;">İletişim Bilgilerimiz:</h3>
          <p><strong>Adres:</strong> Bozköy Mah. Sanayi Cad. Yeni Foça Yolu Üzeri No:9 Aliağa/İzmir</p>
          <p><strong>Telefon:</strong> +90 (532) 717 4087</p>
          <p><strong>E-posta:</strong> info@nerayapi.com</p>
        </div>
        
        <p>Teşekkür ederiz,<br>
        <strong>Nera Yapı Ekibi</strong></p>
      </div>
    `
  }

  try {
    console.log('Auto reply mail options:', mailOptions)
    const result = await transporter.sendMail(mailOptions)
    console.log('Otomatik yanıt başarıyla gönderildi:', result)
    return { success: true }
  } catch (error) {
    console.error('Otomatik yanıt gönderme hatası:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
  }
} 