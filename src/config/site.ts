export type BillingCycle = 'MONTHLY' | 'YEARLY';

/**
 * AgyProp tanıtım sitesi ve yasal sayfalar için tek doğru kaynak.
 *
 * TODO (PayTR / iyzico başvurusu öncesi):
 * Aşağıdaki `company` nesnesindeki köşeli parantezli alanları
 * resmi şirket/şahıs işletmesi bilgilerinizle doldurun.
 */
export const SITE = {
  brandName: 'AgyProp',
  productTagline: 'Modern Apartman & Site Yönetim Yazılımı',
  siteUrl: 'https://melihcanaz.tr',
  appUrl: 'https://yonetim.melihcanaz.tr',
  loginUrl: 'https://yonetim.melihcanaz.tr/login',
  registerUrl: 'https://yonetim.melihcanaz.tr/register',
  apiBaseUrl: 'https://apartman.melihcanaz.tr',
  publicPlansEndpoint: 'https://apartman.melihcanaz.tr/api/v1/billing/public-plans',
  defaultTrialDays: 14,
  locale: 'tr_TR',
  lang: 'tr',

  seo: {
    defaultTitle: 'AgyProp — Apartman ve Site Yönetim Yazılımı',
    defaultDescription:
      'Apartman ve site yöneticileri için otomatik FIFO aidat takibi, tek tıkla A5 PDF makbuz, KVKK maskeli pano icmali, sakin dekont onayı ve R2 belge arşivi. 14 gün ücretsiz deneyin.',
    ogImage: '/og-image.png',
    ogImageAlt: 'AgyProp — Apartman ve Site Yönetim Yazılımı',
  },

  /**
   * TODO: PayTR / iyzico ve yasal uyum için firma bilgilerinizi buradan güncelleyin.
   * Tüm yasal sayfalar (/kvkk, /gizlilik-politikasi, /mesafeli-satis-sozlesmesi, /iptal-ve-iade)
   * ve footer bu nesneyi otomatik olarak kullanır.
   */
  company: {
    legalName: 'AgyProp Yazılım (Melih Canaz)',
    tradeName: 'AgyProp',
    taxOffice: 'Kuruluş aşamasındadır',
    taxNumber: 'Kuruluş aşamasındadır',
    mersisNumber: 'Bulunmamaktadır',
    address: 'Atakum / Samsun, Türkiye',
    phone: 'E-posta üzerinden destek verilmektedir',
    email: 'iletisim@melihcanaz.tr',
    supportEmail: 'iletisim@melihcanaz.tr',
    kvkkEmail: 'iletisim@melihcanaz.tr',
    legalLastUpdated: '23 Kasım 2026',
  },

  navigation: [
    { label: 'Özellikler', href: '/#ozellikler' },
    { label: 'Nasıl Çalışır?', href: '/#nasil-calisir' },
    { label: 'Fiyatlandırma', href: '/#fiyatlandirma' },
    { label: 'SSS', href: '/#sss' },
  ],

  legalLinks: [
    { label: 'KVKK Aydınlatma Metni', href: '/kvkk' },
    { label: 'Gizlilik ve Çerez Politikası', href: '/gizlilik-politikasi' },
    { label: 'Mesafeli Satış Sözleşmesi', href: '/mesafeli-satis-sozlesmesi' },
    { label: 'İptal, İade ve Cayma Koşulları', href: '/iptal-ve-iade' },
  ],
} as const;

export function buildRegisterUrl(planCode?: string, cycle: BillingCycle = 'MONTHLY'): string {
  if (!planCode) {
    return SITE.registerUrl;
  }
  const params = new URLSearchParams({
    plan: planCode,
    cycle,
  });
  return `${SITE.registerUrl}?${params.toString()}`;
}
