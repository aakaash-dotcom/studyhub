import { useLocation, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const legalContent: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: `
Last Updated: January 2026

Ravi's Tuition ("we", "our", "us") is committed to protecting your privacy in compliance with India's Digital Personal Data Protection Act (DPDP Act) 2023.

**Information We Collect**
- Phone number (for OTP-based authentication)
- Name, class, school, medium, district (progressive profiling, optional)
- Usage data (page views, downloads, search queries)

**How We Use Your Data**
- To provide access to study materials
- To personalize your experience
- To send exam updates (with consent)
- To improve our services

**Data Sharing**
We do not sell or share your personal data with third parties. We only share data when required by law.

**Your Rights (DPDP Act 2023)**
- Right to access your data
- Right to correct your data
- Right to delete your data
- Right to grievance redressal

**Data Retention**
We retain your data only as long as necessary for the purposes stated above. You can request deletion at any time via your profile.

**Contact**
For privacy concerns: privacy@ravistuition.in
Phone: 86106 53352
Address: Ravi's Tuition, Madurai, Tamil Nadu
    `
  },
  terms: {
    title: 'Terms of Service',
    content: `
Last Updated: January 2026

By accessing Ravi's Tuition study materials, you agree to these terms.

**Use of Materials**
- All study materials are for personal educational use only
- You may not redistribute, resell, or share materials
- Materials are watermarked and copyrighted by Ravi's Tuition

**User Accounts**
- You must provide accurate information during registration
- You are responsible for maintaining account security
- One account per student

**Content**
- All content is created by Ravi's Tuition, Madurai
- Content is based on TN State Board Samacheer Kalvi syllabus
- We do not claim ownership of third-party content

**Disclaimer**
- Materials are provided "as is" without warranty
- We strive for accuracy but do not guarantee error-free content
- Use materials as supplementary resources

**Termination**
We reserve the right to terminate accounts for misuse or violation of these terms.

**Contact**
For questions: support@ravistuition.in
Phone: 86106 53352
    `
  },
  refund: {
    title: 'Refund Policy',
    content: `
Last Updated: January 2026

**Free Materials**
All current study materials on Ravi's Tuition are provided free of charge. No refunds apply.

**Future Paid Content**
When we introduce paid content:
- 7-day money-back guarantee
- Refunds processed within 5-7 business days
- Contact support@ravistuition.in for refund requests

**Eligibility**
- Technical issues preventing access
- Duplicate charges
- Content significantly different from description

**Non-Refundable**
- Materials already downloaded and used
- Requests after 7 days (for paid content)
- Change of mind after access

**Contact**
For refund requests: support@ravistuition.in
Phone: 86106 53352
    `
  },
  'content-policy': {
    title: 'Content Policy',
    content: `
Last Updated: January 2026

**Our Content**
All study materials on Ravi's Tuition are:
- Created in-house by our team in Madurai
- Based on TN State Board Samacheer Kalvi syllabus
- Typeset, branded, and watermarked by us
- For Classes 8-12

**Prohibited Content**
We do not host:
- Third-party publisher content
- Pirated or unauthorized materials
- Content from other state boards or CBSE/ICSE
- Offensive or inappropriate material

**Copyright**
- All content is © Ravi's Tuition, Madurai
- Unauthorized reproduction is prohibited
- Materials are watermarked with our brand

**Reporting Violations**
If you find content that violates this policy:
- Email: content@ravistuition.in
- Include URL and description
- We will review within 48 hours

**Contact**
For content inquiries: content@ravistuition.in
Phone: 86106 53352
    `
  }
}

export default function LegalPage() {
  const location = useLocation()
  const page = location.pathname.replace('/', '')
  const content = legalContent[page || '']

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Page not found</h1>
        <Link to="/" className="text-sm flex items-center justify-center gap-1" style={{ color: '#17528C' }}>
          <ChevronLeft className="w-4 h-4" /> Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link to="/" className="flex items-center gap-1 text-sm mb-6" style={{ color: '#17528C' }}>
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>

      <article className="bg-white rounded-2xl border p-6 sm:p-8" style={{ borderColor: '#C0C8D9' }}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>{content.title}</h1>
        <div className="prose prose-sm max-w-none" style={{ color: '#1A1A1A' }}>
          {content.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <h2 key={i} className="text-lg font-bold mt-6 mb-3" style={{ color: '#17528C' }}>{line.replace(/\*\*/g, '')}</h2>
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 mb-1" style={{ color: '#1A1A1A' }}>{line.slice(2)}</li>
            }
            if (line.trim() === '') {
              return <br key={i} />
            }
            return <p key={i} className="mb-2" style={{ color: '#1A1A1A' }}>{line}</p>
          })}
        </div>
      </article>
    </div>
  )
}
