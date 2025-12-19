// chatbotRoutes.js - COMPLETE FIXED VERSION
import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Chatbot from '../models/Chatbot.js';
import fs from 'fs';

const router = express.Router();
const sessions = new Map();

// ================================
// KNOWLEDGE BASE LOADING
// ================================
let scrapedData = [];

try {
  scrapedData = JSON.parse(fs.readFileSync('full_site_data.json', 'utf8'));
} catch (error) {
  scrapedData = [];
}

// ================================
// CONFIGURATION BASED ON LEARNILMWORLD.COM
// ================================
const supportedLanguages = ['en', 'sa', 'hi', 'fr', 'de', 'es', 'ja'];

// Website subjects with multilingual keywords
const websiteSubjects = {
  'mathematics': [
    'math', 'mathematics', 'maths', 'गणित', 'matemáticas', 'mathématiques', 'mathematik',
    'गणितम्', 'अंकगणित', 'गणितशास्त्र', '算数', '数学'
  ],
  'science': [
    'science', 'physics', 'chemistry', 'biology', 'विज्ञान', 'ciencia', 'wissenschaft',
    'विज्ञानम्', 'भौतिकी', 'रसायन', 'जीवविज्ञान', '科学', '物理', '化学', '生物学'
  ],
  'history': [
    'history', 'historical', 'इतिहास', 'historia', 'histoire', 'geschichte',
    'इतिहासम्', 'ऐतिहासिक', '歴史', '史'
  ],
  'geography': [
    'geography', 'geographic', 'भूगोल', 'geografía', 'géographie', 'geographie',
    'भूगोलम्', '地理', '地理学'
  ],

  'hindi': ['hindi', 'हिंदी', 'हिन्दी', 'हिंदीभाषा'],
  'english': [
    'english', 'eng', 'inglés', 'anglais', 'englisch', 'अंग्रेज़ी',
    'अंग्रेजी', '英語', '英会話'
  ],
  'sanskrit': ['sanskrit', 'संस्कृत', 'sánscrito', 'संस्कृतम्'],
  'french': ['french', 'français', 'francais', 'französisch', 'फ्रेंच', 'フランス語'],
  'german': ['german', 'deutsch', 'alemán', 'allemand', 'जर्मन', 'ドイツ語'],
  'spanish': ['spanish', 'español', 'espanol', 'spanisch', 'स्पेनिश', 'スペイン語'],
  'japanese': ['japanese', 'japones', 'japonés', 'japanisch', 'जापानी', '日本語'],
  'arabic': ['arabic', 'arabic', 'árabe', 'arabisch', 'अरबी', 'アラビア語'],

  'ias': [
    'ias', 'upsc', 'civil services', 'सिविल सेवा', 'servicios civiles', 'services civils',
    'सिविलसेवा', 'UPSC', '公務員試験'
  ],
  'ielts': [
    'ielts', 'international english language testing system', 'आईईएलटीएस',
    'アイエルツ', 'IELTS試験'
  ],
  'toefl': [
    'toefl', 'test of english as a foreign language', 'टोफेल', 'トーフル',
    'TOEFL試験'
  ],

  'spoken english': [
    'spoken english', 'speaking english', 'conversational english', 'बोली जाने वाली अंग्रेज़ी',
    'अंग्रेजी बोलना', '英会話', 'スピーキング英語'
  ],

  'certificates': [
    'certificate', 'certification', 'certificates', 'completion certificate', 'course certificate',
    'प्रमाणपत्र', 'प्रमाणपत्रं', 'सर्टिफिकेट', 'प्रमाण पत्र', 'प्रमाण-पत्र',
    'certificat', 'certificats', 'certification', 'diplôme', 'attestation',
    'zertifikat', 'zertifikate', 'bescheinigung', 'zeugnis', 'urkunde',
    'certificado', 'certificados', 'certificación', 'diploma',
    '証明書', '修了証', 'サーティフィケート', '認定証',
    'شهادة', 'شهادات', 'إفادة'
  ],
  'trainers': [
    'trainer', 'trainers', 'tutor', 'tutors', 'teacher', 'teachers', 'instructor', 'instructors',
    'mentor', 'mentors', 'coach', 'coaches', 'find trainer', 'looking for tutor', 'need teacher',
    'प्रशिक्षक', 'शिक्षक', 'ट्यूटर', 'अध्यापक', 'गुरु', 'मेंटर',
    'formateur', 'formateurs', 'tuteur', 'tuteurs', 'enseignant', 'professeur',
    'trainer', 'ausbilder', 'tutor', 'lehrer', 'lehrkraft',
    'entrenador', 'tutor', 'profesor', 'instructor',
    'トレーナー', 'チューター', '教師', '先生'
  ],
  'find': [
    'find', 'looking for', 'need', 'want', 'searching for', 'how to find',
    'कैसे पाएं', 'कहाँ मिलेगा', 'खोजना', 'तलाश',
    'trouver', 'chercher', 'rechercher',
    'finden', 'suchen', 'brauchen',
    'encontrar', 'buscar', 'necesitar',
    '見つける', '探す', '必要'
  ]
};

