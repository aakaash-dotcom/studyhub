import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function PlansPage() {
  const plans = [
    {
      name: 'FREE',
      price: '₹0',
      period: 'forever',
      description: 'Past question papers',
      features: [
        'TN State Board PYQs (2022-2025)',
        'Download after login',
        'All subjects',
        'Basic preview'
      ],
      cta: 'Current Plan',
      ctaLink: '/class/10',
      highlighted: false
    },
    {
      name: 'PRO',
      price: '₹499',
      period: '/ exam year',
      description: 'All Ravi PDFs + updates + weekly test',
      features: [
        'Everything in FREE',
        'Important Questions (ImpQ)',
        'Model Question Papers',
        'Topper Materials',
        'Weekly practice tests',
        'Exam updates & alerts',
        'Full year access'
      ],
      cta: 'Pay ₹499',
      ctaLink: '/pay/pro',
      highlighted: true
    },
    {
      name: 'CENTUM',
      price: 'Opening soon',
      period: '',
      description: 'Recordings + WhatsApp group + weekly live',
      features: [
        'Everything in PRO',
        'Video recordings',
        'WhatsApp study group',
        'Weekly live sessions',
        'Direct teacher support'
      ],
      cta: 'WhatsApp 8610653352',
      ctaLink: 'https://wa.me/918610653352',
      highlighted: false,
      isWhatsApp: true
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Choose Your Plan
          </h1>
          <p className="text-lg" style={{ color: '#595959' }}>
            Get access to premium study materials and ace your exams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-2xl border-2 p-6 flex flex-col"
              style={{
                borderColor: plan.highlighted ? '#D4AF37' : '#C0C8D9',
                boxShadow: plan.highlighted ? '0 8px 24px rgba(212, 175, 55, 0.2)' : 'none'
              }}
            >
              {plan.highlighted && (
                <div
                  className="text-xs font-bold text-white text-center py-1 rounded-full mb-4"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold" style={{ color: plan.highlighted ? '#D4AF37' : '#17528C' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: '#595959' }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: '#595959' }}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#15803D' }} />
                    <span className="text-sm" style={{ color: '#1A1A1A' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.isWhatsApp ? (
                <a
                  href={plan.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: '#25D366',
                    color: 'white'
                  }}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  to={plan.ctaLink}
                  className="block w-full text-center py-3 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: plan.highlighted ? '#D4AF37' : '#17528C',
                    color: 'white'
                  }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: '#595959' }}>
            All plans include access to TN State Board study materials.
            <br />
            Questions? <a href="tel:8610653352" className="font-medium" style={{ color: '#17528C' }}>Call 86106 53352</a>
          </p>
        </div>
      </div>
    </div>
  )
}
