import { ArrowLeft, GraduationCap, Mail, MapPin, Shield, FileText, Lock } from 'lucide-react';

export type LegalPage = 'kvkk' | 'privacy' | 'terms' | 'contact' | null;

export default function LegalPages({ page, onClose }: { page: LegalPage; onClose: () => void }) {
  if (!page) return null;

  const titles: Record<string, string> = {
    kvkk: 'KVKK Aydınlatma Metni',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Şartları',
    contact: 'İletişim',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 animate-fade-in">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Geri Dön
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="text-sm font-bold text-white">Pomodoro School</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          {page === 'kvkk' && <Shield size={28} className="text-orange-400" />}
          {page === 'privacy' && <Lock size={28} className="text-orange-400" />}
          {page === 'terms' && <FileText size={28} className="text-orange-400" />}
          {page === 'contact' && <Mail size={28} className="text-orange-400" />}
          <h1 className="text-2xl font-bold text-white">{titles[page]}</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          {page === 'kvkk' && <KvkkContent />}
          {page === 'privacy' && <PrivacyContent />}
          {page === 'terms' && <TermsContent />}
          {page === 'contact' && <ContactContent />}
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 text-xs text-slate-500">
          <p>Son güncelleme: 30 Eylül 2026</p>
        </div>
      </div>
    </div>
  );
}