// ================================
// MONGODB CONNECTION CHECK
// ================================
const checkMongoDBConnection = async () => {
  try {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// HELPER FUNCTIONS FOR MULTILINGUAL SUPPORT
// error handling / error fallbacks
function getFallbackResponse(language, type = 'general') {
  const responses = {
    en: {
      general: "I'm here to help you with LearnILmWorld services! What would you like to know about?",
      api_error: "I cannot connect to the core service. Please try again or contact support.",
      error: "I apologize for the technical issue. Please try again.",
      not_understood: "I'd love to help you learn! Could you tell me what subject or skill you'd like to study? (For example: 'I want to learn mathematics', 'Teach me English', 'I need science help')",
      ask_name: "To help you better, could you please tell me your name?",
      ask_email: "Great! Now could you please provide your email address?",
      thank_you: "Thank you! Now, what would you like to learn about today?",
      skip_info: "No problem! You can always provide your details later. How can I help you today?"
    },
    sa: {
      general: "अहं LearnILmWorld-सेवाभिः भवते साहाय्यं कर्तुं स्थितः अस्मि! भवतः किं ज्ञातुम् इच्छा?",
      api_error: "अहं मूलसेवां सह संयोजितुं न शक्नोमि। कृपया पुनः प्रयत्नं कुर्वन्तु वा समर्थनं सम्पर्कं कुर्वन्तु।",
      error: "तांत्रिकसमस्यायै क्षम्यतां। कृपया पुनः प्रयत्नं कुर्वन्तु।",
      not_understood: "अहं भवते अधीतुं साहाय्यं कर्तुम् इच्छामि! किं भवान् कां विषयं वा कौशलम् अध्येतुम् इच्छति तत् वक्तुं शक्नोति वा? (उदाहरणम्: 'अहं गणितम् अधीतुम् इच्छामि', 'माम् अंग्रेजी भाषाम् शिक्षयतु', 'मम विज्ञाने साहाय्यं आवश्यकम्')",
      ask_name: "भवते उत्तमरूपेण साहाय्यं कर्तुं, किं भवान् स्वनाम वक्तुं शक्नोति?",
      ask_email: "उत्तमम्! इदानीं किं भवान् स्वईमेलपतं प्रदातुं शक्नोति?",
      thank_you: "धन्यवादः! अद्य भवतः किं ज्ञातुम् इच्छा?",
      skip_info: "कोऽपि समस्या नास्ति! भवान् सदैव पश्चात् स्वविवरणं प्रदातुं शक्नोति। अद्याहं भवते कथं साहाय्यं कर्तुं शक्नोमि?"
    },
    hi: {
      general: "मैं आपकी LearnILmWorld सेवाओं में मदद करने के लिए यहाँ हूँ! आप किस बारे में जानना चाहते हैं?",
      api_error: "मैं मुख्य सेवा से कनेक्ट नहीं कर सकता। कृपया पुनः प्रयास करें या सपोर्ट से संपर्क करें।",
      error: "तकनीकी समस्या के लिए क्षमा करें। कृपया पुनः प्रयास करें।",
      not_understood: "मैं आपको सीखने में मदद करना चाहूंगा! क्या आप मुझे बता सकते हैं कि आप कौन सा विषय या कौशल पढ़ना चाहते हैं? (उदाहरण: 'मैं गणित सीखना चाहता हूँ', 'मुझे अंग्रेजी सिखाओ', 'मुझे विज्ञान में मदद चाहिए')",
      ask_name: "आपकी बेहतर मदद करने के लिए, क्या आप कृपया अपना नाम बता सकते हैं?",
      ask_email: "बहुत अच्छा! अब क्या आप कृपया अपना ईमेल पता प्रदान कर सकते हैं?",
      thank_you: "धन्यवाद! अब आज आप किस बारे में जानना चाहेंगे?",
      skip_info: "कोई बात नहीं! आप हमेशा बाद में अपना विवरण दे सकते हैं। आज मैं आपकी कैसे मदद कर सकता हूँ?"
    },
    fr: {
      general: "Je suis là pour vous aider avec les services LearnILmWorld! Que souhaitez-vous savoir?",
      api_error: "Je ne peux pas me connecter au service principal. Veuillez réessayer ou contacter le support.",
      error: "Je m'excuse pour le problème technique. Veuillez réessayer.",
      not_understood: "J'adorerais vous aider à apprendre! Pourriez-vous me dire quelle matière ou quelle compétence vous aimeriez étudier? (Par exemple: 'Je veux apprendre les mathématiques', 'Enseignez-moi l'anglais', 'J'ai besoin d'aide en sciences')",
      ask_name: "Pour mieux vous aider, pourriez-vous s'il vous plaît me dire votre nom?",
      ask_email: "Super! Maintenant, pourriez-vous s'il vous plaît fournir votre adresse e-mail?",
      thank_you: "Merci! Maintenant, que souhaitez-vous apprendre aujourd'hui?",
      skip_info: "Pas de problème! Vous pouvez toujours fournir vos coordonnées plus tard. Comment puis-je vous aider aujourd'hui?"
    },
    de: {
      general: "Ich bin hier, um Ihnen bei LearnILmWorld-Dienstleistungen zu helfen! Worüber möchten Sie informiert werden?",
      api_error: "Ich kann keine Verbindung zum Kerndienst herstellen. Bitte versuchen Sie es erneut oder wenden Sie sich an den Support.",
      error: "Entschuldigung für das technische Problem. Bitte versuchen Sie es erneut.",
      not_understood: "Ich würde Ihnen gerne beim Lernen helfen! Könnten Sie mir sagen, welches Fach oder welche Fähigkeit Sie studieren möchten? (Zum Beispiel: 'Ich möchte Mathematik lernen', 'Bring mir Englisch bei', 'Ich brauche Hilfe in Wissenschaft')",
      ask_name: "Um Ihnen besser helfen zu können, könnten Sie bitte Ihren Namen nennen?",
      ask_email: "Großartig! Könnten Sie nun bitte votre E-Mail-Adresse angeben?",
      thank_you: "Danke! Was möchten Sie heute lernen?",
      skip_info: "Kein problème! Sie können Ihre Daten jederzeit später angeben. Wie kann ich Ihnen heute helfen?"
    },
    es: {
      general: "¡Estoy aquí para ayudarlo con los servicios de LearnILmWorld! ¿Qué le gustaría saber?",
      api_error: "No puedo conectarme al servicio principal. Por favor, inténtelo de nuevo o contacte al soporte.",
      error: "Disculpe el problema técnico. Por favor, inténtelo de nuevo.",
      not_understood: "¡Me encantaría ayudarte a aprender! ¿Podrías decirme qué materia o habilidad te gustaría estudiar? (Por ejemplo: 'Quiero aprender matemáticas', 'Enséñame inglés', 'Necesito ayuda en ciencias')",
      ask_name: "Para ayudarlo mejor, ¿podría decirme su nombre?",
      ask_email: "¡Excelente! ¿Ahora podría proporcionar su dirección de correo electrónico?",
      thank_you: "¡Gracias! ¿Qué le gustaría aprender hoy?",
      skip_info: "¡No hay problème! Siempre puede proporcionar sus detalles más tarde. ¿Cómo puedo ayudarlo hoy?"
    },
    ja: {
      general: "LearnILmWorldのサービスについてお手伝いします！何について知りたいですか？",
      api_error: "コアサービスに接続できません。もう一度お試しいただくか、サポートにお問い合わせください。",
      error: "技術的な問題が発生しました。もう一度お試しください。",
      not_understood: "学習をお手伝いさせていただきます！どの科目やスキルを学びたいか教えていただけますか？（例：「数学を学びたい」、「英語を教えて」、「科学の助けが必要」）",
      ask_name: "より良いお手伝いをするために、お名前を教えていただけますか？",
      ask_email: "素晴らしい！では、メールアドレスを教えていただけますか？",
      thank_you: "ありがとうございます！今日は何について知りたいですか？",
      skip_info: "問題ありません！後で詳細を提供することもできます。今日はどのようなお手伝いができますか？"
    }
  };

  return responses[language]?.[type] || responses.en[type];
}

// TIME-BASED GREETING
const TimeBasedGreeting = {
  getGreeting: (language = 'en') => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const greetings = {
      morning: {
        en: 'Good morning', sa: 'सुप्रभातम्', hi: 'सुप्रभात',
        fr: 'Bonjour', de: 'Guten Morgen', es: 'Buenos días', ja: 'おはようございます'
      },
      afternoon: {
        en: 'Good afternoon', sa: 'सुभमध्याह्नम्', hi: 'नमस्कार',
        fr: 'Bon après-midi', de: 'Guten Tag', es: 'Buenas tardes', ja: 'こんにちは'
      },
      evening: {
        en: 'Good evening', sa: 'सुभसन्ध्याकालम्', hi: 'शुभ संध्या',
        fr: 'Bonsoir', de: 'Guten Abend', es: 'Buenas noches', ja: 'こんばんは'
      },
      night: {
        en: 'Good night', sa: 'शुभरात्रिः', hi: 'शुभ रात्रि',
        fr: 'Bonne nuit', de: 'Gute Nacht', es: 'Buenas noches', ja: 'おやすみなさい'
      }
    };
    return greetings[timeOfDay][language] || greetings[timeOfDay].en;
  }
};

// WELCOME MESSAGES WITH INFO COLLECTION
const WelcomeMessages = {
  getConversationalWelcome: (language = 'en') => {
    const greeting = TimeBasedGreeting.getGreeting(language);

    const messages = {
      en: `${greeting}! 👋 I'm your LearniLM World assistant, here to help you find trainers, explore courses, book sessions, and more.\n\nFirst, let's get to know you a little!\n\n**What's your name?**`,
      sa: `${greeting}! 👋 अहं भवतः LearniLM World सहायकः अस्मि, अत्र भवते प्रशिक्षकान् अन्वेष्टुं, पाठ्यक्रमान् अन्विष्टुं, सत्राणि आरब्धुं, अन्यच्च साहाय्यं कर्तुम्।\n\nप्रथमं, किञ्चित् भवन्तं ज्ञातुम्!\n\n**भवतः नाम किम्?**`,
      hi: `${greeting}! 👋 मैं आपकी LearniLM World सहायक हूँ, यहाँ आपको प्रशिक्षक ढूंढने, पाठ्यक्रम तलाशने, सत्र बुक करने और अधिक में मदद करने के लिए।\n\nपहले, आपको थोड़ा जानते हैं!\n\n**आपका नाम क्या है?**`,
      fr: `${greeting}! 👋 Je suis votre assistant LearniLM World, ici pour vous aider à trouver des formateurs, explorer des cours, réserver des sessions et plus encore.\n\nTout d'abord, faisons un peu connaissance!\n\n**Quel est votre nom?**`,
      de: `${greeting}! 👋 Ich bin Ihr LearniLM World-Assistent, hier um Ihnen bei der Suche nach Trainern, der Erkundung von Kurses, der Buchung von Sitzungen und mehr zu helfen.\n\nLassen Sie uns zunächst ein wenig Sie kennenlernen!\n\n**Wie ist Ihr Name?**`,
      es: `${greeting}! 👋 Soy su asistente de LearniLM World, aquí para ayudarlo a encontrar entrenadores, explorar cursos, reservar sesiones y más.\n\n¡Primero, conozcámoslo un poco!\n\n**¿Cuál es su nombre?**`,
      ja: `${greeting}! 👋 私はあなたのLearniLM Worldアシスタントです。トレーナーの検索、コースの探索、セッションの予約などをお手伝いします。\n\nまず、あなたについて少し知りましょう！\n\n**お名前は何ですか？**`
    };

    return messages[language] || messages.en;
  },

  getEmailPrompt: (name, language = 'en') => {
    const messages = {
      en: `Nice to meet you, ${name}! 😊\n\n**What's the best email to reach you?**`,
      sa: `भवता सह मेलनं सुखदम्, ${name}! 😊\n\n**भवतः किं श्रेष्ठं ईमेलपतं भवन्तं प्राप्तुं?**`,
      hi: `आपसे मिलकर अच्छा लगा, ${name}! 😊\n\n**आपसे संपर्क करने के लिए सबसे अच्छा ईमेल क्या है?**`,
      fr: `Ravi de vous rencontrer, ${name}! 😊\n\n**Quelle est la meilleure adresse e-mail pour vous joindre?**`,
      de: `Schön, Sie kennenzulernen, ${name}! 😊\n\n**Was ist die beste E-Mail, um Sie zu erreichen?**`,
      es: `¡Mucho gusto, ${name}! 😊\n\n**¿Cuál es el mejor correo electrónico para contactarlo?**`,
      ja: `はじめまして、${name}さん！😊\n\n**連絡するための最適なメールアドレスは何ですか？**`
    };

    return messages[language] || messages.en;
  },

  getWelcomeComplete: (name, language = 'en') => {
    const messages = {
      en: `Perfect! Thank you, ${name}! ✨\n\nNow, how can I help you today? You can ask me about:\n\n• Finding expert trainers and mentors\n• Information about courses and certificates\n• Booking sessions and class structure\n• Equipment requirements\n• Pricing and trial sessions\n• Or anything else about LearniLM World!\n\n💡 **What would you like to know?**`,
      sa: `पूर्णम्! धन्यवादः, ${name}! ✨\n\nअद्याहं भवते कथं साहाय्यं कर्तुं शक्नोमि? भवान् माम् अपृच्छेत्:\n\n• विशेषज्ञप्रशिक्षकान् मार्गदर्शकांश्च अन्विष्टुम्\n• पाठ्यक्रमाणां प्रमाणपत्राणां च विषये सूचनाम्\n• सत्राणि आरब्धुं कक्षासंरचनां च\n• उपकरणानाम् आवश्यकताः\n• मूल्यनिर्धारणं परीक्षणसत्राणि च\n• वा LearniLM World-विषये अन्यत् किमपि\n\n💡 **भवतः किं ज्ञातुम् इच्छा?**`,
      hi: `बिल्कुल सही! धन्यवाद, ${name}! ✨\n\nअब, आज मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे पूछ सकते हैं:\n\n• विशेषज्ञ प्रशिक्षक और मेंटर ढूंढना\n• पाठ्यक्रम और प्रमाणपत्रों के बारे में जानकारी\n• सत्र बुक करना और कक्षा संरचना\n• उपकरण आवश्यकताएं\n• मूल्य निर्धारण और ट्रायल सत्र\n• या LearniLM World के बारे में कुछ और!\n\n💡 **आप क्या जानना चाहेंगे?**`,
      fr: `Parfait! Merci, ${name}! ✨\n\nMaintenant, comment puis-je vous aider aujourd'hui? Vous pouvez me demander:\n\n• Trouver des formateurs et des mentors experts\n• Informations sur les cours et les certificats\n• Réservation de sessions et structure des cours\n• Exigences en matière d'équipement\n• Tarification et sessions d'essai\n• Ou autre chose sur LearniLM World!\n\n💡 **Que souhaitez-vous savoir?**`,
      de: `Perfekt! Danke, ${name}! ✨\n\nNun, wie kann ich Ihnen heute helfen? Sie können mich fragen:\n\n• Experten-Trainer und Mentoren finden\n• Informationen zu Kursen und Zertifikaten\n• Buchung von Sitzungen und Klassenstruktur\n• Ausrüstungsanforderungen\n• Preisgestaltung und Probestunden\n• Oder etwas anderes über LearniLM World!\n\n💡 **Was möchten Sie wissen?**`,
      es: `¡Perfecto! ¡Gracias, ${name}! ✨\n\nAhora, ¿cómo puedo ayudarlo hoy? Puede preguntarme:\n\n• Encontrar entrenadores y mentores expertos\n• Información sobre cursos y certificados\n• Reserva de sesiones y estructura de clases\n• Requisitos de equipo\n• Precios y sesiones de prueba\n• ¡O cualquier otra cosa sobre LearniLM World!\n\n💡 **¿Qué le gustaría saber?**`,
      ja: `完璧です！ありがとうございます、${name}さん！✨\n\nでは、今日はどのようにお手伝いできますか？次のことをお尋ねください：\n\n• エキスパートトレーナーとメンターの検索\n• コースと証明書についての情報\n• セッションの予約とクラス構成\n• 機器要件\n• 料金とトライアルセッション\n• またはLearniLM Worldに関するその他のこと！\n\n💡 **何を知りたいですか？**`
    };

    return messages[language] || messages.en;
  },

  getSkipMessage: (language = 'en') => {
    const messages = {
      en: "No problem! You can always provide your details later. 😊\n\nHow can I help you today? You can ask me about:\n\n• Finding expert trainers\n• Course and certificate info\n• Booking sessions\n• Equipment needs\n• Or anything about LearniLM World!\n\n💡 **What would you like to know?**",
      sa: "कोऽपि समस्या नास्ति! भवान् सदैव पश्चात् स्वविवरणं प्रदातुं शक्नोति। 😊\n\nअद्याहं भवते कथं साहाय्यं कर्तुं शक्नोमि? भवान् माम् अपृच्छेत्:\n\n• विशेषज्ञप्रशिक्षकान् अन्विष्टुम्\n• पाठ्यक्रमप्रमाणपत्रसूचनाम्\n• सत्राणि आरब्धुम्\n• उपकरणानाम् आवश्यकताः\n• वा LearniLM World-विषये किमपि\n\n💡 **भवतः किं ज्ञातुम् इच्छा?**",
      hi: "कोई बात नहीं! आप हमेशा बाद में अपना विवरण दे सकते हैं। 😊\n\nआज मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे पूछ सकते हैं:\n\n• विशेषज्ञ प्रशिक्षक ढूंढना\n• पाठ्यक्रम और प्रमाणपत्र जानकारी\n• सत्र बुक करना\n• उपकरण आवश्यकताएं\n• या LearniLM World के बारे में कुछ भी!\n\n💡 **आप क्या जानना चाहेंगे?**",
      fr: "Pas de problème! Vous pouvez toujours fournir vos coordonnées plus tard. 😊\n\nComment puis-je vous aider aujourd'hui? Vous pouvez me demander:\n\n• Trouver des formateurs experts\n• Informations sur les cours et certificats\n• Réservation de sessions\n• Besoins en équipement\n• Ou quoi que ce soit sur LearniLM World!\n\n💡 **Que souhaitez-vous savoir?**",
      de: "Kein Problem! Sie können Ihre Daten jederzeit später angeben. 😊\n\nWie kann ich Ihnen heute helfen? Sie können mich fragen:\n\n• Experten-Trainer finden\n• Kurs- und Zertifikatsinformationen\n• Sitzungen buchen\n• Ausrüstungsbedarf\n• Oder irgendetwas über LearniLM World!\n\n💡 **Was möchten Sie wissen?**",
      es: "¡No hay problema! Siempre puede proporcionar sus detalles más tarde. 😊\n\n¿Cómo puedo ayudarlo hoy? Puede preguntarme:\n\n• Encontrar entrenadores expertos\n• Información sobre cursos y certificados\n• Reservar sesiones\n• Necesidades de equipo\n• ¡O cualquier cosa sobre LearniLM World!\n\n💡 **¿Qué le gustaría saber?**",
      ja: "問題ありません！後で詳細を提供することもできます。😊\n\n今日はどのようにお手伝いできますか？次のことをお尋ねください：\n\n• エキスパートトレーナーの検索\n• コースと証明書の情報\n• セッションの予約\n• 機器の必要性\n• またはLearniLM Worldに関する何か！\n\n💡 **何を知りたいですか？**"
    };

    return messages[language] || messages.en;
  }
};

// IMPROVED USER INFO COLLECTOR - FIXED
class SmartUserInfoCollector {
  constructor() {
    this.userSessions = new Map();
  }

  getSession(sessionId) {
    if (!this.userSessions.has(sessionId)) {
      this.userSessions.set(sessionId, {
        step: 'welcome',
        name: null,
        email: null,
        collectedAt: null,
        hasDeclined: false,
        welcomeShown: false,
        language: 'en'
      });
    }
    return this.userSessions.get(sessionId);
  }

  // SIMPLIFIED NAME VALIDATION - FIXED
  isValidName(name) {
    if (!name || typeof name !== 'string') return false;

    const trimmedName = name.trim();

    // Simple length check
    if (trimmedName.length < 2 || trimmedName.length > 50) return false;

    // Allow international characters, spaces, hyphens, apostrophes
    const nameRegex = /^[\p{L}\s\-'.]+$/u;

    // Check if it's a real name (has at least one vowel and one consonant)
    const hasVowel = /[aeiouAEIOUàèìòùáéíóúâêîôûäëïöüअआइईउऊऋएऐओऔあいうえおアイウエオ]/u.test(trimmedName);
    const hasConsonant = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZकखगघचछजझटठडढतथदधपफबभमयरलवशषसहかきくけこさしすせそたちつてとなにぬねのはひふへほ]/u.test(trimmedName);

    // Must have some recognizable name pattern
    if (!hasVowel || !hasConsonant) {
      // For very short names or single words, be more lenient
      if (trimmedName.length < 3) {
        return nameRegex.test(trimmedName);
      }
      return false;
    }

    return nameRegex.test(trimmedName);
  }

  looksLikeGibberish(text) {
    const trimmed = text.trim();
    if (trimmed.length < 3) return false;

    const keyboardRows = [
      'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
      'qawsedrftgyhujikolp', 'wsxedcrfvtgbyhnujm',
      '1234567890', 'abcdefghijklmnopqrstuvwxyz','yes',
      'yess','yesss','how','what','where','you','me'
    ];

    const lowerText = trimmed.toLowerCase();

    // Check for keyboard row sequences
    for (const row of keyboardRows) {
      if (row.includes(lowerText) || lowerText.includes(row)) {
        return true;
      }

      // Check for sequential characters
      for (let i = 0; i <= lowerText.length - 4; i++) {
        const substring = lowerText.substring(i, i + 4);
        if (row.includes(substring)) {
          return true;
        }
      }
    }

    // Check for repeating patterns
    const repeatingPattern = /(.)\1{2,}/.test(lowerText);
    if (repeatingPattern) return true;

    // Check for alternating patterns (like ababab)
    let alternating = true;
    for (let i = 2; i < lowerText.length; i++) {
      if (lowerText[i] !== lowerText[i - 2]) {
        alternating = false;
        break;
      }
    }
    if (alternating && lowerText.length > 3) return true;

    return false;
  }

  extractNameFromMessage(message) {
    const trimmedMessage = message.trim();

    if (this.isSkipRequest(trimmedMessage)) return null;

    // Simple patterns for name extraction
    const patterns = [
      /^my name is ([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/i,
      /^i['`´]?m ([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/i,
      /^i am ([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/i,
      /^call me ([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/i,
      /^name['`´]?s? ([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/i,
      /^([a-zA-ZÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-'.]{2,50})$/ // Just a name
    ];

    for (const pattern of patterns) {
      const match = trimmedMessage.match(pattern);
      if (match && match[1]) {
        const potentialName = match[1].trim();
        if (this.isValidName(potentialName) && !this.looksLikeGibberish(potentialName)) {
          return potentialName;
        }
      }
    }

    return null;
  }

  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  extractEmailFromMessage(message) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = message.match(emailPattern);
    if (match) {
      const potentialEmail = match[0].trim();
      if (this.isValidEmail(potentialEmail)) {
        return potentialEmail;
      }
    }
    return null;
  }

  // FIXED SKIP FUNCTIONALITY
  isSkipRequest(message) {
    if (!message || typeof message !== 'string') return false;

    const lowerMessage = message.toLowerCase().trim();

    // Simple check - if they say "skip" anywhere
    if (lowerMessage.includes('skip')) return true;

    // Check for other skip variations
    const skipWords = [
      'later', 'not now', 'maybe later', 'n/a', 'na',
      'none', 'no thanks', 'no thank you', "don't", 'dont',
      'prefer not', 'rather not', 'next', 'continue', 'pass',
      'not interested', 'no info', 'skip info', 'skip name',
      'skip email', 'skip this', 'skip it', 'skip for now',
      "i'll skip", 'ill skip', 'no name', 'no email'
    ];

    // Check for exact matches with common skip phrases
    const exactSkipPhrases = [
      'skip', 'skip it', 'skip this', 'skip for now', 'skip name',
      'skip info', 'skip email', 'later', 'not now', 'maybe later',
      'no thanks', 'no thank you', 'next', 'continue', 'pass'
    ];

    if (exactSkipPhrases.includes(lowerMessage)) return true;

    // Check if any skip word appears in the message
    for (const word of skipWords) {
      if (lowerMessage === word || lowerMessage.includes(word)) {
        return true;
      }
    }

    return false;
  }

  processMessage(sessionId, message, language = 'en') {
    const session = this.getSession(sessionId);
    session.language = language;

    const trimmedMessage = message.trim();

    // CHECK FOR SKIP FIRST
    if (this.isSkipRequest(trimmedMessage)) {
      session.hasDeclined = true;
      session.step = 'complete';

      // Use translated skip message
      const skipResponses = {
        en: "No problem! You can always provide your details later. 😊\n\nHow can I help you today?",
        hi: "कोई बात नहीं! आप हमेशा बाद में अपना विवरण दे सकते हैं। 😊\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
        sa: "कोऽपि समस्या नास्ति! भवान् सदैव पश्चात् स्वविवरणं प्रदातुं शक्नोति। 😊\n\nअद्याहं भवते कथं साहाय्यं कर्तुं शक्नोमि?",
        fr: "Pas de problème! Vous pouvez toujours fournir vos coordonnées plus tard. 😊\n\nComment puis-je vous aider aujourd'hui?",
        de: "Kein Problem! Sie können Ihre Daten jederzeit später angeben. 😊\n\nWie kann ich Ihnen heute helfen?",
        es: "¡No hay problema! Siempre puede proporcionar sus detalles más tarde. 😊\n\n¿Cómo puedo ayudarlo hoy?",
        ja: "問題ありません！後で詳細を提供することもできます。😊\n\n今日はどのようにお手伝いできますか？"
      };

      return {
        step: 'complete',
        response: skipResponses[language] || skipResponses.en,
        collected: false
      };
    }

    switch (session.step) {
      case 'welcome':
        const name = this.extractNameFromMessage(message);
        if (name && this.isValidName(name)) {
          session.name = name;
          session.step = 'ask_email';
          return {
            step: 'ask_email',
            response: WelcomeMessages.getEmailPrompt(session.name, language),
            collected: { name: session.name }
          };
        }

        // If no valid name found, ask for name
        session.step = 'ask_name';
        return {
          step: 'ask_name',
          response: getFallbackResponse(language, 'ask_name'),
          collected: false
        };

      case 'ask_name':
        const extractedName = this.extractNameFromMessage(message);
        if (extractedName && this.isValidName(extractedName) && !this.looksLikeGibberish(extractedName)) {
          session.name = extractedName;
          session.step = 'ask_email';
          return {
            step: 'ask_email',
            response: WelcomeMessages.getEmailPrompt(session.name, language),
            collected: { name: session.name }
          };
        }

        // Invalid name response
        const errorResponses = {
          en: "That doesn't look like a valid name. Please enter your real name (2-50 characters, letters only).",
          hi: "यह एक वैध नाम नहीं लगता। कृपया अपना वास्तविक नाम दर्ज करें (2-50 अक्षर, केवल अक्षर)।",
          sa: "तत् वैधनाम न प्रतीयते। कृपया स्ववास्तविकं नाम प्रविश्यताम् (२-५० अक्षराणि, केवलं अक्षराणि)।",
          fr: "Cela ne ressemble pas à un nom valide. Veuillez entrer votre vrai nom (2-50 caractères, lettres uniquement).",
          de: "Das sieht nicht nach einem gültigen Namen aus. Bitte geben Sie Ihren richtigen Namen ein (2-50 Zeichen, nur Buchstaben).",
          es: "Eso no parece un nombre válido. Por favor, ingrese su nombre real (2-50 caracteres, solo letras).",
          ja: "有効な名前のようには見えません。本名を入力してください（2〜50文字、文字のみ）。"
        };

        return {
          step: 'ask_name',
          response: errorResponses[language] || errorResponses.en,
          collected: false
        };

      case 'ask_email':
        const extractedEmail = this.extractEmailFromMessage(message);
        if (extractedEmail && this.isValidEmail(extractedEmail)) {
          session.email = extractedEmail;
          session.step = 'complete';
          session.collectedAt = new Date();

          return {
            step: 'complete',
            response: WelcomeMessages.getWelcomeComplete(session.name, language),
            collected: { name: session.name, email: session.email }
          };
        }

        // Invalid email response
        const emailErrorResponses = {
          en: "That doesn't look like a valid email address. Please enter a valid email (e.g., name@example.com)",
          hi: "यह एक वैध ईमेल पता नहीं लगता। कृपया एक वैध ईमेल दर्ज करें (जैसे, name@example.com)",
          sa: "तत् वैधम् ईमेलपतं न प्रतीयते। कृपया वैधम् ईमेलपतं प्रविश्यताम् (यथा, name@example.com)",
          fr: "Cela ne ressemble pas à une adresse e-mail valide. Veuillez entrer un e-mail valide (par exemple, name@example.com)",
          de: "Das sieht nicht nach einer gültigen E-Mail-Adresse aus. Bitte geben Sie eine gültige E-Mail ein (z.B. name@example.com)",
          es: "Eso no parece una dirección de correo electrónico válida. Por favor, ingrese un correo válido (ej. name@example.com)",
          ja: "有効なメールアドレスのようには見えません。有効なメールアドレスを入力してください（例：name@example.com）"
        };

        return {
          step: 'ask_email',
          response: emailErrorResponses[language] || emailErrorResponses.en,
          collected: { name: session.name }
        };

      case 'complete':
        return {
          step: 'complete',
          response: null,
          collected: { name: session.name, email: session.email }
        };
    }
  }

  async saveUserInfo(sessionId, name, email) {
    try {
      const isConnected = await checkMongoDBConnection();
      if (!isConnected) return false;

      await Chatbot.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            userName: name,
            userEmail: email,
            infoCollectedAt: new Date()
          }
        },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error("Error saving user info:", error);
      return false;
    }
  }

  getSessionInfo(sessionId) {
    const session = this.getSession(sessionId);
    return {
      name: session.name,
      email: session.email,
      step: session.step,
      hasDeclined: session.hasDeclined,
      collectedAt: session.collectedAt
    };
  }

  isInfoComplete(sessionId) {
    const session = this.getSession(sessionId);
    return session.step === 'complete' || session.hasDeclined;
  }

  resetSession(sessionId) {
    this.userSessions.delete(sessionId);
  }
}

const smartCollector = new SmartUserInfoCollector();

// DIRECT ANSWERS FOR LEARNILMWORLD
const DirectAnswers = {
  getCertificateAnswer(language) {
    const answers = {
      en: `🏆 **Certificates at LearnILmWorld:**\n\n**Yes!** We provide completion certificates for all our courses.\n\n**Certificate Details:**\n✅ Digital PDF format\n✅ Online verification code\n✅ Shareable on LinkedIn\n✅ Course name and completion date\n✅ Instructor signature and seal\n\n**Courses with Certificates:**\n• All academic subjects\n• Language courses\n• Competitive exam preparation\n• Skill development courses\n• Test preparation (IELTS, TOEFL, etc.)\n\n💡 Would you like to know which specific courses offer certificates?`,
      sa: `🏆 **LearnILmWorld-इत्यस्मिन् प्रमाणपत्राणि:**\n\n**आम्!** वयं सर्वेषां पाठ्यक्रमाणाम् कृते समाप्तिप्रमाणपत्राणि यच्छामः।\n\n**प्रमाणपत्रविवरणानि:**\n✅ डिजिटल् पीडीएफ् स्वरूपम्\n✅ अन्तर्जालसत्यापनसङ्केतः\n✅ LinkedIn-इत्यस्मिन् साझाकरणीयम्\n✅ पाठ्यक्रमनाम समाप्तितिथिश्च\n✅ प्रशिक्षकहस्ताक्षरम् मुद्रा च\n\n**प्रमाणपत्रसहिताः पाठ्यक्रमाः:**\n• सर्वाणि शैक्षणिकविषयाणि\n• भाषापाठ्यक्रमाः\n• प्रतियोगीपरीक्षातैयारी\n• कौशलविकासपाठ्यक्रमाः\n• परीक्षातैयारी (IELTS, TOEFL, इत्यादि)\n\n💡 कानि विशिष्टानि पाठ्यक्रमाणि प्रमाणपत्राणि यच्छन्ति इति ज्ञातुम् इच्छथ वा?`,
      hi: `🏆 **LearnILmWorld में प्रमाणपत्र:**\n\n**हाँ!** हम सभी पाठ्यक्रमों के लिए समापन प्रमाणपत्र प्रदान करते हैं।\n\n**प्रमाणपत्र विवरण:**\n✅ डिजिटल PDF प्रारूप\n✅ ऑनलाइन सत्यापन कोड\n✅ LinkedIn पर साझा करने योग्य\n✅ पाठ्यक्रम का नाम और समापन तिथि\n✅ प्रशिक्षक हस्ताक्षर और मोहर\n\n**प्रमाणपत्र वाले पाठ्यक्रम:**\n• सभी शैक्षणिक विषय\n• भाषा पाठ्यक्रम\n• प्रतियोगी परीक्षा तैयारी\n• कौशल विकास पाठ्यक्रम\n• परीक्षा तैयारी (IELTS, TOEFL, आदि)\n\n💡 क्या आप जानना चाहेंगे कि कौन से विशिष्ट पाठ्यक्रम प्रमाणपत्र प्रदान करते हैं?`,
      fr: `🏆 **Certificats chez LearnILmWorld:**\n\n**Oui!** Nous fournissons des certificats de fin d'études pour tous nos cours.\n\n**Détails du certificat:**\n✅ Format PDF numérique\n✅ Code de vérification en ligne\n✅ Partageable sur LinkedIn\n✅ Nom du cours et date de fin\n✅ Signature et sceau de l'instructeur\n\n**Cours avec certificats:**\n• Toutes les matières académiques\n• Cours de langues\n• Préparation aux examens compétitifs\n• Cours de développement des compétences\n• Préparation aux tests (IELTS, TOEFL, etc.)\n\n💡 Souhaitez-vous savoir quels cours spécifiques offrent des certificats?`,
      de: `🏆 **Zertifikate bei LearnILmWorld:**\n\n**Ja!** Wir stellen Abschlusszertifikate für alle unsere Kurse bereit.\n\n**Zertifikatdetails:**\n✅ Digitales PDF-Format\n✅ Online-Verifizierungscode\n✅ Auf LinkedIn teilbar\n✅ Kursname und Abschlussdatum\n✅ Unterschrift und Siegel des Lehrers\n\n**Kurse mit Zertifikaten:**\n• Alle akademischen Fächer\n• Sprachkurse\n• Wettbewerbsprüfungsvorbereitung\n• Kompetenzentwicklungskurse\n• Testvorbereitung (IELTS, TOEFL usw.)\n\n💡 Möchten Sie wissen, welche Kurse speziell Zertifikate anbieten?`,
      es: `🏆 **Certificados en LearnILmWorld:**\n\n**¡Sí!** Proporcionamos certificados de finalización para todos nuestros cursos.\n\n**Detalles del certificado:**\n✅ Formato PDF digital\n✅ Código de verificación en línea\n✅ Compartible en LinkedIn\n✅ Nombre del curso y fecha de finalización\n✅ Firma y sello del instructor\n\n**Cursos con certificados:**\n• Todas las materias académicas\n• Cursos de idiomas\n• Preparación para exámenes competitivos\n• Cursos de desarrollo de habilidades\n• Preparación de pruebas (IELTS, TOEFL, etc.)\n\n💡 ¿Le gustaría saber qué cursos específicos ofrecen certificados?`,
      ja: `🏆 **LearnILmWorldの証明書:**\n\n**はい！** すべてのコースの修了証明書を発行しています。\n\n**証明書の詳細:**\n✅ デジタルPDF形式\n✅ オンライン検証コード\n✅ LinkedInで共有可能\n✅ コース名と修了日\n✅ 講師の署名と印\n\n**証明書付きコース:**\n• すべての学問科目\n• 言語コース\n• 競争試験準備\n• スキル開発コース\n• テスト準備（IELTS、TOEFLなど）\n\n💡 どの特定のコースが証明書を提供するか知りたいですか？`
    };
    return answers[language] || answers.en;
  },

  getEquipmentAnswer(language) {
    const answers = {
      en: `💻 **Required Equipment for LearnILmWorld Classes:**\n\n**Essential Requirements:**\n• Computer/Laptop with webcam\n• Stable internet connection (minimum 5 Mbps)\n• Microphone (headset recommended)\n• Modern web browser (Chrome, Firefox, or Edge)\n• Smartphone/Tablet (for mobile access)\n\n**Optional but Recommended:**\n• Quiet environment for better concentration\n• Good lighting for video clarity\n• Notebook and pen for taking notes\n• Power backup for uninterrupted learning\n\n💡 Would you like specific recommendations for laptops or webcams?`,
      sa: `💻 **LearnILmWorld-कक्षाणाम् आवश्यकानि उपकरणानि:**\n\n**मूलभूताः आवश्यकताः:**\n• वेबकैमयुक्तः संगणकः/लैपटॉपः\n• स्थिरः अन्तर्जालसम्पर्कः (न्यूनतमं 5 Mbps)\n• माइक्रोफोनः (हेडसेटः अनुशस्यते)\n• आधुनिकः वेबब्राउज़रः (Chrome, Firefox, वा Edge)\n• स्मार्टफोनः/टैब्लेट् (मोबाइलप्रवेशाय)\n\n**वैकल्पिकं किन्तु अनुशस्यमानम्:**\n• उत्तमैकाग्रतायै शान्तः वातावरणः\n• वीडियोस्पष्टतायै उत्तमं प्रकाशम्\n• स्मरणलिप्यर्थं नोटबुकः लेखनी च\n• अखण्डाध्ययनाय विद्युत्सहायकम्\n\n💡 भवान् लैपटॉपानाम् वेबकैमानाम् विशिष्टानि सिफारिशानि ज्ञातुम् इच्छति वा?`,
      hi: `💻 **LearnILmWorld कक्षाओं के लिए आवश्यक उपकरण:**\n\n**मूलभूत आवश्यकताएं:**\n• वेबकैम वाला कंप्यूटर/लैपटॉप\n• स्थिर इंटरनेट कनेक्शन (न्यूनतम 5 एमबीपीएस)\n• माइक्रोफोन (हेडसेट की सिफारिश की जाती है)\n• आधुनिक वेब ब्राउज़र (क्रोम, फायरफॉक्स, या एज)\n• स्मार्टफोन/टैबलेट (मोबाइल पहुंच के लिए)\n\n**वैकल्पिक लेकिन अनुशंसित:**\n• बेहतर एकाग्रता के लिए शांत वातावरण\n• वीडियो स्पष्टता के लिए अच्छी रोशनी\n• नोट्स लेने के लिए नोटबुक और कलम\n• निर्बाध सीखने के लिए बिजली बैकअप\n\n💡 क्या आप लैपटॉप या वेबकैम के लिए विशिष्ट सिफारिशें चाहेंगे?`,
      fr: `💻 **Équipement requis pour les cours LearnILmWorld:**\n\n**Exigences essentielles:**\n• Ordinateur/Portable avec webcam\n• Connexion Internet stable (minimum 5 Mbps)\n• Microphone (casque recommandé)\n• Navigateur Web moderne (Chrome, Firefox ou Edge)\n• Smartphone/Tablette (pour accès mobile)\n\n**Optionnel mais recommandé:**\n• Environnement calme pour une meilleure concentration\n• Bon éclairage pour la clarté vidéo\n• Carnet et stylo pour prendre des notes\n• Alimentation de secours pour un apprentissage ininterrompu\n\n💡 Souhaitez-vous des recommandations spécifiques pour les ordinateurs portables ou les webcams?`,
      de: `💻 **Erforderliche Ausrüstung für LearnILmWorld-Klassen:**\n\n**Wesentliche Anforderungen:**\n• Computer/Laptop mit Webcam\n• Stabile Internetverbindung (mindestens 5 Mbps)\n• Mikrofon (Headset empfohlen)\n• Moderner Webbrowser (Chrome, Firefox oder Edge)\n• Smartphone/Tablet (für mobilen Zugriff)\n\n**Optional aber empfohlen:**\n• Ruhige Umgebung für bessere Konzentration\n• Gute Beleuchtung für Video Klarheit\n• Notizbuch und Stift für Notizen\n• Strombackup für ununterbrochenes Lernen\n\n💡 Möchten Sie spezifische Empfehlungen für Laptops oder Webcams?`,
      es: `💻 **Equipo requerido para las clases de LearnILmWorld:**\n\n**Requisitos esenciales:**\n• Computadora/Portátil con cámara web\n• Conexión a Internet estable (mínimo 5 Mbps)\n• Micrófono (se recomienda auriculares)\n• Navegador web moderno (Chrome, Firefox o Edge)\n• Teléfono inteligente/Tableta (para acceso móvil)\n\n**Opcional pero recomendado:**\n• Ambiente tranquilo para mejor concentración\n• Buena iluminación para claridad de video\n• Cuaderno y pluma para tomar notas\n• Respaldo de energía para aprendizaje ininterrumpido\n\n💡 ¿Le gustaría recomendaciones específicas para portátiles o cámaras web?`,
      ja: `💻 **LearnILmWorldクラスに必要な機器:**\n\n**必須要件:**\n• Webカメラ付きコンピュータ/ノートパソコン\n• 安定したインターネット接続（最低5 Mbps）\n• マイク（ヘッドセット推奨）\n• 最新のWebブラウザ（Chrome、Firefox、またはEdge）\n• スマートフォン/タブレット（モバイルアクセスのため）\n\n**オプションですが推奨:**\n• 集中力を高めるための静かな環境\n• ビデオの明瞭さのための良好な照明\n• メモ用のノートとペン\n• 中断のない学習のための電源バックアップ\n\n💡 ノートパソコンやWebカメラの具体的な推奨事項を知りたいですか？`
    };
    return answers[language] || answers.en;
  },

  getClassStructureAnswer(language) {
    const answers = {
      en: `📚 **Class Structure at LearnILmWorld:**\n\n**Session Types:**\n• 1-on-1 Personalized Sessions\n• Small Group Classes (2-5 students)\n• Intensive Courses\n• Weekend Batches\n• Crash Courses for exams\n• Project-Based Learning sessions\n\n**Typical Session Flow:**\n1. Revision & Warm-up (5-10 mins)\n2. Concept Explanation with examples (20-30 mins)\n3. Interactive Practice & Exercises (15-20 mins)\n4. Doubt Clearing & Q/A Session (10-15 mins)\n5. Homework Assignment & Next Steps (5 mins)\n\n**Class Duration:**\n• Standard: 60 minutes\n• Intensive: 90-120 minutes\n• Group sessions: 75 minutes\n\n💡 Would you like to know about trial sessions or see a sample class schedule?`,
      sa: `📚 **LearnILmWorld-इत्यस्मिन् कक्षासंरचना:**\n\n**सत्रप्रकाराः:**\n• 1-पर-1 व्यक्तिगतसत्राणि\n• लघुसमूहकक्षाः (२-५ छात्राः)\n• गहनपाठ्यक्रमाः\n• सप्ताहान्तबैचाः\n• परीक्षाणां कृते क्रैशपाठ्यक्रमाः\n• प्रोजेक्ट-आधारितशिक्षणसत्राणि\n\n**विशिष्टसत्रप्रवाहः:**\n१. पुनरावलोकनं तापनञ्च (५-१० मिनटानि)\n२. उदाहरणैः सह अवधारणाविवरणम् (२०-३० मिनटानि)\n३. सहभाग्याभ्यासः व्यायामाश्च (१५-२० मिनटानि)\n४. संदेहनिवारणं प्रश्नोत्तरसत्रञ्च (१०-१५ मिनटानि)\n५. गृहकार्यनियोजनं अग्रिमचरणानि च (५ मिनटानि)\n\n**कक्षाकालः:**\n• मानकः: ६० मिनटानि\n• गहनः: ९०-१२० मिनटानि\n• समूहसत्राणि: ७५ मिनटानि\n\n💡 भवान् परीक्षणसत्राणां विषये ज्ञातुम् इच्छति वा नमूनाकक्षाकार्यक्रमं द्रष्टुम् इच्छति वा?`,
      hi: `📚 **LearnILmWorld में कक्षा संरचना:**\n\n**सत्र प्रकार:**\n• 1-पर-1 व्यक्तिगत सत्र\n• छोटे समूह की कक्षाएं (2-5 छात्र)\n• इंटेंसिव कोर्स\n• वीकेंड बैच\n• परीक्षाओं के लिए क्रैश कोर्स\n• प्रोजेक्ट-आधारित शिक्षण सत्र\n\n**विशिष्ट सत्र प्रवाह:**\n1. संशोधन और वार्म-अप (5-10 मिनट)\n2. उदाहरणों के साथ अवधारणा स्पष्टीकरण (20-30 मिनट)\n3. इंटरैक्टिव अभ्यास और व्यायाम (15-20 मिनट)\n4. संदेह समाधान और प्रश्न/उत्तर सत्र (10-15 मिनट)\n5. होमवर्क असाइनमेंट और अगले चरण (5 मिनट)\n\n**कक्षा अवधि:**\n• मानक: 60 मिनट\n• इंटेंसिव: 90-120 मिनट\n• समूह सत्र: 75 मिनट\n\n💡 क्या आप ट्रायल सत्र के बारे में जानना चाहेंगे या नमूना कक्षा कार्यक्रम देखना चाहेंगे?`,
      fr: `📚 **Structure des cours chez LearnILmWorld:**\n\n**Types de sessions:**\n• Sessions personnalisées 1 à 1\n• Petites classes de groupe (2-5 étudiants)\n• Cours intensifs\n• Lots de week-end\n• Cours accélérés pour examens\n• Sessions d'apprentissage par projet\n\n**Déroulement typique de la session:**\n1. Révision et échauffement (5-10 minutes)\n2. Explication des concepts avec exemples (20-30 minutes)\n3. Pratique interactive et exercices (15-20 minutes)\n4. Clarification des doutes et séance de questions/réponses (10-15 minutes)\n5. Devoir et étapes suivantes (5 minutes)\n\n**Durée des cours:**\n• Standard: 60 minutes\n• Intensif: 90-120 minutes\n• Sessions de groupe: 75 minutes\n\n💡 Souhaitez-vous en savoir plus sur les sessions d'essai ou voir un exemple d'emploi du temps de cours?`,
      de: `📚 **Klassenstruktur bei LearnILmWorld:**\n\n**Sitzungstypen:**\n• 1-zu-1 persönliche Sitzungen\n• Kleine Gruppenklassen (2-5 Schüler)\n• Intensivkurse\n• Wochenendgruppen\n• Crashkurse für Prüfungen\n• Projektbasiertes Lernen Sitzungen\n\n**Typischer Sitzungsablauf:**\n1. Überarbeitung & Aufwärmen (5-10 Minuten)\n2. Konzept Erklärung mit Beispielen (20-30 Minuten)\n3. Interaktive Praxis & Übungen (15-20 Minuten)\n4. Zweifelsklärung & Q/A Sitzung (10-15 Minuten)\n5. Hausaufgaben Zuweisung & nächste Schritte (5 Minuten)\n\n**Klassen Dauer:**\n• Standard: 60 Minuten\n• Intensiv: 90-120 Minuten\n• Gruppensitzungen: 75 Minuten\n\n💡 Möchten Sie etwas über Probestunden erfahren oder einen Beispielstundenplan sehen?`,
      es: `📚 **Estructura de clases en LearnILmWorld:**\n\n**Tipos de sesión:**\n• Sesiones personalizadas 1 a 1\n• Clases de grupos pequeños (2-5 estudiantes)\n• Cursos intensivos\n• Grupos de fin de semana\n• Cursos intensivos para exámenes\n• Sesiones de aprendizaje basado en proyectos\n\n**Flujo típico de sesión:**\n1. Revisión y calentamiento (5-10 minutos)\n2. Explicación de conceptos con ejemplos (20-30 minutos)\n3. Práctica interactiva y ejercicios (15-20 minutos)\n4. Aclaración de dudas y sesión de preguntas/respuestas (10-15 minutos)\n5. Asignación de tareas y próximos pasos (5 minutos)\n\n**Duración de la clase:**\n• Estándar: 60 minutos\n• Intensivo: 90-120 minutos\n• Sesiones grupales: 75 minutos\n\n💡 ¿Le gustaría saber sobre sesiones de prueba o ver un horario de clase de ejemplo?`,
      ja: `📚 **LearnILmWorldのクラス構成:**\n\n**セッションタイプ:**\n• 1対1の個人セッション\n• 少人数グループクラス（2〜5名）\n• 集中コース\n• 週末バッチ\n• 試験のためのクラッシュコース\n• プロジェクトベースの学習セッション\n\n**典型的なセッションフロー:**\n1. 復習とウォームアップ（5〜10分）\n2. 例を用いた概念説明（20〜30分）\n3. インタラクティブ練習と演習（15〜20分）\n4. 疑問解消とQ/Aセッション（10〜15分）\n5. 宿題の割り当てと次のステップ（5分）\n\n**クラス時間:**\n• 標準：60分\n• 集中：90〜120分\n• グループセッション：75分\n\n💡 トライアルセッションについて知りたいですか？それともサンプルのクラススケジュールを見たいですか？`
    };
    return answers[language] || answers.en;
  }
};

// CONVERSATION MEMORY
class ConversationMemory {
  constructor() {
    this.sessions = new Map();
  }

  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        conversationHistory: [],
        userLanguage: 'en',
        currentTopic: null,
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        welcomeShown: false
      });
    }
    return this.sessions.get(sessionId);
  }

  addMessage(sessionId, role, message, isInfoCollection = false) {
    const session = this.getSession(sessionId);
    const messageObj = {
      role,
      message,
      timestamp: new Date(),
      language: session.userLanguage,
      isInfoCollection
    };

    session.conversationHistory.push(messageObj);
    session.lastActivity = new Date();

    if (role === 'user' && !isInfoCollection) {
      session.messageCount++;
    }

    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
    }

    return session;
  }

  setLanguage(sessionId, language) {
    const session = this.getSession(sessionId);
    session.userLanguage = supportedLanguages.includes(language) ? language : 'en';
    return session.userLanguage;
  }

  getRecentHistory(sessionId) {
    const session = this.getSession(sessionId);
    return session.conversationHistory;
  }

  getMessageCount(sessionId) {
    const session = this.getSession(sessionId);
    return session.messageCount;
  }
}

const conversationMemory = new ConversationMemory();

// MONGODB SESSION MANAGER
const MongoDBSessionManager = {
  async getOrCreateSession(sessionId, language = 'en') {
    try {
      const isConnected = await checkMongoDBConnection();
      if (!isConnected) {
        throw new Error('MongoDB is not connected');
      }

      let session = await Chatbot.findOne({ sessionId });

      if (!session) {
        session = new Chatbot({
          sessionId,
          userType: 'guest',
          language,
          conversation: [],
          userContext: {},
          createdAt: new Date(),
          lastActivity: new Date()
        });
        await session.save();
      }

      return session;
    } catch (error) {
      throw new Error(`MongoDB error: ${error.message}`);
    }
  },

  async addMessage(sessionId, role, message, language = 'en', isInfoCollection = false) {
    try {
      const isConnected = await checkMongoDBConnection();
      if (!isConnected) {
        throw new Error('MongoDB is not connected');
      }

      const session = await Chatbot.findOne({ sessionId });
      if (!session) {
        throw new Error(`Session ${sessionId} not found in MongoDB`);
      }

      const messageObj = {
        role,
        message,
        timestamp: new Date(),
        language,
        isInfoCollection
      };

      session.conversation.push(messageObj);
      session.lastActivity = new Date();
      session.language = language;

      await session.save();
      return session;
    } catch (error) {
      throw new Error(`MongoDB error: ${error.message}`);
    }
  },

  async updateUserInfo(sessionId, name, email) {
    try {
      const isConnected = await checkMongoDBConnection();
      if (!isConnected) {
        throw new Error('MongoDB is not connected');
      }

      await Chatbot.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            userName: name,
            userEmail: email,
            infoCollectedAt: new Date()
          }
        }
      );
      return true;
    } catch (error) {
      throw new Error(`MongoDB error: ${error.message}`);
    }
  }
};

