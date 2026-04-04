import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Moon, Utensils, Brain, Check, Sparkles, ArrowRight } from 'lucide-react';

// ─── Feature image with fallback placeholder ────────────────────────────────

function FeatureImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center border border-indigo-100">
        <span className="text-xs text-indigo-300 font-mono">{src}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full rounded-2xl shadow-md object-cover"
    />
  );
}

// ─── Feature card ────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description, imageSrc, imageAlt, reverse }) {
  return (
    <div className={`flex flex-col gap-8 md:gap-12 md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center`}>
      <div className="flex-1 min-w-0">
        <FeatureImage src={imageSrc} alt={imageAlt} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 mb-4">
          <Icon className="w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-3">{title}</h3>
        <p className="text-zinc-500 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Pricing card ────────────────────────────────────────────────────────────

function PricingCard({ name, description, price, yearlyMonthly, yearlyTotal, features, cta, isHighlighted, isYearly }) {
  const navigate = useNavigate();

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isHighlighted
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
          : 'bg-white border border-zinc-100 shadow-sm'
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isHighlighted ? 'text-indigo-200' : 'text-indigo-500'}`}>
          {name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">
            {price === 0 ? 'Free' : `$${isYearly ? yearlyMonthly : price}`}
          </span>
          {price !== 0 && (
            <span className={`text-sm ${isHighlighted ? 'text-indigo-200' : 'text-zinc-400'}`}>
              /mo
            </span>
          )}
        </div>
        {isYearly && price !== 0 && (
          <p className={`text-xs mt-1 ${isHighlighted ? 'text-indigo-200' : 'text-zinc-400'}`}>
            Billed ${yearlyTotal}/year
          </p>
        )}
        <p className={`mt-3 text-sm leading-relaxed ${isHighlighted ? 'text-indigo-100' : 'text-zinc-500'}`}>
          {description}
        </p>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlighted ? 'text-indigo-200' : 'text-indigo-500'}`} />
            <span className={isHighlighted ? 'text-indigo-50' : 'text-zinc-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate('/register')}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
          isHighlighted
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

// ─── Main landing page ───────────────────────────────────────────────────────

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const featureItems = [
    {
      icon: Moon,
      title: t('landing.features.logging.title'),
      description: t('landing.features.logging.description'),
      imageSrc: '/dashboard/logging.png',
      imageAlt: t('landing.features.logging.title'),
      reverse: false,
    },
    {
      icon: Sparkles,
      title: t('landing.features.predictions.title'),
      description: t('landing.features.predictions.description'),
      imageSrc: '/dashboard/predictions.png',
      imageAlt: t('landing.features.predictions.title'),
      reverse: true,
    },
    {
      icon: Brain,
      title: t('landing.features.insights.title'),
      description: t('landing.features.insights.description'),
      imageSrc: '/dashboard/insights.png',
      imageAlt: t('landing.features.insights.title'),
      reverse: false,
    },
  ];

  const tiers = [
    {
      name: t('landing.pricing.basic.name'),
      description: t('landing.pricing.basic.description'),
      price: 0,
      yearlyMonthly: 0,
      yearlyTotal: 0,
      cta: t('landing.pricing.basic.cta'),
      isHighlighted: false,
      features: [
        t('landing.pricing.basic.feature1'),
        t('landing.pricing.basic.feature2'),
        t('landing.pricing.basic.feature3'),
        t('landing.pricing.basic.feature4'),
      ],
    },
    {
      name: t('landing.pricing.smart.name'),
      description: t('landing.pricing.smart.description'),
      price: 8,
      yearlyMonthly: 6,
      yearlyTotal: 72,
      cta: t('landing.pricing.smart.cta'),
      isHighlighted: true,
      features: [
        t('landing.pricing.smart.feature1'),
        t('landing.pricing.smart.feature2'),
        t('landing.pricing.smart.feature3'),
        t('landing.pricing.smart.feature4'),
        t('landing.pricing.smart.feature5'),
      ],
    },
    {
      name: t('landing.pricing.agent.name'),
      description: t('landing.pricing.agent.description'),
      price: 19,
      yearlyMonthly: 15,
      yearlyTotal: 180,
      cta: t('landing.pricing.agent.cta'),
      isHighlighted: false,
      features: [
        t('landing.pricing.agent.feature1'),
        t('landing.pricing.agent.feature2'),
        t('landing.pricing.agent.feature3'),
        t('landing.pricing.agent.feature4'),
        t('landing.pricing.agent.feature5'),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Moon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-lg">BabyCoach</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              {t('auth.title')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              {t('landing.hero.cta')}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 to-white pt-20 pb-24 px-4 sm:px-6 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />

        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.hero.badge')}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 leading-tight tracking-tight mb-6">
            {t('landing.hero.headline')}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.hero.subheadline')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-colors text-base shadow-lg shadow-indigo-200 cursor-pointer"
            >
              {t('landing.hero.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              {t('landing.hero.ctaSecondary')}
            </button>
          </div>
        </div>

        {/* Soft decorative blobs */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-20 sm:gap-24">
            {featureItems.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-zinc-500 text-lg mb-8">
              {t('landing.pricing.subtitle')}
            </p>

            {/* Monthly / Yearly toggle */}
            <div className="inline-flex items-center gap-1 bg-zinc-100 rounded-2xl p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  !isYearly ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {t('landing.pricing.monthly')}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isYearly ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {t('landing.pricing.yearly')}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {t('landing.pricing.yearlyBadge')}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start md:items-stretch mt-8">
            {tiers.map((tier, i) => (
              <PricingCard key={i} {...tier} isYearly={isYearly} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 text-center bg-indigo-600">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('landing.footer.headline')}
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            {t('landing.footer.subheadline')}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors text-base cursor-pointer"
          >
            {t('landing.hero.cta')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 sm:px-6 bg-zinc-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Moon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">BabyCoach</span>
        </div>
        <p className="text-zinc-500 text-xs">
          {t('landing.footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