function KvkkContent() {
  return (
    <>
      <p className="text-slate-400">Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, Pomodoro School olarak kişisel verilerinizin işlenmesine ilişkin olarak size bilgi vermek amacıyla hazırlanmıştır.</p>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">1. Veri Sorumlusu</h2>
        <p>Pomodoro School, kişisel verilerinizin işlenmesinden sorumludur. İletişim bilgilerimiz aşağıda yer almaktadır.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">2. İşlenen Kişisel Veriler</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ad-soyad (görünür ad olarak belirttiğiniz isim)</li>
          <li>E-posta adresi</li>
          <li>Google ile giriş yapmanız durumunda, Google tarafından sağlanan temel profil bilgileri (ad, e-posta, profil fotoğrafı URL'si)</li>
          <li>Kullanım verileri (tamamlanan pomodoro seansları, görevler, istatistikler)</li>
          <li>Ortak çalışma odalarında paylaştığınız mesajlar ve görünen ad</li>
          <li>Tercihler (seçtiğiniz arka planlar, süre ayarları, ses ayarları)</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">3. Kişisel Verilerin İşlenme Amaçları</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Üyelik oluşturma ve hesap yönetimi</li>
          <li>Pomodoro seans istatistiklerinin kaydedilmesi ve gösterilmesi</li>
          <li>Ortak çalışma odaları üzerinden diğer kullanıcılarla etkileşim sağlanması</li>
          <li>Kullanıcı deneyiminin kişiselleştirilmesi (arka plan, ses, süre tercihleri)</li>
          <li>Hizmetin güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">4. Verilerin Aktarılması</h2>
        <p>Kişisel verileriniz, hizmetin sağlanması için Supabase (veritabanı ve kimlik doğrulama altyapısı) ve Google OAuth servisleri aracılığıyla işlenmektedir. Verileriniz yurt dışı sunucularda saklanabilir. Verileriniz üçüncü taraflara satılmaz veya pazarlanmaz.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">5. Haklarınız</h2>
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
          <li>İşlenmesinin münhasıran otomatik sistemler üzerinden analiz edilmesine itiraz etme</li>
        </ul>
        <p className="mt-2">Bu haklarınızı kullanmak için iletişim bölümündeki bilgilerden bize ulaşabilirsiniz.</p>
      </section>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="text-slate-400">Bu Gizlilik Politikası, Pomodoro School platformunun kullanıcı verilerini nasıl topladığını, kullandığını ve koruduğunu açıklar.</p>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">1. Toplanan Bilgiler</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hesap bilgileri: E-posta adresi, görünen ad, profil fotoğrafı URL'si</li>
          <li>Kullanım verileri: Tamamlanan pomodoro seansları, görev listesi, istatistikler</li>
          <li>Ortak çalışma verileri: Oda üyeliği, mesajlar, oda ayarları</li>
          <li>Tercihler: Seçilen arka planlar, süre ayarları, ses ve efekt tercihleri</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">2. Bilgilerin Kullanımı</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hesap oluşturma ve kimlik doğrulama</li>
          <li>İstatistik hesaplama ve gösterme</li>
          <li>Ortak çalışma odalarının çalıştırılması</li>
          <li>Kullanıcı tercihlerinin kaydedilmesi ve cihazlar arası senkronizasyon</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">3. Veri Güvenliği</h2>
        <p>Verileriniz, Supabase altyapısı üzerinden şifreli bağlantılarla (SSL/TLS) iletilir ve saklanır. Veritabanı erişimi Row Level Security (RLS) politikalarıyla korunur. Her kullanıcı yalnızca kendi verilerine erişebilir.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">4. Çerezler</h2>
        <p>Platform, oturum sürekliliği için tarayıcı yerel depolaması (localStorage) ve çerezler kullanır. Bu veriler yalnızca oturum ve tercih bilgilerini saklamak için kullanılır, takip veya reklam amacı taşımaz.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">5. Üçüncü Taraf Hizmetleri</h2>
        <p>Platform şu üçüncü taraf hizmetlerini kullanır:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Supabase: Veritabanı, kimlik doğrulama ve dosya depolama</li>
          <li>Google: OAuth ile giriş (isteğe bağlı)</li>
        </ul>
        <p className="mt-2">Bu hizmetlerin kendi gizlilik politikaları geçerlidir.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">6. Hesap Silme</h2>
        <p>Hesabınızı silmek isterseniz, iletişim bölümünden bize ulaşabilirsiniz. Hesabınız silindiğinde tüm kişisel verileriniz kalıcı olarak kaldırılır.</p>
      </section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p className="text-slate-400">Bu Kullanım Şartları, Pomodoro School platformunu kullanırken uymanız gereken kuralları belirler.</p>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">1. Hizmetin Doğası</h2>
        <p>Pomodoro School, ücretsiz bir odaklanma ve zaman yönetimi platformudur. Hizmet "olduğu gibi" sunulur ve belirli bir kesintisizlik garantisi verilmez.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">2. Kullanıcı Sorumlulukları</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>18 yaşından büyük olmalısınız veya yasal temsilcinizin iznini almalısınız</li>
          <li>Doğru bilgi sağlamaktan sorumlusunuz</li>
          <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
          <li>Ortak çalışma odalarında saygılı ve uygun içerik paylaşmalısınız</li>
          <li>Diğer kullanıcıları rahatsız edici, taciz edici veya yasa dışı içerik paylaşmamalısınız</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">3. Yasaklı Davranışlar</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hizmetin kötüye kullanımı veya aşırı yük bindirme</li>
          <li>Diğer kullanıcıların verilerine yetkisiz erişim</li>
          <li>Spam veya reklam amaçlı mesaj gönderme</li>
          <li>Hesap paylaşma veya satma</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">4. Fikri Mülkiyet</h2>
        <p>Platformdaki arka plan görselleri ve ses dosyaları platforma aittir. Kullanıcılar tarafından oluşturulan görev ve mesaj içeriklerinin sahibi kullanıcıdır.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">5. Sorumluluğun Sınırlandırılması</h2>
        <p>Pomodoro School, hizmetin kullanımından doğacak dolaylı veya dolaysız zararlardan sorumlu tutulamaz. Hizmet ücretsiz olarak sunulmaktadır.</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">6. Değişiklikler</h2>
        <p>Bu şartlar zaman zaman güncellenebilir. Önemli değişiklikler kullanıcılara bildirilir. Şartların güncel sürümü her zaman bu sayfada bulunur.</p>
      </section>
    </>
  );
}

function ContactContent() {
  return (
    <>
      <p className="text-slate-400">Sorularınız, geri bildirimleriniz veya KVKK kapsamındaki talepleriniz için bize aşağıdaki kanallardan ulaşabilirsiniz.</p>
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Mail size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">E-posta</h3>
              <p className="text-sm text-slate-400">destek@pomodoroschool.app</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">En hızlı yanıt süresi: 48 saat içinde.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <MapPin size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Adres</h3>
              <p className="text-sm text-slate-400">İstanbul, Türkiye</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Pomodoro School dijital bir platformdur, fiziksel ofis bulunmamaktadır.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-3 font-semibold text-white">KVKK Başvurusu</h3>
          <p className="text-sm text-slate-400">KVKK kapsamında haklarınızı kullanmak için yukarıdaki e-posta adresine kimliğinizi doğrulayıcı belgelerle başvurabilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanacaktır.</p>
        </div>
      </div>
    </>
  );
}
