"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, Sparkles, X, Send, Phone, MessageCircle, 
  Wrench, HelpCircle, Search, ShoppingBag, ArrowRight, BookOpen, Mic, MicOff 
} from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en', 'hi', 'mr'
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Show tooltip after 3.5s if chat is closed
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Localization resources
  const t = {
    en: {
      botName: "Saraswati AI Assistant",
      greeting: "Hello! I am your Saraswati Sangeet Vadhyalaya guide. How can I help you today?",
      placeholder: "Ask about instrument prices, bag sizes, or contact...",
      send: "Send",
      btnPrices: "🔍 Find Product Prices",
      btnBags: "📏 Bag & Instrument Sizes",
      btnContact: "📞 WhatsApp & Call Store",
      btnRepairs: "🛠️ Track Repairs",
      loading: "Searching catalog...",
      noProductFound: "I couldn't find any matching instruments in our catalog. You can inquire directly on WhatsApp for customized orders!",
      priceReply: "Here are the matching instruments from our catalog:",
      contactReply: "You can reach out to us directly:\n\n💬 **WhatsApp Support:** +91 85912 23874 (Yash)\n📞 **Phone Calls:**\n• Dinesh (Owner): +91 98213 60536\n• Manisha: +91 98339 91547\n• Yash: +91 85912 23874\n📍 **Store Location:** SSV Store, Malad East, Mumbai",
      repairReply: "To track repairs, go to your **Account Dashboard -> Orders & Repairs** or visit the `/repair` page to check by ticket ID.",
      bagReply: "Here are standard instrument measurements for buying bags/covers:\n\n• **Scale Changer Harmonium:** `24\" x 13\" x 8\"` (Requires Large Padded Bag)\n• **Standard Harmonium (2.5 Octave):** `22\" x 12\" x 7\"` (Medium Bag)\n• **Standard Treble Tabla (wooden):** Head `5\" to 5.75\"`, Height `10.5\"`\n• **Standard Bass Dagga (metal):** Head `9\" to 9.5\"`, Height `10.5\"`\n• **Dholak:** Length `21\"`, Bass Head `9\"`, Treble Head `7\"`\n• **Guitar:** 39\" (Acoustic Standard) or 41\" (Dreadnought Standard)\n\nWe sell custom padded bags for all these instruments! Ask us about prices.",
      quickRepairs: "🛠️ Repairs Status",
      quickBags: "📏 Instrument Dimensions"
    },
    hi: {
      botName: "सरस्वती एआई सहायक",
      greeting: "नमस्ते! मैं सरस्वती संगीत वाद्यालय का मार्गदर्शक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      placeholder: "कीमतों, बैग के साइज़ या स्टोर से संपर्क के बारे में पूछें...",
      send: "भेजें",
      btnPrices: "🔍 उत्पाद की कीमतें",
      btnBags: "📏 बैग और वाद्य यंत्र का आकार",
      btnContact: "📞 स्टोर से संपर्क करें",
      btnRepairs: "🛠️ मरम्मत की स्थिति",
      loading: "कैटलॉग खोजा जा रहा है...",
      noProductFound: "मुझे कैटलॉग में कोई मेल खाता वाद्य यंत्र नहीं मिला। आप कस्टमाइज़्ड ऑर्डर के लिए सीधे व्हाट्सएप पर पूछ सकते हैं!",
      priceReply: "हमारे कैटलॉग से मेल खाते उत्पाद यहाँ हैं:",
      contactReply: "आप हमसे सीधे संपर्क कर सकते हैं:\n\n💬 **व्हाट्सएप सपोर्ट:** +91 85912 23874 (यश)\n📞 **फ़ोन कॉल:**\n• दिनेश (मालिक): +91 98213 60536\n• मनीषा: +91 98339 91547\n• यश: +91 85912 23874\n📍 **स्टोर पता:** एसएसवी स्टोर, मलाड ईस्ट, मुंबई",
      repairReply: "मरम्मत ट्रैक करने के लिए, अपने **अकाउंट डैशबोर्ड -> मरम्मत इतिहास** पर जाएं या टिकट आईडी से जांचने के लिए `/repair` पेज पर जाएं।",
      bagReply: "बैग/कवर खरीदने के लिए संगीत वाद्यों के मानक माप:\n\n• **स्केल चेंजर हारमोनियम:** `24\" x 13\" x 8\"` (बड़ा गद्देदार बैग)\n• **मानक हारमोनियम:** `22\" x 12\" x 7\"` (मध्यम बैग)\n• **मानक तबला (दायाँ):** हेड `5\" से 5.75\"`, ऊंचाई `10.5\"`\n• **मानक डग्गा (बायाँ):** हेड `9\" से 9.5\"`, ऊंचाई `10.5\"`\n• **ढोलक:** लंबाई `21\"`, बायाँ हिस्सा `9\"`, दायाँ हिस्सा `7\"`\n• **गिटार:** 39\" (मानक एकोस्टिक) या 41\" (मानक ड्रेडनॉट)\n\nहम इन सभी वाद्यों के लिए विशेष गद्देदार बैग बेचते हैं! कीमत जानने के लिए पूछें।",
      quickRepairs: "🛠️ मरम्मत",
      quickBags: "📏 वाद्यों का आकार"
    },
    mr: {
      botName: "सरस्वती एआय सहाय्यक",
      greeting: "नमस्कार! मी सरस्वती संगीत वाद्यालयाचा सहाय्यक आहे. आज मी तुम्हाला काय मदत करू शकतो?",
      placeholder: "किमती, बॅगचे आकार किंवा संपर्काविषयी विचारा...",
      send: "पाठवा",
      btnPrices: "🔍 किमती शोधा",
      btnBags: "📏 बॅग आणि वाद्यांचे आकार",
      btnContact: "📞 थेट संपर्क साधा",
      btnRepairs: "🛠️ दुरुस्तीची स्थिती",
      loading: "कॅटलॉग शोधत आहे...",
      noProductFound: "आमच्या कॅटलॉगमध्ये जुळणारे कोणतेही वाद्य सापडले नाही. आपण सानुकूलित वाद्यांसाठी थेट व्हॉट्सॲपवर चौकशी करू शकता!",
      priceReply: "आमच्या कॅटलॉग मधील जुळणारी वाद्ये खालीलप्रमाणे आहेत:",
      contactReply: "आपण आमच्याशी थेट संपर्क साधू शकता:\n\n💬 **व्हॉट्सॲप सपोर्ट:** +91 85912 23874 (यश)\n📞 **फोन कॉल:**\n• दिनेश (मालक): +91 98213 60536\n• मनीषा: +91 98339 91547\n• यश: +91 85912 23874\n📍 **स्टोअर पत्ता:** एसएसव्ही स्टोअर, मालाड पूर्व, मुंबई",
      repairReply: "दुरुस्तीचा मागोवा घेण्यासाठी, आपल्या **अकाउंट डॅशबोर्ड -> दुरुस्ती इतिहास** वर जा किंवा तिकीट आयडीने तपासण्यासाठी `/repair` पेजला भेट द्या.",
      bagReply: "बॅग/कव्हर खरेदी करण्यासाठी वाद्यांची प्रमाणित मोजमापे:\n\n• **स्केल चेंजर हार्मोनियम:** `24\" x 13\" x 8\"` (मोठी पॅडेड बॅग)\n• **प्रमाणित हार्मोनियम:** `22\" x 12\" x 7\"` (मध्यम बॅग)\n• **प्रमाणित तबला (उजवा):** हेड `5\" ते 5.75\"`, उंची `10.5\"`\n• **प्रमाणित डग्गा (बावा):** हेड `9\" ते 9.5\"`, उंची `10.5\"`\n• **ढोलक:** लांबी `21\"`, बावा `9\"`, उजवा `7\"`\n• **गिटार:** 39\" (प्रमाणित अकौस्टिक) किंवा 41\" (प्रमाणित ड्रेडनॉट)\n\nआम्ही या सर्व वाद्यांसाठी सानुकूल पॅडेड बॅग विकतो! किमती विचारू शकता.",
      quickRepairs: "🛠️ दुरुस्ती स्थिती",
      quickBags: "📏 वाद्यांची मोजमापे"
    }
  };

  useEffect(() => {
    // Add default greeting on mount
    setMessages([
      { id: 1, sender: 'bot', text: t[language].greeting }
    ]);
  }, [language]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Google Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map selected language to SpeechRecognition locale
    if (language === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (language === 'mr') {
      recognition.lang = 'mr-IN';
    } else {
      recognition.lang = 'en-US';
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const reply = await processResponse(query.toLowerCase());
    setMessages(prev => [...prev, reply]);
    setLoading(false);
  };

  const processResponse = async (lowerText) => {
    // 1. Handle Price / Cost inquiries first (query Supabase catalog)
    const isPriceInquiry = ["price", "cost", "how much", "rate", "price list", "किंमत", "भाव", "दर", "कितने", "रुपये"].some(kw => lowerText.includes(kw));
    
    if (isPriceInquiry) {
      try {
        const stopwords = [
          "price", "cost", "how much", "find", "search", "show", "of", "the", "for", "in", "vadhyalaya", "rate", "whats the", "what is", "whats", "what's", "is",
          "किंमत", "भाव", "दर", "दाखवा", "दाखव", "कुठे", "मिळेल", "कितने", "का", "है", "बताओ", "का", "की", "कााय", "किती"
        ];
        
        const devanagariMapping = {
          "हारमोनियम": "harmonium",
          "हार्मोनियम": "harmonium",
          "तबला": "tabla",
          "डग्गा": "dagga",
          "डगा": "dagga",
          "ढोलक": "dholak",
          "ढोलकी": "dholki",
          "गिटार": "guitar",
          "ड्रम": "drum",
          "ड्रम्स": "drum",
          "कांगो": "congo",
          "बासुरी": "flute",
          "बांसुरी": "flute",
          "फ्लूट": "flute",
          "तास": "tasha",
          "ताशा": "tasha",
          "पखावज": "pakhawaj",
          "सतार": "sitar",
          "सितार": "sitar",
          "तानपुरा": "tanpura",
          "स्ट्रिंग्स": "strings",
          "स्ट्रिंग": "strings",
          "तारी": "strings",
          "स्टिक्स": "sticks",
          "स्टिक": "sticks",
          "काठी": "sticks"
        };
        
        let queryText = lowerText;
        
        // Translate Devanagari terms to English
        Object.keys(devanagariMapping).forEach(key => {
          queryText = queryText.replace(new RegExp(key, 'g'), devanagariMapping[key]);
        });
        
        // Remove stopwords
        stopwords.forEach(word => {
          queryText = queryText.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        
        // Clean special characters
        queryText = queryText.replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

        // Split by whitespace
        const words = queryText.split(/\s+/).filter(w => w.length > 0);

        if (words.length > 0) {
          let dbQuery = supabase
            .from('products')
            .select('name, price, image_url, category, id')
            .eq('is_available', true);
            
          words.forEach(word => {
            dbQuery = dbQuery.ilike('name', `%${word}%`);
          });

          const { data, error } = await dbQuery;

          if (!error && data && data.length > 0) {
            const productList = data.map(p => 
              `• **${p.name}** (${p.category}): **₹${p.price.toLocaleString()}**`
            ).join('\n');
            
            return { 
              id: Date.now() + 1, 
              sender: 'bot', 
              text: `${t[language].priceReply}\n\n${productList}\n\n🛒 [Shop Catalog](/shop) • 💬 [Order on WhatsApp](https://wa.me/918591223874?text=${encodeURIComponent(`Hi, inquiring about: ${data[0].name}`)}`
            };
          }
        }
      } catch (e) {
        console.error("Local catalog search failed:", e);
      }
      
      // Fallback if price was asked but product was not found in database
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: `I couldn't find that product in our listed catalog, or it is currently unavailable. Please contact us directly! WhatsApp Yash at +91 85912 23874, or call Dinesh (Owner) at +91 98213 60536 or Manisha at +91 98339 91547 to get customized prices, wholesale rates, or place custom orders!`
      };
    }

    // 2. Attempt backend Gemini query for general questions
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lowerText, language })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return { id: Date.now() + 1, sender: 'bot', text: data.reply };
        }
      }
    } catch (e) {
      console.warn("Backend chat API failed. Using local rule-based engine.", e);
    }

    // Intent Keywords in English, Hindi, and Marathi
    const loginKeywords = [
      "login", "sign in", "sign in", "sign up", "password", "forgot", "account", "register", "otp", "credentials", "supabase", "auth",
      "लॉगिन", "साइन", "पासवर्ड", "पासवर्ड", "खाते", "नवीन", "ओटीपी", "अकाउंट", "नोंदणी"
    ];
    
    const variantKeywords = [
      "variant", "click", "button", "select", "option", "image", "clickable", "dropdown", "model",
      "पर्याय", "बटन", "क्लिक", "चित्र", "ऑप्शन", "व्हेरिएंट", "व्हेरियंट", "मॉडल"
    ];

    const checkoutKeywords = [
      "cart", "checkout", "redirect", "buy", "pay", "payment", "confirm", "loop", "error", "shipping",
      "खरेदी", "पेमेंट", "कार्ट", "चेकアウト", "पैसे", "डिलिव्हरी", "शिपिंग", "ऑर्डर", "कन्फर्म"
    ];

    const trackingKeywords = [
      "track", "order", "status", "edit", "cancel", "pending", "confirmed", "rejected", "delivery", "carrier", "dtdc",
      "ऑर्डर", "स्थिती", "ट्रॅक", "बदल", "रद्द", "डिलिव्हरी", "कुरियर", "स्टेटस", "पेन्डिंग"
    ];

    const repairKeywords = [
      "repair", "tuning", "fix", "estimate", "cost", "ticket", "invoice", "instrument",
      "दुरुस्ती", "ट्यूनिंग", "खराब", "दुरुस्त", "रिपेअर", "बिघाड", "टिकट", "दुरुस्त", "दुरुस्त", "दुरुस्ती", "वाद्य"
    ];

    const contactKeywords = [
      "call", "phone", "contact", "whatsapp", "owner", "number", "support",
      "नंबर", "फोन", "संपर्क", "पत्ता", "व्हॉट्सॲप", "व्हाट्सएप", "मदत"
    ];

    const bagKeywords = [
      "size", "measurement", "bag", "cover", "dimensions", "length", "width", "padded",
      "मोजमाप", "आकार", "बॅग", "लांबी", "रुंदी", "माप", "डायमेंशन", "कपडा", "कव्हर", "मापे"
    ];

    // Response Localization Resources
    const replies = {
      en: {
        login: "🔐 **Login:** To log in using a 10-digit mobile number, use: `[mobile]@phone.ssvstore.com`. Reset passwords via the **Forgot?** link on the `/account` page.",
        variant: "📏 **Variants:** Variant buttons now include miniature image previews inside them. Clicking a variant button updates the product price.",
        checkout: "🛒 **Cart & Checkout:** The cart is separate at `/cart` and does not redirect. To check out, you must log in using the inline form.",
        tracking: "📦 **Orders:** You can edit item quantity or remove products on the `/track` page while the status is **Pending**. Once **Confirmed**, edits are disabled.",
        repair: "🛠 **Repairs:** Submit repairs at `/repair`. They sync to `/account` under Orders & Repairs. Click **View Specs & Cost** for details.",
        general: "Please ask a specific question about prices, sizes, repairs, checkouts, or contacts."
      },
      hi: {
        login: "🔐 **लॉगिन:** मोबाइल नंबर से लॉगिन के लिए इस्तेमाल करें: `[mobile]@phone.ssvstore.com`। पासवर्ड बदलने के लिए अकाउंट पेज पर **Forgot?** का उपयोग करें।",
        variant: "📏 **वेरिएंट:** वेरिएंट बटनों में सीधे उनके अंदर छोटी इमेज शामिल हैं। वेरिएंट पर क्लिक करने से कीमत अपडेट हो जाती है।",
        checkout: "🛒 **कार्ट & चेकआउट:** कार्ट `/cart` पर है और रिडायरेक्ट नहीं होता। चेकआउट के लिए लॉगिन करना अनिवार्य है।",
        tracking: "📦 **ऑर्डर:** ऑर्डर **Pending** रहने तक आप `/track` पेज पर मात्रा बदल सकते हैं या उत्पाद हटा सकते हैं। **Confirmed** होने के बाद बदलाव बंद हो जाते हैं।",
        repair: "🛠 **मरम्मत:** मरम्मत `/repair` पर दर्ज करें। यह `/account` पर सिंक हो जाता है। विवरण के लिए **View Specs & Cost** पर क्लिक करें।",
        general: "कृपया कीमतों, आकार, मरम्मत, चेकआउट या संपर्कों के बारे में विशिष्ट प्रश्न पूछें।"
      },
      mr: {
        login: "🔐 **लॉगिन:** मोबाईलने लॉगिन करण्यासाठी: `[mobile]@phone.ssvstore.com` वापरा. पासवर्ड बदलण्यासाठी अकाउंट पेजवरील **Forgot?** चा वापर करा.",
        variant: "📏 **व्हेरिएंट:** व्हेरिएंट बटणांमध्ये आता थेट लहान फोटो समाविष्ट आहेत. व्हेरिएंटवर क्लिक केल्यावर किंमत अपडेट होते.",
        checkout: "🛒 **कार्ट & चेकआउट:** कार्ट आता स्वतंत्रपणे `/cart` वर आहे. चेकआउटसाठी लॉगिन करणे आवश्यक आहे.",
        tracking: "📦 **ऑर्डर:** ऑर्डर **Pending** असेपर्यंत आपण `/track` वर बदल करू शकता. **Confirmed** झाल्यावर बदल बंद होतात.",
        repair: "🛠 **दुरुस्ती:** दुरुस्ती तिकीट `/repair` वर नोंदवा. ते `/account` वर दिसते. माहितीसाठी **View Specs & Cost** वर क्लिक करा.",
        general: "कृपया किमती, मोजमाप, दुरुस्ती, चेकआउट किंवा संपर्कांविषयी विशिष्ट प्रश्न विचारा."
      }
    };

    const currentReplies = replies[language];

    // 1. Resolve Login Issues
    if (loginKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: currentReplies.login };
    }

    // 2. Resolve Variant Click Issues
    if (variantKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: currentReplies.variant };
    }

    // 3. Resolve Checkout / Redirect issues
    if (checkoutKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: currentReplies.checkout };
    }

    // 4. Resolve Order Tracking / Courier Issues
    if (trackingKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: currentReplies.tracking };
    }

    // 5. Resolve Repair estimates / ticket Issues
    if (repairKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: currentReplies.repair };
    }

    // 6. Resolve Direct Contacts
    if (contactKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: t[language].contactReply };
    }

    // 7. Resolve Bag Measurements
    if (bagKeywords.some(kw => lowerText.includes(kw))) {
      return { id: Date.now() + 1, sender: 'bot', text: t[language].bagReply };
    }

    // 9. Conversational Fallback
    return { id: Date.now() + 1, sender: 'bot', text: currentReplies.general };
  };

  const formatText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('[')) {
        const titleMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (titleMatch && urlMatch) {
          return <a key={i} href={urlMatch[1]} className="text-blue-600 underline font-medium hover:text-[#C5A028]" target={urlMatch[1].startsWith('/') ? '_self' : '_blank'}>{titleMatch[1]}</a>;
        }
      } else if (part.startsWith('http')) {
        return <a key={i} href={part} className="text-blue-600 underline font-medium hover:text-[#C5A028]" target="_blank">{part}</a>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  return (
    <>
      {/* Floating speech bubble tooltip */}
      {!isOpen && showTooltip && (
        <div className="fixed bottom-8 right-24 z-40 bg-[#FAF9F5] border border-[#E2DDD5] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 max-w-xs text-[#2C1F1F]">
          <div className="w-8 h-8 rounded-full bg-[#C5A028]/10 text-[#C5A028] flex items-center justify-center shrink-0 border border-[#C5A028]/20 animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#C5A028]">Saraswati AI</p>
            <p className="text-[11px] text-[#6E6262] mt-0.5 leading-tight font-medium">Need help? You can chat with our AI assistant here!</p>
          </div>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-[#8C7E7E] hover:text-[#2C1F1F] p-0.5 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Tooltip triangle indicator */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FAF9F5] border-r border-t border-[#E2DDD5] rotate-45"></div>
        </div>
      )}

      {/* Floating launcher Button */}
      <button 
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-tr from-[#2C1F1F] via-[#C5A028] to-[#2C1F1F] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 border border-[#E2DDD5]/20 animate-pulse hover:animate-none"
        title="Saraswati AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat window drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[500px] bg-[#FAF9F5] border border-[#E2DDD5] rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#2C1F1F] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#2C1F1F] text-white flex items-center justify-between border-b border-[#E2DDD5]/10 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A028] animate-spin duration-300" />
              <div>
                <h3 className="text-sm font-black tracking-tight">{t[language].botName}</h3>
                <span className="text-[9px] text-[#C5A028] font-bold uppercase tracking-wider">Online guide</span>
              </div>
            </div>

            {/* Language Selector toggles */}
            <div className="flex items-center gap-1.5 bg-black/25 px-2 py-1 rounded-xl text-[10px] font-bold">
              <button onClick={() => setLanguage('en')} className={`px-1.5 py-0.5 rounded transition ${language === 'en' ? 'bg-[#C5A028] text-white' : 'text-gray-300'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-1.5 py-0.5 rounded transition ${language === 'hi' ? 'bg-[#C5A028] text-white' : 'text-gray-300'}`}>हिं</button>
              <button onClick={() => setLanguage('mr')} className={`px-1.5 py-0.5 rounded transition ${language === 'mr' ? 'bg-[#C5A028] text-white' : 'text-gray-300'}`}>मरा</button>
            </div>
          </div>

          {/* Messages content body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user' 
                    ? 'bg-[#C5A028] text-white rounded-tr-none' 
                    : 'bg-white border border-[#E2DDD5] text-[#2C1F1F] rounded-tl-none shadow-sm'
                }`}>
                  {formatText(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E2DDD5] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-[#8C7E7E] flex items-center gap-2 font-mono tracking-widest animate-pulse uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A028] animate-bounce"></span>
                  {t[language].loading}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick preset trigger buttons */}
          <div className="px-4 py-2 border-t border-[#EAE6DF] flex flex-wrap gap-1.5 bg-[#FAF9F5] shrink-0">
            <button 
              onClick={() => handleSend(t[language].btnPrices)}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-[#6E6262] hover:text-[#C5A028] transition"
            >
              🔍 Prices
            </button>
            <button 
              onClick={() => handleSend(t[language].btnBags)}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-[#6E6262] hover:text-[#C5A028] transition"
            >
              📏 Sizes
            </button>
            <button 
              onClick={() => handleSend(t[language].btnContact)}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-[#6E6262] hover:text-[#C5A028] transition"
            >
              📞 Support
            </button>
            <button 
              onClick={() => handleSend(t[language].btnRepairs)}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-[#6E6262] hover:text-[#C5A028] transition"
            >
              🛠️ Track Repairs
            </button>
          </div>

          {/* Message input footer form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-[#EAE6DF] bg-white flex gap-2 shrink-0 items-center"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : t[language].placeholder}
              disabled={isListening}
              className="flex-1 px-4 py-2 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs focus:bg-white outline-none focus:border-[#C5A028] text-[#2C1F1F] placeholder-[#8C7E7E] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-[#FAF9F5] border border-[#E2DDD5] text-[#6E6262] hover:text-[#C5A028] hover:bg-white'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              type="submit"
              disabled={!inputText.trim() || isListening}
              className="w-8 h-8 rounded-lg bg-[#C5A028] hover:bg-[#A98920] disabled:opacity-50 text-white flex items-center justify-center transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
