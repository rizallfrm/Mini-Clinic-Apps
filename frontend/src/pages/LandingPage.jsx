import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Users, 
  ChevronRight,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';

const LandingPage = () => {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const services = [
    { icon: Stethoscope, title: 'Poli Umum', desc: 'Layanan pemeriksaan kesehatan umum dan konsultasi dengan dokter profesional.' },
    { icon: Activity, title: 'Poli Gigi', desc: 'Perawatan kesehatan gigi dan mulut yang komprehensif.' },
    { icon: HeartPulse, title: 'Poli Kandungan', desc: 'Layanan kehamilan dan kesehatan reproduksi wanita.' },
    { icon: Users, title: 'Poli Anak', desc: 'Pemeriksaan tumbuh kembang dan kesehatan anak yang ramah.' },
  ];

  const features = [
    { icon: ShieldCheck, title: 'Tenaga Medis Berlisensi', desc: 'Dokter dan perawat kami telah tersertifikasi dan sangat berpengalaman.' },
    { icon: Clock, title: 'Antrean Real-time', desc: 'Sistem antrean cerdas untuk mengurangi waktu tunggu Anda di klinik.' },
    { icon: HeartPulse, title: 'Fasilitas Modern', desc: 'Dilengkapi dengan peralatan medis terbaru untuk diagnosis akurat.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-teal-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-cyan-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 tracking-tight">
              Klinik Sehat
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-emerald-600 transition-colors">Beranda</a>
            <a href="#layanan" className="hover:text-emerald-600 transition-colors">Layanan</a>
            <a href="#keunggulan" className="hover:text-emerald-600 transition-colors">Keunggulan</a>
            <a href="#kontak" className="hover:text-emerald-600 transition-colors">Kontak</a>
          </div>

          <div>
            <Link to="/login" className="btn btn-primary shadow-lg shadow-emerald-500/20 px-6 rounded-full font-bold">
              Masuk / Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        
        {/* Hero Section */}
        <section id="beranda" className="min-h-[calc(100vh-5rem)] flex items-center py-20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-sm font-bold mb-6 border border-emerald-200 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                Sistem Antrean Real-time
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                Pelayanan Kesehatan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Terbaik & Modern</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Kami hadir dengan fasilitas kesehatan modern dan sistem antrean cerdas untuk memastikan Anda dan keluarga mendapatkan perawatan optimal tanpa membuang waktu.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login" className="btn btn-primary px-8 py-4 rounded-full text-base shadow-xl shadow-emerald-500/25">
                  Daftar Antrean Sekarang
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
                <a href="#layanan" className="btn btn-secondary px-8 py-4 rounded-full text-base bg-white/50 backdrop-blur-sm border-slate-200">
                  Lihat Layanan
                </a>
              </div>
            </div>
            
            <div className="relative scroll-animate lg:ml-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=800" 
                alt="Dokter Profesional" 
                className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">10k+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pasien Puas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="layanan" className="py-24 bg-white/40 backdrop-blur-lg border-y border-white/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 scroll-animate">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Layanan Poliklinik Kami</h2>
              <p className="text-slate-600 text-lg">Pilih layanan kesehatan yang sesuai dengan kebutuhan Anda dan keluarga.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((srv, idx) => (
                <div key={idx} className="glass-card p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 group scroll-animate" style={{ transitionDelay: `${idx * 50}ms` }}>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <srv.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{srv.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="keunggulan" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative scroll-animate">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" 
                  alt="Fasilitas Klinik" 
                  className="rounded-3xl shadow-2xl relative z-10 w-full h-[500px] object-cover"
                />
                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl -z-10"></div>
              </div>
              
              <div className="scroll-animate">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Kenapa Memilih Klinik Sehat?</h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  Kami memadukan keahlian medis dengan teknologi modern untuk memberikan pengalaman berobat yang aman, nyaman, dan transparan.
                </p>
                
                <div className="space-y-8">
                  {features.map((ft, idx) => (
                    <div key={idx} className="flex gap-5">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                        <ft.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{ft.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{ft.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 max-w-5xl mx-auto px-6 scroll-animate">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-12 md:p-16 text-center text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">Siap untuk Konsultasi?</h2>
            <p className="text-emerald-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Tidak perlu mengantre lama di klinik. Daftar dari rumah dan pantau antrean Anda secara real-time.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-full font-extrabold text-lg hover:bg-emerald-50 transition-colors shadow-xl">
              Buat Janji Temu Sekarang
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-900 pt-20 pb-10 text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Klinik Sehat</span>
            </div>
            <p className="leading-relaxed text-sm max-w-sm">
              Sistem Informasi Klinik modern dengan integrasi rekam medis dan pemantauan antrean real-time.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Jl. Kesehatan No. 123, Jakarta Selatan, 12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>(021) 555-0123</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>halo@kliniksehat.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Jam Operasional</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Senin - Jumat</span>
                <span className="text-white font-medium">08:00 - 20:00</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Sabtu</span>
                <span className="text-white font-medium">08:00 - 15:00</span>
              </div>
              <div className="flex justify-between">
                <span>Minggu & Libur Nasional</span>
                <span className="text-rose-400 font-medium">Tutup</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; 2026 Klinik Sehat. Hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