// GEMINI SERVICE
const GeminiService = {
  generateResponse: async (message, sessionId, language = 'en') => {
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY is not set in environment variables');
      return {
        success: false,
        error: 'API key not configured',
        response: getFallbackResponse(language, 'api_error')
      };
    }

    try {
      // Get user info for context
      const sessionInfo = smartCollector.getSessionInfo(sessionId);
      const isInfoComplete = smartCollector.isInfoComplete(sessionId);

      if (!isInfoComplete) {
        return {
          success: true,
          response: getFallbackResponse(language, 'not_understood'),
          source: 'fallback'
        };
      }

      const userInfoContext = sessionInfo.name ?
        `User's name: ${sessionInfo.name}. ${sessionInfo.email ? `Email: ${sessionInfo.email}.` : ''}` :
        'User has not provided name.';

      // Replace your current API_ENDPOINTS array with this:
      const API_ENDPOINTS = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
      ];

      const PROMPT = `${userInfoContext}
You are LearnILmWorld's helpful assistant. LearnILmWorld is an online learning platform that offers:
1. Expert trainers and mentors in various subjects
2. Courses and certificates in languages, academics, competitive exams
3. Online classes with flexible scheduling
4. 1-on-1 and group sessions
5. Trial sessions available
6. Certificates provided for completion
7.Ask some question related to the users question and if they want to answer for that question please answer
8. Don't greet for every answer 

User question: "${message}"

Language: ${language}

IMPORTANT: If the user is asking about pricing, courses, trainers, certificates, equipment, or any specific service, give a helpful answer based on typical online learning platforms. If you don't know exact details, provide general information and suggest they contact support for specifics.

Answer in ${language} if possible, otherwise in English.
`;

      let lastError = null;

      // Try each endpoint until one works
      for (const API_URL of API_ENDPOINTS) {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: PROMPT }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topP: 0.8,
                topK: 40
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
              getFallbackResponse(language, 'general');
            return {
              success: true,
              response: answer,
              source: 'gemini_api'
            };
          }

          lastError = new Error(`API error ${response.status}: ${response.statusText}`);

        } catch (endpointError) {
          lastError = endpointError;
          continue; // Try next endpoint
        }
      }

      // If all endpoints fail
      console.error('❌ All Gemini API endpoints failed:', lastError.message);

      // Fallback to direct answers
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('certificate') || lowerMessage.includes('certificat')) {
        return {
          success: true,
          response: DirectAnswers.getCertificateAnswer(language),
          source: 'direct_answer'
        };
      }

      if (lowerMessage.includes('equipment') || lowerMessage.includes('require')) {
        return {
          success: true,
          response: DirectAnswers.getEquipmentAnswer(language),
          source: 'direct_answer'
        };
      }

      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return {
          success: true,
          response: getPricingFallback(language),
          source: 'fallback'
        };
      }

      return {
        success: false,
        error: `All API endpoints failed: ${lastError.message}`,
        response: getFallbackResponse(language, 'general')
      };

    } catch (error) {
      console.error("❌ Gemini service error:", error.message);
      return {
        success: false,
        error: `Service failure: ${error.message}`,
        response: getFallbackResponse(language, 'general')
      };
    }
  }
};

