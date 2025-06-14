'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { shuffleArray } from '@/utils/array';

export default function Home() {
  const [randomImages, setRandomImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetch("/api/projeler")
      .then((res) => res.json())
      .then((projects) => {
        // Tüm projelerin kapak ve galeri görsellerini topla
        const allImages = projects.flatMap((p: any) => [p.coverImage, ...(p.images || [])]).filter(Boolean);
        if (allImages.length > 0) {
          // Her bölge için benzersiz görseller seç
          const shuffledImages = shuffleArray([...allImages]);
          
          // Hakkımızda bölümü için 2 benzersiz görsel
          const hakkimizdaImages = shuffledImages.slice(0, 2);
          
          // Galeri bölümü için 4 benzersiz görsel
          const galeriImages = shuffledImages.slice(2, 6);
          
          // Yorumlar bölümü için 2 benzersiz görsel
          const yorumImages = shuffledImages.slice(6, 8);
          
          // Hizmetlerimiz bölümü için 1 benzersiz görsel
          const hizmetlerImage = shuffledImages[8] || shuffledImages[0];

          const newRandomImages = {
            hakkimizda1: hakkimizdaImages[0],
            hakkimizda2: hakkimizdaImages[1],
            hizmetlerimiz: hizmetlerImage,
            galeri1: galeriImages[0],
            galeri2: galeriImages[1],
            galeri3: galeriImages[2],
            galeri4: galeriImages[3],
            yorum1: yorumImages[0],
            yorum2: yorumImages[1]
          };
          setRandomImages(newRandomImages);
        }
      });
  }, []);

  return (
    <main className="relative min-h-screen w-full">
      {/* Arka Plan Video */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed top-0 left-0 w-screen h-screen"
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="fixed inset-0 bg-black/40" />
      </div>

      {/* Hero İçerik */}
      <div className="container mx-auto flex flex-col justify-start items-end min-h-screen px-4 pt-8">
        <div className="max-w-2xl text-right mt-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow">
            Hayallerin Ötesinde<br />Tiny House Yaşamı
          </h1>
          <p className="text-lg md:text-2xl text-white mb-8 drop-shadow">
            Doğayla iç içe, özgür ve sürdürülebilir bir yaşam için modern tiny house çözümlerimizle tanışın. Hayalinizdeki evi birlikte inşa edelim!
          </p>
          <Link
            href="/iletisim"
            className="inline-block px-8 py-3 border border-white text-white rounded-full text-lg hover:bg-white hover:text-black transition font-medium"
          >
            Hayalime Başla
          </Link>
        </div>
      </div>

      {/* Kutucuklar Bölümü */}
      <div className="w-full flex justify-center md:-mt-72 -mt-8 mb-12 z-10 relative">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 px-4">
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white shadow">
            <h3 className="font-bold text-xl mb-2">Hayatınızı Hafifletin</h3>
            <p>Minimalizmin konforuyla, doğayla uyumlu ve fonksiyonel yaşam alanları.</p>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white shadow">
            <h3 className="font-bold text-xl mb-2">Doğayla Uyumlu Tasarım</h3>
            <p>Her tiny house, çevreye duyarlı malzemeler ve yenilikçi mimariyle tasarlanır.</p>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white shadow">
            <h3 className="font-bold text-xl mb-2">Sürdürülebilir Gelecek</h3>
            <p>Enerji verimliliği ve ekolojik çözümlerle, geleceğe değer katan evler.</p>
          </div>
        </div>
      </div>

      {/* Hakkımızda Bölümü */}
      <section className="w-full py-24 bg-white flex justify-center">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 px-4">
          {/* Sol: Metin */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Biz Kimiz?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Hayatın karmaşasından uzak, özgür ve sürdürülebilir bir yaşam sunmak için yola çıktık. Her tiny house projemizde, doğaya saygı ve modern yaşamı bir araya getiriyoruz.
            </p>
            <a
              href="/hakkimizda"
              className="inline-block px-8 py-3 border-2 border-gray-800 text-gray-900 rounded-full text-lg font-medium hover:bg-gray-900 hover:text-white transition"
            >
              Hikayemizi Keşfet
            </a>
          </div>
          {/* Sağ: Görseller */}
          <div className="flex-1 flex gap-6">
            <div className="w-1/2">
              {randomImages.hakkimizda1 && (
                <img
                  src={randomImages.hakkimizda1}
                  alt="Tiny House"
                  className="rounded-3xl object-cover w-full h-80"
                />
              )}
            </div>
            <div className="w-1/2">
              {randomImages.hakkimizda2 && (
                <img
                  src={randomImages.hakkimizda2}
                  alt="Tiny House"
                  className="rounded-3xl object-cover w-full h-80"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetlerimiz Bölümü */}
      <section className="w-full py-24 bg-gray-100 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col items-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Hayalinizdeki Tiny House İçin Her Şey</h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
            Tasarımdan anahtar teslimine kadar, size özel tiny house çözümleri sunuyoruz.
          </p>
          <div className="flex flex-col md:flex-row items-center w-full gap-12">
            {/* Sol: Görsel */}
            <div className="flex-1 flex justify-center">
              {randomImages.hizmetlerimiz && (
                <img
                  src={randomImages.hizmetlerimiz}
                  alt="Tiny House"
                  className="rounded-3xl object-cover w-full max-w-md h-96"
                />
              )}
            </div>
            {/* Sağ: Hizmetler */}
            <div className="flex-1 flex flex-col gap-8">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Hayal Tasarımı</h3>
                <p className="text-gray-700">Sizin için özgün ve fonksiyonel tiny house tasarımları.</p>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Doğayla Bütünleşik İnşa</h3>
                <p className="text-gray-700">Çevre dostu malzemelerle, doğayla uyumlu yapılar.</p>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Anahtar Teslim Mutluluk</h3>
                <p className="text-gray-700">Hayalinizdeki eve zahmetsizce kavuşun.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiny House Galerisi Bölümü */}
      <section className="w-full py-24 bg-white flex justify-center">
        <div className="max-w-7xl w-full flex flex-col items-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">İlham Veren Tiny House Projeleri</h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
            Gerçekleşen hayallerden ilham alın, kendi tiny house'unuz için fikir edinin.
          </p>
          <div className="w-full flex flex-col md:flex-row gap-6 justify-center">
            {randomImages.galeri1 && (
              <img
                src={randomImages.galeri1}
                alt="Tiny House 1"
                className="rounded-3xl object-cover w-full md:w-1/4 h-96"
              />
            )}
            {randomImages.galeri2 && (
              <img
                src={randomImages.galeri2}
                alt="Tiny House 2"
                className="rounded-3xl object-cover w-full md:w-1/4 h-96"
              />
            )}
            {randomImages.galeri3 && (
              <img
                src={randomImages.galeri3}
                alt="Tiny House 3"
                className="rounded-3xl object-cover w-full md:w-1/4 h-96"
              />
            )}
            {randomImages.galeri4 && (
              <img
                src={randomImages.galeri4}
                alt="Tiny House 4"
                className="rounded-3xl object-cover w-full md:w-1/4 h-96"
              />
            )}
          </div>
        </div>
      </section>

      {/* Farkımız Bölümü */}
      <section className="w-full py-24 bg-gradient-to-b from-white to-gray-50 flex justify-center">
        <div className="max-w-5xl w-full flex flex-col items-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Farkımız</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow p-6 hover:shadow-lg transition">
              <span className="text-3xl text-[#FF6B6B]">🎨</span>
              <div>
                <h3 className="font-semibold text-xl mb-1 text-gray-900">Kişiye Özel Tasarım</h3>
                <p className="text-gray-700">Her tiny house, sizin hayallerinize ve ihtiyaçlarınıza göre şekillenir.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow p-6 hover:shadow-lg transition">
              <span className="text-3xl text-[#FF6B6B]">🌱</span>
              <div>
                <h3 className="font-semibold text-xl mb-1 text-gray-900">Doğaya Saygılı Üretim</h3>
                <p className="text-gray-700">Sürdürülebilir ve çevre dostu malzemeler kullanıyoruz.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow p-6 hover:shadow-lg transition">
              <span className="text-3xl text-[#FF6B6B]">🤝</span>
              <div>
                <h3 className="font-semibold text-xl mb-1 text-gray-900">Deneyimli ve Tutkulu Ekip</h3>
                <p className="text-gray-700">Her detayı tutkuyla tasarlayan, alanında uzman bir ekip.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow p-6 hover:shadow-lg transition">
              <span className="text-3xl text-[#FF6B6B]">🔑</span>
              <div>
                <h3 className="font-semibold text-xl mb-1 text-gray-900">Anahtar Teslim Kolaylık</h3>
                <p className="text-gray-700">Tüm süreç boyunca yanınızdayız, size sadece yeni yaşamınıza başlamak kalıyor.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow p-6 hover:shadow-lg transition md:col-span-2">
              <span className="text-3xl text-[#FF6B6B]">💡</span>
              <div>
                <h3 className="font-semibold text-xl mb-1 text-gray-900">Yenilikçi Çözümler</h3>
                <p className="text-gray-700">Akıllı depolama, enerji verimliliği ve modern mimariyi bir araya getiriyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: "⚡",
    title: "Yüksek Performans",
    description: "Optimize edilmiş altyapımız ile yüksek performanslı API çözümleri sunuyoruz."
  },
  {
    icon: "🔒",
    title: "Güvenli",
    description: "En son güvenlik standartları ile verileriniz güvende."
  },
  {
    icon: "📈",
    title: "Ölçeklenebilir",
    description: "İhtiyaçlarınıza göre ölçeklenebilir altyapı ile her zaman hazır."
  }
]

const services = [
  {
    icon: "🚀",
    title: "REST API",
    description: "Modern ve güvenilir REST API altyapısı.",
    features: [
      "JSON Formatı",
      "Rate Limiting",
      "Caching",
      "Webhooks"
    ]
  },
  {
    icon: "🔌",
    title: "WebSocket",
    description: "Gerçek zamanlı iletişim için WebSocket desteği.",
    features: [
      "İki Yönlü İletişim",
      "Düşük Gecikme",
      "Otomatik Yeniden Bağlanma",
      "Event Sistemi"
    ]
  },
  {
    icon: "📊",
    title: "Analytics",
    description: "Detaylı analitik ve raporlama araçları.",
    features: [
      "Gerçek Zamanlı Metrikler",
      "Özel Raporlar",
      "Performans Analizi",
      "Kullanım İstatistikleri"
    ]
  },
  {
    icon: "🛠️",
    title: "Geliştirici Araçları",
    description: "Geliştiriciler için kapsamlı araçlar ve SDK'lar.",
    features: [
      "SDK Desteği",
      "API Dokümantasyonu",
      "Test Araçları",
      "Debug Modu"
    ]
  }
]

