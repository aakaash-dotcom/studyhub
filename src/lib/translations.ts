export const translations = {
  en: {
    // Header
    home: 'Home',
    plans: 'Plans',
    login: 'Login',
    search: 'Search papers...',
    
    // Classes
    class8: '8th Standard',
    class9: '9th Standard',
    class10: '10th Standard',
    class11: '11th Standard',
    class12: '12th Standard',
    
    // Chips
    all: 'All',
    questionPapers: 'Question Papers',
    modelQuestions: 'Model Questions',
    answerKeys: 'Answer Keys',
    topperMaterial: 'Topper Material',
    
    // Filters
    exam: 'Exam',
    year: 'Year',
    type: 'Type',
    quarterly: 'Quarterly',
    halfYearly: 'Half-yearly',
    annual: 'Annual',
    
    // Pages
    whatLookingFor: 'What are you looking for?',
    browseBySubject: 'Browse by Subject',
    popularQuestionPapers: 'Popular Question Papers',
    topperPack: 'Topper Pack',
    materials: 'materials',
    papers: 'papers',
    comingSoon: 'Coming soon',
    pages: 'pages',
    
    // Topper
    oneWord: 'One-word question bank',
    slowLearners: 'Slow learners',
    questionBank: 'Question bank',
    takeAsTest: 'Take this as a test',
    sirAddingFiles: 'Sir is adding files',
    
    // Plans
    free: 'FREE',
    pro: 'PRO',
    centum: 'CENTUM',
    oldPapers: 'Old question papers',
    impqModelsKeys: 'ImpQ, models, keys',
    recordingsWhatsapp: 'Recordings + WhatsApp',
    openingSoon: 'Opening soon',
    
    // Lock modal
    okayShowPro: 'Okay, show me Pro',
    liveWithFree: "I'll live with free papers",
    
    // Wizard
    selectLanguage: 'Select Language',
    selectBoard: 'Select Board',
    selectClass: 'Select Class',
    tamil: 'தமிழ்',
    english: 'English',
    tnStateBoard: 'TN State Board',
    continue: 'Continue',
    back: 'Back',
    
    // Common
    freeLabel: 'Free',
    proAccess: 'PRO ACCESS',
  },
  ta: {
    // Header
    home: 'முகப்பு',
    plans: 'திட்டங்கள்',
    login: 'உள்நுழை',
    search: 'கேள்வித்தாள்களைத் தேடுங்கள்...',
    
    // Classes
    class8: '8ம் வகுப்பு',
    class9: '9ம் வகுப்பு',
    class10: '10ம் வகுப்பு',
    class11: '11ம் வகுப்பு',
    class12: '12ம் வகுப்பு',
    
    // Chips
    all: 'அனைத்தும்',
    questionPapers: 'கேள்வித்தாள்கள்',
    modelQuestions: 'மாதிரி வினாத்தாள்கள்',
    answerKeys: 'விடைக்குறிப்புகள்',
    topperMaterial: 'டாப்பர் பொருள்',
    
    // Filters
    exam: 'தேர்வு',
    year: 'ஆண்டு',
    type: 'வகை',
    quarterly: 'காலாண்டு',
    halfYearly: 'அரையாண்டு',
    annual: 'ஆண்டு',
    
    // Pages
    whatLookingFor: 'எதைத் தேடுகிறீர்கள்?',
    browseBySubject: 'பாடம் வாரியாக உலாவு',
    popularQuestionPapers: 'பிரபலமான கேள்வித்தாள்கள்',
    topperPack: 'டாப்பர் பேக்',
    materials: 'பொருட்கள்',
    papers: 'தாள்கள்',
    comingSoon: 'விரைவில்',
    pages: 'பக்கங்கள்',
    
    // Topper
    oneWord: 'ஒருசொல் வினா வங்கி',
    slowLearners: 'மெதுவாகப் படிப்போர்',
    questionBank: 'வினா வங்கி',
    takeAsTest: 'தேர்வாக எழுது',
    sirAddingFiles: 'சார் கோப்புகளைச் சேர்க்கிறார்',
    
    // Plans
    free: 'இலவசம்',
    pro: 'ப்ரோ',
    centum: 'செஞ்சுரம்',
    oldPapers: 'பழைய கேள்வித்தாள்கள்',
    impqModelsKeys: 'முக்கியம், மாதிரி, விடைகள்',
    recordingsWhatsapp: 'பதிவுகள் + வாட்ஸ்அப்',
    openingSoon: 'விரைவில்',
    
    // Lock modal
    okayShowPro: 'சரி, ப்ரோ காட்டு',
    liveWithFree: 'இலவச தாள்களுடன் வாழ்வேன்',
    
    // Wizard
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    selectBoard: 'பலகையைத் தேர்ந்தெடுக்கவும்',
    selectClass: 'வகுப்பைத் தேர்ந்தெடுக்கவும்',
    tamil: 'தமிழ்',
    english: 'ஆங்கிலம்',
    tnStateBoard: 'தமிழ்நாடு மாநில வாரியம்',
    continue: 'தொடர்',
    back: 'பின்',
    
    // Common
    freeLabel: 'இலவசம்',
    proAccess: 'ப்ரோ அணுகல்',
  }
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, lang: 'en' | 'ta'): string {
  return translations[lang][key] || translations.en[key]
}
