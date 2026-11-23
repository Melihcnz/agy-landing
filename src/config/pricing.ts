import type { BillingCycle } from './site';

export type PlanCode = 'SINGLE_BUILDING' | 'STARTER' | 'PRO' | 'ENTERPRISE' | (string & {});

export interface PublicPlan {
  code: PlanCode;
  name: string;
  tagline: string;
  maxBuildings: number | null;
  maxUnits: number | null;
  monthlyPriceKurus: number;
  yearlyPriceKurus: number;
  currency: string;
  isRecommended: boolean;
  features: string[];
}

export interface PublicPlansPayload {
  trialDays: number;
  currency: string;
  plans: PublicPlan[];
}

export interface PublicPlansApiResponse {
  success: boolean;
  data: PublicPlansPayload | null;
  error: unknown;
}

/**
 * Canlı GET /api/v1/billing/public-plans yanıtıyla birebir uyumlu fallback paket verileri.
 * Fiyatlar kuruş cinsindendir (1 TL = 100 kuruş). Yıllık ücret = 10 aylık ücret (2 ay ücretsiz).
 */
export const FALLBACK_PLANS_DATA: PublicPlansPayload = {
  trialDays: 14,
  currency: 'TRY',
  plans: [
    {
      code: 'SINGLE_BUILDING',
      name: 'Başlangıç (Tek Bina)',
      tagline: 'Bireysel apartman ve küçük site yöneticileri için',
      maxBuildings: 1,
      maxUnits: 50,
      monthlyPriceKurus: 49900,
      yearlyPriceKurus: 499000,
      currency: 'TRY',
      isRecommended: false,
      features: [
        'Otomatik aidat tahakkuku & FIFO mahsup',
        'Tek tıkla A5 PDF tahsilat makbuzu',
        'KVKK maskeli bina pano icmali',
        'Sakin dekont yükleme & e-posta bildirimi',
        'Cloudflare R2 belge & fatura arşivi',
      ],
    },
    {
      code: 'STARTER',
      name: 'Standart',
      tagline: 'Birden fazla apartman yöneten ofisler için',
      maxBuildings: 5,
      maxUnits: 250,
      monthlyPriceKurus: 149000,
      yearlyPriceKurus: 1490000,
      currency: 'TRY',
      isRecommended: false,
      features: [
        'Tek Bina paketindeki tüm özellikler',
        'Tek panelden çoklu bina geçişi',
        'Arıza, bakım ve periyodik iş takibi',
        'Dönemsel gelir-gider ve kasa raporları',
        'Detaylı işlem ve denetim kayıtları',
      ],
    },
    {
      code: 'PRO',
      name: 'Profesyonel',
      tagline: 'Büyüyen profesyonel site yönetim şirketleri için',
      maxBuildings: 25,
      maxUnits: 1500,
      monthlyPriceKurus: 349000,
      yearlyPriceKurus: 3490000,
      currency: 'TRY',
      isRecommended: true,
      features: [
        'Standart paketindeki tüm özellikler',
        'Çoklu ekip üyesi & rol bazlı yetkilendirme',
        'Toplu aidat & gecikme bildirimi otomasyonu',
        'Gelişmiş denetim kayıtları & dışa aktarım',
        'Öncelikli kurulum ve e-posta desteği',
      ],
    },
    {
      code: 'ENTERPRISE',
      name: 'Kurumsal',
      tagline: 'Büyük ölçekli tesis ve yönetim grupları için',
      maxBuildings: 200,
      maxUnits: 15000,
      monthlyPriceKurus: 799000,
      yearlyPriceKurus: 7990000,
      currency: 'TRY',
      isRecommended: false,
      features: [
        'Profesyonel paketindeki tüm özellikler',
        'Yüksek hacimli bina ve bağımsız bölüm kapasitesi',
        'Özel veri aktarımı ve devreye alma desteği',
        'Kurumsal belge arşivi ve saklama politikaları',
        'Özel hesap yöneticisi ve SLA desteği',
      ],
    },
  ],
};

const tryNumberFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const tryIntegerFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatKurusToAmount(kurus: number): string {
  const lira = kurus / 100;
  return Number.isInteger(lira)
    ? tryIntegerFormatter.format(lira)
    : tryNumberFormatter.format(lira);
}

export function formatCurrencySymbol(currency = 'TRY'): string {
  return currency.toUpperCase() === 'TRY' ? '₺' : currency;
}

export function formatLimitLabel(
  maxBuildings: number | null | undefined,
  maxUnits: number | null | undefined,
): string {
  const buildingText =
    maxBuildings === null || maxBuildings === undefined || maxBuildings <= 0 || maxBuildings >= 99999
      ? 'Sınırsız Bina'
      : `${tryIntegerFormatter.format(maxBuildings)} Bina`;

  const unitText =
    maxUnits === null || maxUnits === undefined || maxUnits <= 0 || maxUnits >= 999999
      ? 'Sınırsız Daire'
      : `${tryIntegerFormatter.format(maxUnits)} Daire`;

  return `${buildingText} · ${unitText}`;
}

export function getPlanDisplayMetrics(plan: PublicPlan, cycle: BillingCycle) {
  const symbol = formatCurrencySymbol(plan.currency);
  const monthlyKurus = Math.max(0, plan.monthlyPriceKurus);
  const yearlyKurus =
    plan.yearlyPriceKurus > 0 ? plan.yearlyPriceKurus : monthlyKurus * 10;

  if (cycle === 'YEARLY') {
    const monthlyEquivalentLira = Math.round(yearlyKurus / 12 / 100);
    const annualSavingsKurus = Math.max(0, monthlyKurus * 12 - yearlyKurus);

    return {
      symbol,
      primaryAmount: tryIntegerFormatter.format(monthlyEquivalentLira),
      periodSuffix: '/ay',
      strikethroughAmount: `${symbol}${formatKurusToAmount(monthlyKurus)}`,
      billingSubtext: `Yıllık toplam ${symbol}${formatKurusToAmount(yearlyKurus)} faturalandırılır`,
      savingsBadge:
        annualSavingsKurus > 0
          ? `${symbol}${formatKurusToAmount(annualSavingsKurus)} tasarruf`
          : '2 ay ücretsiz',
    };
  }

  return {
    symbol,
    primaryAmount: formatKurusToAmount(monthlyKurus),
    periodSuffix: '/ay',
    strikethroughAmount: null as string | null,
    billingSubtext: 'Aylık faturalandırılır · Taahhütsüz',
    savingsBadge: null as string | null,
  };
}