function getPricingFallback(language) {
  const responses = {
    en: `💰 **Pricing at LearnILmWorld:**\n\nOur pricing is flexible and depends on:\n\n**Factors affecting price:**\n• Type of course (language, academic, competitive)\n• Duration and intensity\n• Trainer experience level\n• 1-on-1 vs group sessions\n• Certificate requirements\n\n**Price Range:**\n• Group sessions: $15-$30 per hour\n• 1-on-1 sessions: $25-$60 per hour\n• Package discounts available\n• Monthly subscriptions: $99-$299\n\n**Special Offers:**\n✅ Free trial session available\n✅ Bundle discounts for multiple courses\n✅ Family and group discounts\n✅ Early bird registration discounts\n\n💡 For exact pricing on specific courses, please visit our website or contact our support team for a personalized quote.`,

    hi: `💰 **LearnILmWorld पर मूल्य निर्धारण:**\n\nहमारा मूल्य निर्धारण लचीला है और निर्भर करता है:\n\n**मूल्य को प्रभावित करने वाले कारक:**\n• पाठ्यक्रम का प्रकार (भाषा, शैक्षणिक, प्रतियोगी)\n• अवधि और तीव्रता\n• प्रशिक्षक अनुभव स्तर\n• 1-पर-1 बनाम समूह सत्र\n• प्रमाणपत्र आवश्यकताएं\n\n**मूल्य सीमा:**\n• समूह सत्र: $15-$30 प्रति घंटा\n• 1-पर-1 सत्र: $25-$60 प्रति घंटा\n• पैकेज छूट उपलब्ध\n• मासिक सदस्यता: $99-$299\n\n**विशेष ऑफर:**\n✅ निःशुल्क ट्रायल सत्र उपलब्ध\n✅ एकाधिक पाठ्यक्रमों के लिए बंडल छूट\n✅ परिवार और समूह छूट\n✅ अर्ली बर्ड पंजीकरण छूट\n\n💡 विशिष्ट पाठ्यक्रमों पर सटीक मूल्य के लिए, कृपया हमारी वेबसाइट पर जाएं या व्यक्तिगत उद्धरण के लिए हमारी सहायता टीम से संपर्क करें।`,

    sa: `💰 **LearnILmWorld-प्रशिक्षणमूल्यम्:**\n\nअस्माकं मूल्यं लचिलं भवति तत् च आधारितम् अस्ति:\n\n**मूल्यं प्रभावयन्तः कारकाः:**\n• पाठ्यक्रमप्रकारः (भाषा, शैक्षणिकं, प्रतिस्पर्धात्मकम्)\n• अवधिः तीव्रता च\n• प्रशिक्षकानुभवस्तरः\n• एकैकशिक्षणं समूहशिक्षणं च\n• प्रमाणपत्रावश्यकताः\n\n**मूल्यविस्तारः:**\n• समूहसत्राः: $15-$30 प्रतिघण्टाम्\n• एकैकसत्राः: $25-$60 प्रतिघण्टाम्\n• पैकेजछूटः उपलभ्यते\n• मासिकसदस्यता: $99-$299\n\n**विशेषावसराः:**\n✅ निःशुल्कपरीक्षणसत्रः उपलभ्यते\n✅ बहूनां पाठ्यक्रमाणां बण्डलछूटः\n✅ कुटुम्बसमूहछूटाः\n✅ प्रारम्भिकपंजीकरणछूटाः\n\n💡 विशिष्टपाठ्यक्रमेषु सूक्ष्ममूल्याय, कृपया अस्माकं जालपुटं भ्रमन्तु अथवा व्यक्तिगतमूल्यनिर्धारणाय अस्माकं सहायतादलं सम्पर्कन्तु।`,

    fr: `💰 **Tarification chez LearnILmWorld:**\n\nNotre tarification est flexible et dépend de :\n\n**Facteurs influençant le prix :**\n• Type de cours (langue, académique, compétitif)\n• Durée et intensité\n• Niveau d'expérience du formateur\n• Sessions individuelles vs sessions de groupe\n• Exigences de certificat\n\n**Fourchette de prix :**\n• Sessions de groupe : 15 $ - 30 $ par heure\n• Sessions individuelles : 25 $ - 60 $ par heure\n• Remises sur forfaits disponibles\n• Abonnements mensuels : 99 $ - 299 $\n\n**Offres spéciales :**\n✅ Session d'essai gratuite disponible\n✅ Remises groupées pour plusieurs cours\n✅ Remises famille et groupe\n✅ Remises pour inscription anticipée\n\n💡 Pour un tarif exact sur des cours spécifiques, veuillez visiter notre site Web ou contacter notre équipe d'assistance pour un devis personnalisé.`,

    de: `💰 **Preise bei LearnILmWorld:**\n\nUnsere Preisgestaltung ist flexibel und hängt ab von:\n\n**Faktoren, die den Preis beeinflussen:**\n• Art des Kurses (Sprache, akademisch, wettbewerbsorientiert)\n• Dauer und Intensität\n• Erfahrungsniveau des Trainers\n• Einzel- vs. Gruppensitzungen\n• Zertifikatsanforderungen\n\n**Preisspanne:**\n• Gruppensitzungen: 15 $ - 30 $ pro Stunde\n• Einzelsitzungen: 25 $ - 60 $ pro Stunde\n• Paketrabatte verfügbar\n• Monatliche Abonnements: 99 $ - 299 $\n\n**Sonderangebote:**\n✅ Kostenlose Probestunde verfügbar\n✅ Bündelrabatte für mehrere Kurse\n✅ Familien- und Gruppenrabatte\n✅ Frühbucherrabatte\n\n💡 Für genaue Preise zu bestimmten Kursen besuchen Sie bitte unsere Website oder kontaktieren Sie unser Support-Team für ein persönliches Angebot.`,

    es: `💰 **Precios en LearnILmWorld:**\n\nNuestros precios son flexibles y dependen de:\n\n**Factores que afectan el precio:**\n• Tipo de curso (idiomas, académico, competitivo)\n• Duración e intensidad\n• Nivel de experiencia del instructor\n• Sesiones individuales vs grupales\n• Requisitos de certificado\n\n**Rango de precios:**\n• Sesiones grupales: $15-$30 por hora\n• Sesiones individuales: $25-$60 por hora\n• Descuentos por paquetes disponibles\n• Suscripciones mensuales: $99-$299\n\n**Ofertas especiales:**\n✅ Sesión de prueba gratuita disponible\n✅ Descuentos por paquetes múltiples\n✅ Descuentos familiares y grupales\n✅ Descuentos por registro anticipado\n\n💡 Para precios exactos en cursos específicos, visite nuestro sitio web o contacte a nuestro equipo de soporte para una cotización personalizada.`,

    ja: `💰 **LearnILmWorldの料金体系:**\n\n当社の料金は柔軟で、以下の要素によって異なります：\n\n**料金に影響する要因：**\n• コースの種類（言語、学術、競争対策）\n• 期間と集中度\n• 講師の経験レベル\n• 個人レッスン対グループレッスン\n• 証明書の要件\n\n**料金範囲：**\n• グループレッスン：1時間あたり15〜30ドル\n• 個人レッスン：1時間あたり25〜60ドル\n• パッケージ割引あり\n• 月額サブスクリプション：99〜299ドル\n\n**特別オファー：**\n✅ 無料体験レッスンあり\n✅ 複数コースのバンドル割引\n✅ 家族・グループ割引\n✅ 早期登録割引\n\n💡 特定のコースの正確な料金については、当社のウェブサイトをご覧いただくか、カスタマイズされた見積もりについてはサポートチームまでお問い合わせください。`
  };

  return responses[language] || responses.en;
}

