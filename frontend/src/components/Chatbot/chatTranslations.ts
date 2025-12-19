export interface Suggestion {
  id: string;
  text: string;
}

export interface ChatTranslation {
  welcome: string;
  intro: string;
  points: string[];
  question: string;
  quickReplies: string[];
  placeholder: string;
  suggestionsTitle: string;
  suggestions: Suggestion[];
}

export interface ChatTranslations {
  [key: string]: ChatTranslation;
}

export const chatTranslations: ChatTranslations = {
  en: {
    welcome: "Welcome to LearnILmWorld!",
    intro: "I'm here to help you with:",
    points: [
      "Finding expert trainers and mentors",
      "Information about courses and certificates",
      "Booking sessions and class structure",
      "Equipment requirements",
      "And much more!"
    ],
    question: "What would you like to know about our services today?",
    quickReplies: [
      "How to find trainers?",
      "Do you provide certificates?",
      "What equipment do I need?",
      "How are classes structured?",
      "What are the pricing plans?",
      "Do you offer trial sessions?",
      "How to book a class?",
      "What languages do you teach?"
    ],
    placeholder: "Ask me anything about LearnILmWorld...",
    suggestionsTitle: "💡 Quick questions you might have:",
    suggestions: [
      { id: 'certificates', text: 'Do you provide certificates?' },
      { id: 'trainers', text: 'How to find trainers?' },
      { id: 'equipment', text: 'What equipment do I need?' },
      { id: 'class-structure', text: 'How are classes structured?' },
      { id: 'pricing', text: 'What are the pricing plans?' },
      { id: 'trial', text: 'Do you offer trial sessions?' }
    ]
  },

  hi: {
    welcome: "LearnILmWorld में आपका स्वागत है!",
    intro: "मैं यहां आपकी सहायता के लिए हूं:",
    points: [
      "विशेषज्ञ प्रशिक्षकों और मेंटर्स को ढूंढना",
      "पाठ्यक्रमों और प्रमाणपत्रों के बारे में जानकारी",
      "सत्र बुकिंग और कक्षा संरचना",
      "उपकरण आवश्यकताएं",
      "और भी बहुत कुछ!"
    ],
    question: "आज आप हमारी सेवाओं के बारे में क्या जानना चाहेंगे?",
    quickReplies: [
      "प्रशिक्षक कैसे ढूंढें?",
      "क्या आप प्रमाणपत्र प्रदान करते हैं?",
      "मुझे कौन सा उपकरण चाहिए?",
      "कक्षाएं कैसे संरचित हैं?",
      "मूल्य निर्धारण योजनाएं क्या हैं?",
      "क्या आप ट्रायल सत्र प्रदान करते हैं?",
      "कक्षा कैसे बुक करें?",
      "आप कौन सी भाषाएं सिखाते हैं?"
    ],
    placeholder: "LearnILmWorld के बारे में कुछ भी पूछें...",
    suggestionsTitle: "💡 त्वरित प्रश्न जो आपके पास हो सकते हैं:",
    suggestions: [
      { id: 'certificates', text: 'क्या आप प्रमाणपत्र प्रदान करते हैं?' },
      { id: 'trainers', text: 'प्रशिक्षक कैसे ढूंढें?' },
      { id: 'equipment', text: 'मुझे कौन सा उपकरण चाहिए?' },
      { id: 'class-structure', text: 'कक्षाएं कैसे संरचित हैं?' },
      { id: 'pricing', text: 'मूल्य निर्धारण योजनाएं क्या हैं?' },
      { id: 'trial', text: 'क्या आप ट्रायल सत्र प्रदान करते हैं?' }
    ]
  },

  sa: {
    welcome: "LearnILmWorld मध्ये आपले स्वागत आहे!",
    intro: "अहं भवतः साहाय्यं कर्तुं शक्नोमि:",
    points: [
      "प्रवीण प्रशिक्षकान् मार्गदर्शकांश्च अन्वेष्टुम्",
      "पाठ्यक्रमाणां प्रमाणपत्राणां च विवरणम्",
      "सत्र आरक्षणं कक्षा संरचना च",
      "उपकरण आवश्यकताः",
      "अथ च बहुकिञ्चित् अधिकम्!"
    ],
    question: "अद्य अहं कस्मिन विषयेम् साहाय्यं करोतु?",
    quickReplies: [
      "प्रशिक्षकान् कथं अन्वेषयामि?",
      "प्रमाणपत्रं भवति वा?",
      "कानि उपकरणानि आवश्यकानि?",
      "कक्षाः कथं संरचिताः?",
      "मूल्यनिर्धारणयोजनाः काः?",
      "परीक्षणसत्राणि भवन्ति वा?",
      "कक्षां कथं आरभेत्?",
      "काः भाषाः भवन्तः शिक्षयन्ति?"
    ],
    placeholder: "LearnILmWorld विषये यत्किंचित् पृच्छतु...",
    suggestionsTitle: "💡 त्वरितप्रश्नाः ये भवतः स्युः:",
    suggestions: [
      { id: 'certificates', text: 'प्रमाणपत्रं भवति वा?' },
      { id: 'trainers', text: 'प्रशिक्षकान् कथं अन्वेषयामि?' },
      { id: 'equipment', text: 'कानि उपकरणानि आवश्यकानि?' },
      { id: 'class-structure', text: 'कक्षाः कथं संरचिताः?' },
      { id: 'pricing', text: 'मूल्यनिर्धारणयोजनाः काः?' },
      { id: 'trial', text: 'परीक्षणसत्राणि भवन्ति वा?' }
    ]
  },

  fr: {
    welcome: "Bienvenue sur LearnILmWorld !",
    intro: "Je peux vous aider avec :",
    points: [
      "Trouver des formateurs et des mentors",
      "Informations sur les cours et certificats",
      "Réservation de sessions et structure des cours",
      "Matériel requis",
      "Et bien plus encore !"
    ],
    question: "Que souhaitez-vous savoir aujourd'hui sur nos services ?",
    quickReplies: [
      "Comment trouver des formateurs ?",
      "Fournissez-vous des certificats ?",
      "De quel matériel ai-je besoin ?",
      "Comment sont structurés les cours ?",
      "Quels sont les plans tarifaires ?",
      "Proposez-vous des sessions d'essai ?",
      "Comment réserver un cours ?",
      "Quelles langues enseignez-vous ?"
    ],
    placeholder: "Posez-moi toute question sur LearnILmWorld...",
    suggestionsTitle: "💡 Questions rapides que vous pourriez avoir :",
    suggestions: [
      { id: 'certificates', text: 'Fournissez-vous des certificats?' },
      { id: 'trainers', text: 'Comment trouver des formateurs?' },
      { id: 'equipment', text: 'De quel matériel ai-je besoin?' },
      { id: 'class-structure', text: 'Comment sont structurés les cours?' },
      { id: 'pricing', text: 'Quels sont les plans tarifaires?' },
      { id: 'trial', text: 'Proposez-vous des sessions d\'essai?' }
    ]
  },

  de: {
    welcome: "Willkommen bei LearnILmWorld!",
    intro: "Ich kann Ihnen helfen mit:",
    points: [
      "Experten-Trainer und Mentoren finden",
      "Informationen zu Kursen und Zertifikaten",
      "Sitzungsbuchung und Kursstruktur",
      "Geräteanforderungen",
      "Und vieles mehr!"
    ],
    question: "Was möchten Sie heute über unsere Dienstleistungen wissen?",
    quickReplies: [
      "Wie finde ich Trainer?",
      "Gibt es Zertifikate?",
      "Welche Ausrüstung benötige ich?",
      "Wie sind die Kurse strukturiert?",
      "Was sind die Preispläne?",
      "Bieten Sie Probestunden an?",
      "Wie buche ich einen Kurs?",
      "Welche Sprachen unterrichten Sie?"
    ],
    placeholder: "Fragen Sie mich alles über LearnILmWorld...",
    suggestionsTitle: "💡 Schnelle Fragen, die Sie haben könnten:",
    suggestions: [
      { id: 'certificates', text: 'Gibt es Zertifikate?' },
      { id: 'trainers', text: 'Wie finde ich Trainer?' },
      { id: 'equipment', text: 'Welche Ausrüstung benötige ich?' },
      { id: 'class-structure', text: 'Wie sind die Kurse strukturiert?' },
      { id: 'pricing', text: 'Was sind die Preispläne?' },
      { id: 'trial', text: 'Bieten Sie Probestunden an?' }
    ]
  },

  es: {
    welcome: "¡Bienvenido a LearnILmWorld!",
    intro: "Puedo ayudarte con:",
    points: [
      "Encontrar entrenadores y mentores expertos",
      "Información sobre cursos y certificados",
      "Reserva de sesiones y estructura de clases",
      "Requisitos de equipo",
      "¡Y mucho más!"
    ],
    question: "¿Qué te gustaría saber hoy sobre nuestros servicios?",
    quickReplies: [
      "¿Cómo encontrar entrenadores?",
      "¿Ofrecen certificados?",
      "¿Qué equipo necesito?",
      "¿Cómo están estructuradas las clases?",
      "¿Cuáles son los planes de precios?",
      "¿Ofrecen sesiones de prueba?",
      "¿Cómo reservo una clase?",
      "¿Qué idiomas enseñan?"
    ],
    placeholder: "Pregunta lo que quieras sobre LearnILmWorld...",
    suggestionsTitle: "💡 Preguntas rápidas que podrías tener:",
    suggestions: [
      { id: 'certificates', text: '¿Ofrecen certificados?' },
      { id: 'trainers', text: '¿Cómo encontrar entrenadores?' },
      { id: 'equipment', text: '¿Qué equipo necesito?' },
      { id: 'class-structure', text: '¿Cómo están estructuradas las clases?' },
      { id: 'pricing', text: '¿Cuáles son los planes de precios?' },
      { id: 'trial', text: '¿Ofrecen sesiones de prueba?' }
    ]
  },

  ja: {
    welcome: "LearnILmWorldへようこそ！",
    intro: "以下の内容についてお手伝いできます：",
    points: [
      "専門トレーナーとメンターの検索",
      "コースと認定証の情報",
      "セッション予約とクラス構成",
      "必要な機材について",
      "その他さまざまな質問"
    ],
    question: "本日、どのようなことをお知りになりたいですか？",
    quickReplies: [
      "トレーナーの探し方は？",
      "認定証はありますか？",
      "必要な機材は？",
      "クラスの構成は？",
      "料金プランは？",
      "トライアルセッションはありますか？",
      "クラスの予約方法は？",
      "どの言語を教えていますか？"
    ],
    placeholder: "LearnILmWorldについて何でも聞いてください...",
    suggestionsTitle: "💡 お持ちかもしれない簡単な質問：",
    suggestions: [
      { id: 'certificates', text: '認定証はありますか？' },
      { id: 'trainers', text: 'トレーナーの探し方は？' },
      { id: 'equipment', text: '必要な機材は？' },
      { id: 'class-structure', text: 'クラスの構成は？' },
      { id: 'pricing', text: '料金プランは？' },
      { id: 'trial', text: 'トライアルセッションはありますか？' }
    ]
  }
};