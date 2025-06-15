'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { shuffleArray } from '@/utils/array'

interface TeamMember {
  id: number
  name: string
  position: string
  image: string
  description: string
  photo?: string
}

export default function Hakkimizda() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [randomImages, setRandomImages] = useState<{[key: string]: string}>({});
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => {
        setTeamMembers(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Ekip üyeleri yüklenirken hata:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetch("/api/projeler")
      .then((res) => res.json())
      .then((projects) => {
        const allImages = projects.flatMap((p: any) => [p.coverImage, ...(p.images || [])]).filter(Boolean);
        if (allImages.length > 0) {
          // Her bölge için benzersiz görseller seç
          const shuffledImages = shuffleArray([...allImages]);
          
          // Ana görsel için 1 benzersiz görsel
          const mainImage = shuffledImages[0];
          
          // Ekip üyeleri için 3 benzersiz görsel
          const ekipImages = shuffledImages.slice(1, 4);
          
          // Yorum bölümü için 2 benzersiz görsel
          const yorumImages = shuffledImages.slice(4, 6);

          const newRandomImages = {
            main: mainImage,
            ekip1: ekipImages[0],
            ekip2: ekipImages[1],
            ekip3: ekipImages[2],
            yorumGorsel: yorumImages[0],
            yorumProfil: yorumImages[1]
          };
          setRandomImages(newRandomImages);
        }
      });
  }, []);

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => setFaqs(Array.isArray(data) ? data : []));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>
  }

  return (
    <main className="w-full min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Başlık */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-12">
          Doğayla Bütünleşen Hayaller
        </h1>
        {/* İki sütun metin */}
        <div className="flex flex-col md:flex-row gap-12 mb-12">
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-2">Vizyonumuz</h2>
            <p className="text-gray-700">
              Sadece bir ev değil, özgürlük ve huzur sunan yaşam alanları inşa ediyoruz. Tiny house ile doğanın kalbinde, sürdürülebilir bir hayatı mümkün kılıyoruz.
            </p>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-2">Neden Tiny House?</h2>
            <p className="text-gray-700">
              Minimalizmin zarafetiyle, çevreye duyarlı ve fonksiyonel yaşam alanları tasarlıyoruz. Her projemiz, hayallerinizi ve doğayı buluşturmak için var.
            </p>
          </div>
        </div>
        {/* Altında geniş görsel */}
        <div className="w-full mb-20">
          {randomImages.main && (
          <Image
              src={randomImages.main}
            alt="Tiny House İnşaat"
            width={1600}
            height={600}
            className="rounded-3xl w-full object-cover"
          />
          )}
        </div>
        {/* Ekibimiz Bölümü */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Hayalinizi Gerçeğe Dönüştüren Ekip</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-col items-center bg-gray-100 rounded-2xl p-6">
                <div className="relative h-28 w-28 mb-4">
                  <Image
                    src={member.photo || '/placeholder-profile.png'}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="font-bold text-lg text-gray-900">{member.name}</div>
                <div className="text-gray-600">{member.position}</div>
              </div>
            ))}
          </div>
        </div>
            </div>
      {/* SSS Bölümü */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50 flex justify-center">
        <div className="max-w-3xl w-full flex flex-col items-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6 w-full">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/80 rounded-xl shadow p-6">
                <h3 className="font-semibold text-lg mb-2 text-[#FF6B6B]">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

const values = [
  {
    icon: "🎯",
    title: "Müşteri Memnuniyeti",
    description: "Her projede müşterilerimizin beklentilerini aşmayı hedefliyoruz."
  },
  {
    icon: "🌱",
    title: "Sürdürülebilirlik",
    description: "Çevre dostu malzemeler ve enerji tasarruflu sistemler kullanıyoruz."
  },
  {
    icon: "💡",
    title: "Yenilikçilik",
    description: "Modern tasarım ve teknolojileri projelerimize entegre ediyoruz."
  }
] 