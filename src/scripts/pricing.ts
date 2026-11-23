import { SITE, buildRegisterUrl, type BillingCycle } from '../config/site';
import {
  FALLBACK_PLANS_DATA,
  formatLimitLabel,
  getPlanDisplayMetrics,
  type PublicPlan,
  type PublicPlansApiResponse,
  type PublicPlansPayload,
} from '../config/pricing';

function isValidPlan(candidate: unknown): candidate is PublicPlan {
  if (!candidate || typeof candidate !== 'object') return false;
  const p = candidate as Record<string, unknown>;
  return (
    typeof p.code === 'string' &&
    p.code.trim().length > 0 &&
    typeof p.name === 'string' &&
    typeof p.monthlyPriceKurus === 'number' &&
    Number.isFinite(p.monthlyPriceKurus)
  );
}

function normalizePlan(raw: PublicPlan): PublicPlan {
  return {
    code: raw.code,
    name: raw.name,
    tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
    maxBuildings: typeof raw.maxBuildings === 'number' ? raw.maxBuildings : null,
    maxUnits: typeof raw.maxUnits === 'number' ? raw.maxUnits : null,
    monthlyPriceKurus: raw.monthlyPriceKurus,
    yearlyPriceKurus:
      typeof raw.yearlyPriceKurus === 'number' && Number.isFinite(raw.yearlyPriceKurus) && raw.yearlyPriceKurus > 0
        ? raw.yearlyPriceKurus
        : raw.monthlyPriceKurus * 10,
    currency: typeof raw.currency === 'string' && raw.currency ? raw.currency : 'TRY',
    isRecommended: Boolean(raw.isRecommended),
    features: Array.isArray(raw.features)
      ? raw.features.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
  };
}

function createCheckIcon(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'h-4 w-4 shrink-0 text-emerald-400 mt-0.5');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute(
    'd',
    'M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z',
  );
  path.setAttribute('clip-rule', 'evenodd');
  svg.appendChild(path);
  return svg;
}

function buildPlanCard(plan: PublicPlan, cycle: BillingCycle, trialDays: number): HTMLElement {
  const metrics = getPlanDisplayMetrics(plan, cycle);
  const isRecommended = plan.isRecommended;

  const card = document.createElement('article');
  card.setAttribute('data-plan-code', plan.code);
  card.className = isRecommended
    ? 'relative flex flex-col rounded-2xl border border-emerald-400/50 bg-gradient-to-b from-[#10241b] to-[#0b1410] p-6 sm:p-7 shadow-2xl shadow-emerald-950/70 ring-1 ring-emerald-400/20'
    : 'relative flex flex-col rounded-2xl surface-card surface-card-hover p-6 sm:p-7';

  if (isRecommended) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'absolute -top-3.5 left-1/2 -translate-x-1/2';
    const badge = document.createElement('span');
    badge.className =
      'inline-flex items-center rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-bold tracking-wide text-[#04110b] shadow-lg shadow-emerald-500/30';
    badge.textContent = 'Önerilen';
    badgeWrap.appendChild(badge);
    card.appendChild(badgeWrap);
  }

  // Header
  const header = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'text-lg font-bold text-white';
  title.textContent = plan.name;
  header.appendChild(title);

  const tagline = document.createElement('p');
  tagline.className = 'mt-1.5 text-xs leading-relaxed text-slate-400 min-h-[2.25rem]';
  tagline.textContent = plan.tagline;
  header.appendChild(tagline);

  const limits = document.createElement('div');
  limits.className =
    'mt-4 inline-flex items-center rounded-lg border border-emerald-500/20 bg-[#07100c] px-2.5 py-1 text-xs font-medium text-emerald-300';
  limits.textContent = formatLimitLabel(plan.maxBuildings, plan.maxUnits);
  header.appendChild(limits);
  card.appendChild(header);

  // Price Block
  const priceWrap = document.createElement('div');
  priceWrap.className = 'mt-6 pb-6 border-b border-emerald-500/12';

  const priceRow = document.createElement('div');
  priceRow.className = 'flex items-baseline gap-1.5 flex-wrap';

  const currencySpan = document.createElement('span');
  currencySpan.className = 'text-xl font-bold text-emerald-400';
  currencySpan.textContent = metrics.symbol;
  priceRow.appendChild(currencySpan);

  const amountSpan = document.createElement('span');
  amountSpan.className = 'font-display text-4xl font-extrabold tracking-tight text-white tabular-nums';
  amountSpan.textContent = metrics.primaryAmount;
  priceRow.appendChild(amountSpan);

  const suffixSpan = document.createElement('span');
  suffixSpan.className = 'text-sm font-medium text-slate-400';
  suffixSpan.textContent = metrics.periodSuffix;
  priceRow.appendChild(suffixSpan);

  if (metrics.strikethroughAmount) {
    const strike = document.createElement('span');
    strike.className = 'ml-1 text-sm text-slate-500 line-through tabular-nums';
    strike.textContent = metrics.strikethroughAmount;
    priceRow.appendChild(strike);
  }
  priceWrap.appendChild(priceRow);

  const subRow = document.createElement('div');
  subRow.className = 'mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400';

  const subText = document.createElement('span');
  subText.textContent = metrics.billingSubtext;
  subRow.appendChild(subText);

  if (metrics.savingsBadge) {
    const savePill = document.createElement('span');
    savePill.className =
      'inline-flex rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300 tabular-nums';
    savePill.textContent = metrics.savingsBadge;
    subRow.appendChild(savePill);
  }
  priceWrap.appendChild(subRow);
  card.appendChild(priceWrap);

  // Features List
  const featureList = document.createElement('ul');
  featureList.className = 'mt-6 space-y-3 flex-1';

  for (const feature of plan.features) {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2.5 text-sm text-slate-300';
    li.appendChild(createCheckIcon());
    const text = document.createElement('span');
    text.textContent = feature;
    li.appendChild(text);
    featureList.appendChild(li);
  }
  card.appendChild(featureList);

  // CTA Button
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'mt-8';

  const cta = document.createElement('a');
  cta.href = buildRegisterUrl(plan.code, cycle);
  cta.className = isRecommended
    ? 'inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#04110b] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors'
    : 'inline-flex w-full items-center justify-center rounded-xl border border-emerald-500/25 bg-[#07100c] px-4 py-3 text-sm font-semibold text-white hover:border-emerald-400/55 hover:bg-emerald-500/10 transition-colors';
  cta.textContent = `${trialDays} Gün Ücretsiz Başla`;
  ctaWrap.appendChild(cta);
  card.appendChild(ctaWrap);

  return card;
}