// ROUTES - FIXED
router.post('/start', async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const sessionId = `learnilm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const welcomeMessage = WelcomeMessages.getConversationalWelcome(language);

    smartCollector.getSession(sessionId);
    conversationMemory.setLanguage(sessionId, language);
    conversationMemory.addMessage(sessionId, 'assistant', welcomeMessage, true);

    try {
      const isConnected = await checkMongoDBConnection();
      if (isConnected) {
        await MongoDBSessionManager.getOrCreateSession(sessionId, language);
        await MongoDBSessionManager.addMessage(sessionId, 'assistant', welcomeMessage, language, true);
      }
    } catch (mongoError) {
      console.warn('MongoDB save warning:', mongoError.message);
    }

    return res.status(200).json({
      success: true,
      sessionId,
      reply: welcomeMessage,
      step: 'ask_name',
      conversation: [{ role: 'assistant', message: welcomeMessage, timestamp: new Date() }]
    });
  } catch (error) {
    console.error('START ERROR:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start chat'
    });
  }
});

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, language = 'en' } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and message are required'
      });
    }

    conversationMemory.setLanguage(sessionId, language);

    // Process with smart collector
    const infoResult = smartCollector.processMessage(sessionId, message, language);

    let reply = '';
    let step = infoResult.step;
    let collectedInfo = infoResult.collected || {};
    let infoComplete = smartCollector.isInfoComplete(sessionId);

    // If info collection is still in progress
    if (!infoComplete) {
      reply = infoResult.response;


      // If we collected name and email, mark as complete
      if (collectedInfo.name && collectedInfo.email) {
        infoComplete = true;
        step = 'complete';

        try {
          const isConnected = await checkMongoDBConnection();
          if (isConnected) {
            await MongoDBSessionManager.updateUserInfo(sessionId, collectedInfo.name, collectedInfo.email);
          }
        } catch (mongoError) {
          console.warn('MongoDB user info save warning:', mongoError.message);
        }
      }
    }
    // If info collection is complete, use Gemini for responses
    else {
      const geminiResult = await GeminiService.generateResponse(
        message,
        sessionId,
        language
      );
      reply = geminiResult.response;
    }

    // Add to conversation memory
    conversationMemory.addMessage(sessionId, 'user', message, !infoComplete);
    conversationMemory.addMessage(sessionId, 'assistant', reply, !infoComplete);

    // Save to MongoDB if connected
    try {
      const isConnected = await checkMongoDBConnection();
      if (isConnected) {
        await MongoDBSessionManager.addMessage(sessionId, 'user', message, language, !infoComplete);
        await MongoDBSessionManager.addMessage(sessionId, 'assistant', reply, language, !infoComplete);

        if (collectedInfo.name && collectedInfo.email) {
          await MongoDBSessionManager.updateUserInfo(sessionId, collectedInfo.name, collectedInfo.email);
        }
      }
    } catch (mongoError) {
      console.warn('MongoDB message save warning:', mongoError.message);
    }

    const sessionInfo = smartCollector.getSessionInfo(sessionId);

    return res.status(200).json({
      success: true,
      reply,
      step,
      infoComplete,
      showSuggestions: infoComplete === true,   // ✅ ADD THIS
      userInfo: {
        name: sessionInfo.name,
        email: sessionInfo.email
      },
      conversation: conversationMemory.getRecentHistory(sessionId)
    });

  } catch (error) {
    console.error('MESSAGE ERROR:', error);
    return res.status(500).json({
      success: false,
      error: 'Message processing failed',
      reply: getFallbackResponse(req.body.language || 'en', 'error')
    });
  }
});

router.post('/validate-info', (req, res) => {
  try {
    const { name, email } = req.body;

    const isValidName = (name) => {
      if (!name || typeof name !== 'string') return false;
      const trimmedName = name.trim();
      return trimmedName.length >= 2 &&
        trimmedName.length <= 50 &&
        /^[a-zA-Z\s\u00C0-\u017F\u0900-\u097F]+$/.test(trimmedName);
    };

    const isValidEmail = (email) => {
      if (!email || typeof email !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    const validation = {
      name: {
        isValid: isValidName(name),
        message: isValidName(name) ? 'Valid name' : 'Please enter a valid name (2-50 characters, letters only)'
      },
      email: {
        isValid: isValidEmail(email),
        message: isValidEmail(email) ? 'Valid email' : 'Please enter a valid email address'
      }
    };

    res.json({
      success: true,
      validation,
      allValid: validation.name.isValid && validation.email.isValid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
});

router.get('/user-info/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const session = smartCollector.getSession(sessionId);

  if (!session) {
    return res.status(200).json({
      exists: false,
      userInfo: null
    });
  }

  return res.status(200).json({
    exists: true,
    userInfo: {
      name: session.name || null,
      email: session.email || null
    }
  });
});

router.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  smartCollector.resetSession(sessionId);
  res.json({ success: true });
});

export default router;