export function initPricingSection(): void {
  const mobileDetails = document.getElementById('mobile-nav-details');
  if (mobileDetails instanceof HTMLDetailsElement) {
    mobileDetails.querySelectorAll('[data-mobile-link]').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDetails.open = false;
      });
    });
  }

  const grid = document.getElementById('pricing-grid');
  if (!grid) return;
  const gridEl: HTMLElement = grid;

  const monthlyBtn = document.querySelector<HTMLButtonElement>('[data-cycle-btn="MONTHLY"]');
  const yearlyBtn = document.querySelector<HTMLButtonElement>('[data-cycle-btn="YEARLY"]');
  const trialDaySpans = document.querySelectorAll<HTMLElement>('[data-trial-days]');

  let activeCycle: BillingCycle = 'MONTHLY';
  let currentData: PublicPlansPayload = FALLBACK_PLANS_DATA;

  function updateToggleUI(): void {
    const activeClasses = ['bg-emerald-500', 'text-[#04110b]', 'font-semibold', 'shadow-sm'];
    const inactiveClasses = ['text-slate-300', 'hover:text-white', 'font-medium'];

    if (monthlyBtn && yearlyBtn) {
      const isMonthly = activeCycle === 'MONTHLY';
      monthlyBtn.setAttribute('aria-pressed', String(isMonthly));
      yearlyBtn.setAttribute('aria-pressed', String(!isMonthly));

      for (const cls of activeClasses) {
        monthlyBtn.classList.toggle(cls, isMonthly);
        yearlyBtn.classList.toggle(cls, !isMonthly);
      }
      for (const cls of inactiveClasses) {
        monthlyBtn.classList.toggle(cls, !isMonthly);
        yearlyBtn.classList.toggle(cls, isMonthly);
      }
    }
  }

  function render(): void {
    const fragment = document.createDocumentFragment();
    for (const plan of currentData.plans) {
      fragment.appendChild(buildPlanCard(plan, activeCycle, currentData.trialDays));
    }
    gridEl.replaceChildren(fragment);

    trialDaySpans.forEach((el) => {
      el.textContent = String(currentData.trialDays);
    });
  }

  monthlyBtn?.addEventListener('click', () => {
    if (activeCycle === 'MONTHLY') return;
    activeCycle = 'MONTHLY';
    updateToggleUI();
    render();
  });

  yearlyBtn?.addEventListener('click', () => {
    if (activeCycle === 'YEARLY') return;
    activeCycle = 'YEARLY';
    updateToggleUI();
    render();
  });

  // Canlı fiyatları tek doğru kaynaktan çek; ağ/CORS hatasında fallback ile sessizce devam et
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 6000);

  fetch(SITE.publicPlansEndpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json() as Promise<PublicPlansApiResponse>;
    })
    .then((payload) => {
      if (
        !payload ||
        payload.success !== true ||
        !payload.data ||
        !Array.isArray(payload.data.plans) ||
        payload.data.plans.length === 0
      ) {
        return;
      }

      const validPlans = payload.data.plans.filter(isValidPlan).map(normalizePlan);
      if (validPlans.length === 0) return;

      const trialDays =
        typeof payload.data.trialDays === 'number' && payload.data.trialDays > 0
          ? payload.data.trialDays
          : FALLBACK_PLANS_DATA.trialDays;

      currentData = {
        trialDays,
        currency:
          typeof payload.data.currency === 'string' && payload.data.currency
            ? payload.data.currency
            : 'TRY',
        plans: validPlans,
      };
      render();
    })
    .catch(() => {
      // Ağ / CORS / zaman aşımı durumunda statik fallback fiyatlarıyla sorunsuz devam edilir.
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
    });
}
