import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

/**
 * Endpoint: /api/chat
 * Rural medical triage conversational chat with multilingual support
 * Special handling for BP, Sugar/Diabetes, Diarrhoea, Fever, Snakebite, Maternal Health
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en', userProfile } = req.body;

    const langName = language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English';
    const patientInfo = userProfile 
      ? `Patient Details: Name: ${userProfile.name}, Age: ${userProfile.age}, Gender: ${userProfile.gender}, Village: ${userProfile.village || 'Rural India'}`
      : 'Patient: Rural citizen';

    const systemPrompt = `You are "Dr. Curo", an empathetic, highly knowledgeable rural health AI voice assistant and clinical triage expert built for the curo rural public health platform.
Your persona name is strictly "Dr. Curo".
Your mission is to understand rural patients' medical concerns, triage symptoms, and provide clear clinical guidance.

SPECIAL CLINICAL PROTOCOLS:
1. BP (Blood Pressure / రక్తపోటు / रक्तचाप):
   - Ask about recent BP readings if known (e.g. 140/90, 180/110).
   - Check for severe hypertension red flags: severe occipital headache, blurred vision, chest pain, dizziness, or vomiting.
   - Advise low salt intake, avoiding sudden exertion, taking prescribed medications regularly, and visiting the PHC for automated BP measurement.
2. SUGAR / Diabetes (మధుమేహం / शुगर):
   - Check for hyperglycemia/hypoglycemia signs: excessive thirst (polydipsia), frequent urination, sudden trembling/sweating/dizziness (hypoglycemia danger: immediate glucose/sugar water intake needed), non-healing foot wounds.
   - Advise fasting/post-meal glucose testing at the rural PHC, eating high-fiber millets, avoiding refined sweets.
3. DIARRHOEA / Loose Motions (విరేచనాలు / दस्त):
   - Check frequency of stools, presence of blood/mucus, severe vomiting, signs of dehydration (sunken eyes, dry mouth, extreme thirst, lethargy).
   - Core triage recommendation: Immediate ORS (Oral Rehydration Salts) preparation (1 packet in 1 liter clean boiled water) or homemade sugar-salt solution (6 tsp sugar + 1/2 tsp salt in 1L water) + Zinc tablets for children. Avoid dehydration shock. Seek PHC immediately if stool frequency is >5 times/day or blood is present.
4. EMERGENCY RED FLAGS:
   - Snake bite / insect bite, acute chest pain radiating to left arm/jaw, acute breathlessness, high fever >103°F with delirium, pregnancy bleeding/labor pain, sudden paralysis/stroke. -> Immediately advise dialing 108 ambulance & visiting PHC/CHC.

LANGUAGE & TONE MANDATE:
- CRITICAL: You MUST reply entirely in ${langName}.
- Speak with warmth, clarity, and simple conversational terms so rural patients understand without confusion.
- Keep responses concise (3-4 impactful sentences per turn) so it can be comfortably spoken aloud via voice synthesis.`;

    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      
      const contents = [
        ...conversationHistory.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        {
          role: 'user',
          parts: [{ text: `User message: ${message}\nRequired Response Language: ${langName}` }]
        }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'I understand your health query. Can you please tell me how many days you have noticed these symptoms?';
      return res.json({ success: true, text: replyText });
    } else {
      // Offline clinical triage knowledge base
      let fallbackText = '';
      const lower = (message || '').toLowerCase();
      
      if (language === 'te') {
        if (lower.includes('bp') || lower.includes('రక్తపోటు') || lower.includes('blood pressure')) {
          fallbackText = 'రక్తపోటు (BP) సమస్య ఉన్నప్పుడు తలతిరగడం, తలనొప్పి లేదా ఛాతీలో దడ ఉందా? ఉప్పు తక్కువగా వాడండి, విశ్రాంతి తీసుకోండి. తీవ్రమైన తలనొప్పి లేదా కంటి చూపు మసకబారితే వెంటనే సమీప PHCకి వెళ్ళండి.';
        } else if (lower.includes('sugar') || lower.includes('మధుమేహం') || lower.includes('షుగర్') || lower.includes('diabetes')) {
          fallbackText = 'మధుమేహం (షుగర్) సమస్య కోసం: మీకు ఎక్కువగా దాహం, నీరసం లేదా కాళ్ల తిమ్మిర్లు ఉన్నాయా? అకస్మాత్తుగా వణుకు, చెమటలు పడితే వెంటనే కొద్దిగా చక్కెర లేదా గ్లూకోజ్ నీరు తాగండి. ఉదయం పరగడుపున PHC లో రక్త పరీక్ష చేయించుకోండి.';
        } else if (lower.includes('diarrhoea') || lower.includes('విరేచనాలు') || lower.includes('మోషన్స్') || lower.includes('loose')) {
          fallbackText = 'విరేచనాలు (Diarrhoea) తగ్గడానికి వెంటనే 1 లీటర్ కాచి చల్లార్చిన నీటిలో 1 ప్యాకెట్ ORS కలిపి తాగండి. శరీరంలో నీటిశాతం తగ్గకుండా కొబ్బరినీళ్లు, గంజి తాగండి. రోజుకు 4-5 సార్ల కంటే ఎక్కువైతే వెంటనే PHC వైద్యుడిని సంప్రదించండి.';
        } else if (lower.includes('జ్వరం') || lower.includes('fever') || lower.includes('తాపం')) {
          fallbackText = 'మీకు జ్వరం ఎన్ని రోజుల నుండి ఉంది? చలి లేదా ఒళ్లు నొప్పులు ఉన్నాయా? దయచేసి పుష్కలంగా మంచినీరు తాగండి మరియు దగ్గర్లోని PHC వైద్యుడిని సంప్రదించండి.';
        } else if (lower.includes('పాము') || lower.includes('bite') || lower.includes('కాటు')) {
          fallbackText = 'అత్యవసరం! వెంటనే కదలకుండా ఉండండి, గాయంపై ఎలాంటి కోతలు పెట్టకండి. వెంటనే 108 కి కాల్ చేసి సమీప ప్రాథమిక ఆరోగ్య కేంద్రానికి వెళ్ళండి.';
        } else {
          fallbackText = 'మీ ఆరోగ్య సమస్యను వివరంగా అర్థం చేసుకున్నాము. ఈ సమస్య ఎప్పటి నుండి ఉంది? నొప్పి లేదా అసౌకర్యం తీవ్రత ఎంతగా ఉంది?';
        }
      } else if (language === 'hi') {
        if (lower.includes('bp') || lower.includes('रक्तचाप') || lower.includes('blood pressure') || lower.includes('बीपी')) {
          fallbackText = 'रक्तचाप (BP) की समस्या में क्या आपको सिरदर्द, चक्कर या घबराहट महसूस हो रही है? भोजन में नमक कम करें, तनाव न लें। यदि सिर में तेज दर्द हो तो तुरंत नजदीकी PHC में BP की जांच कराएं।';
        } else if (lower.includes('sugar') || lower.includes('मधुमेह') || lower.includes('शुगर') || lower.includes('diabetes')) {
          fallbackText = 'शुगर (Diabetes) के लिए: क्या आपको अत्यधिक प्यास, बार-बार पेशाब या कमजोरी लग रही है? यदि अचानक पसीना और कपकपी आए तो तुरंत थोड़ा मीठा पानी या ग्लूकोज लें। नियमित जांच हेतु PHC जाएं।';
        } else if (lower.includes('diarrhoea') || lower.includes('दस्त') || lower.includes('loose motions') || lower.includes('उल्टी')) {
          fallbackText = 'दस्त (Diarrhoea) होने पर तुरंत 1 लीटर उबले पानी में 1 पैकेट ORS घोलकर पिएं। नारियल पानी व पतली दाल का पानी लें ताकि डिहाइड्रेशन न हो। यदि दस्त 4 बार से अधिक हो तो तुरंत PHC डॉक्टर से मिलें।';
        } else if (lower.includes('बुखार') || lower.includes('fever')) {
          fallbackText = 'आपको बुखार कितने दिनों से है? क्या ठंड या शरीर में तेज दर्द भी है? पर्याप्त पानी पिएं और नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में जांच कराएं।';
        } else if (lower.includes('सांप') || lower.includes('काट')) {
          fallbackText = 'आपातकालीन! मरीज को शांत रखें, ज्यादा हिलने न दें। तुरंत 108 एम्बुलेंस बुलाएं और नजदीकी सरकारी अस्पताल पहुंचें।';
        } else {
          fallbackText = 'आपकी स्वास्थ्य समस्या नोट कर ली गई है। यह तकलीफ कितने दिनों से हो रही है और इसकी गंभीरता कितनी है?';
        }
      } else {
        if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('hypertension')) {
          fallbackText = 'For Blood Pressure (BP): Are you experiencing dizziness, headache, or chest palpitations? Reduce salt intake, avoid stress, and visit your nearest PHC for an accurate digital BP checkup.';
        } else if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('glucose')) {
          fallbackText = 'For Diabetes/Blood Sugar: Watch for extreme thirst, frequent urination, or fatigue. If you feel sudden sweating or shivering (low sugar), take glucose or sweet water immediately and visit the PHC clinic.';
        } else if (lower.includes('diarrhoea') || lower.includes('diarrhea') || lower.includes('loose motion') || lower.includes('vomiting')) {
          fallbackText = 'For Diarrhoea & Loose Motions: Immediately start drinking ORS (Oral Rehydration Solution) mixed in 1 liter of clean boiled water. Drink coconut water and buttermilk to prevent dehydration. Visit the PHC if severe.';
        } else if (lower.includes('fever') || lower.includes('temperature')) {
          fallbackText = 'How many days have you had this fever? Are you also experiencing chills or body aches? Please drink plenty of fluids and visit your nearest PHC.';
        } else if (lower.includes('snake') || lower.includes('bite') || lower.includes('emergency')) {
          fallbackText = 'EMERGENCY! Keep the patient calm and completely still. Do not cut or suck the wound. Call 108 immediately and reach the nearest PHC hospital.';
        } else {
          fallbackText = 'I have noted your symptoms. How long have you been experiencing this, and on a scale of 1 to 10, how severe is the discomfort?';
        }
      }
      return res.json({ success: true, text: fallbackText });
    }
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing consultation',
      fallbackText: 'Please visit your nearest Primary Health Centre or dial 108 for emergency assistance.' 
    });
  }
});

/**
 * Endpoint: /api/analyze
 * Comprehensive clinical severity rating and medical report generation
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { messages = [], language = 'en', userProfile } = req.body;

    const chatSummaryText = messages
      .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');

    const prompt = `Analyze this rural healthcare patient chat history and generate a structured clinical triage report.
Chat conversation:
${chatSummaryText}

Patient info: Name: ${userProfile?.name || 'Patient'}, Age: ${userProfile?.age || 'Adult'}, Gender: ${userProfile?.gender || 'Unknown'}, Village: ${userProfile?.village || 'Rural Village'}
Output Language: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Provide the output strictly in this JSON structure:
{
  "severity": "safe" | "moderate" | "severe",
  "severityLabel": "Short severity title in target language",
  "chiefComplaint": "Primary symptom reported",
  "symptomsList": ["symptom 1", "symptom 2"],
  "durationDays": "e.g. 3 days",
  "painLevel": 5,
  "summary": "Clear 2-3 sentence clinical summary",
  "possibleConditions": [
    { "name": "Condition name", "description": "Brief explanation", "level": "High/Medium/Low" }
  ],
  "recommendedAction": "Actionable advice for rural citizen",
  "homeCareTips": ["Tip 1 (e.g. ORS / boiled water)", "Tip 2"],
  "warningSigns": ["Red flag symptom to immediately rush to hospital"],
  "needImmediateEmergency": boolean
}
Note: 
- Use "severe" if there are red flag symptoms (chest pain, severe breathlessness, snake bite, extreme dehydration with lethargy, stroke, BP >180, pregnancy emergency).
- Use "moderate" if persistent fever, diarrhea with weakness, BP elevation, sugar imbalance, doctor visit needed within 24h.
- Use "safe" if mild cold, minor fatigue, well-hydrated mild symptoms that can be safely managed with home care.`;

    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        parsed = null;
      }

      if (parsed && parsed.severity) {
        return res.json({ success: true, result: parsed });
      }
    }

    // Default intelligent rule evaluation
    const lowerChat = chatSummaryText.toLowerCase();
    const isSevere = lowerChat.includes('snake') || lowerChat.includes('chest pain') || lowerChat.includes('breath') || lowerChat.includes('పాము') || lowerChat.includes('గుండె') || lowerChat.includes('సాంప') || lowerChat.includes('సాన్స్') || lowerChat.includes('108');
    const isDiarrhea = lowerChat.includes('diarrhoea') || lowerChat.includes('diarrhea') || lowerChat.includes('motion') || lowerChat.includes('విరేచన') || lowerChat.includes('दस्त');
    const isBp = lowerChat.includes('bp') || lowerChat.includes('blood pressure') || lowerChat.includes('రక్తపోటు') || lowerChat.includes('रक्तचाप');
    const isSugar = lowerChat.includes('sugar') || lowerChat.includes('diabetes') || lowerChat.includes('మధుమేహం') || lowerChat.includes('मधुमेह') || lowerChat.includes('షుగర్');
    
    let severity: 'safe' | 'moderate' | 'severe' = isSevere ? 'severe' : 'moderate';
    let chiefComplaint = 'General Clinical Concern';
    let symptomsList = ['Body Fatigue', 'Health Evaluation Required'];
    let possibleConditions = [{ name: 'Clinical Consultation Needed', description: 'Evaluation recommended at rural PHC.', level: 'Medium' }];
    let homeCareTips = ['Drink boiled and cooled drinking water.', 'Take adequate rest.'];
    let warningSigns = ['High fever above 102.5°F', 'Difficulty breathing or sudden chest pressure'];

    if (isDiarrhea) {
      chiefComplaint = language === 'te' ? 'విరేచనాలు మరియు నీరసం (Diarrhoea)' : language === 'hi' ? 'दस्त और निर्जलीकरण (Diarrhoea)' : 'Diarrhoea & Mild Dehydration';
      symptomsList = language === 'te' ? ['తరచుగా విరేచనాలు', 'శరీరంలో నీటి నష్టం', 'నీరసం'] : language === 'hi' ? ['दस्त', 'कमजोरी', 'पानी की कमी'] : ['Loose watery stools', 'Dehydration', 'General Weakness'];
      possibleConditions = [{
        name: language === 'te' ? 'తీవ్రమైన గ్యాస్ట్రోఎంటెరిటిస్ / జీర్ణశయాంతర సమస్య' : language === 'hi' ? 'गैस्ट्रोएंटेराइटिस / पेट संक्रमण' : 'Acute Gastroenteritis / Dehydration',
        description: language === 'te' ? 'కలుషిత నీరు లేదా ఆహారం వల్ల వచ్చే జీర్ణ సమస్య.' : language === 'hi' ? 'दूषित जल या भोजन से होने वाला सामान्य संक्रमण।' : 'Common water-borne gastrointestinal irritation.',
        level: 'High Match'
      }];
      homeCareTips = [
        language === 'te' ? '1 లీటర్ కాచి చల్లార్చిన నీటిలో 1 ORS ప్యాకెట్ కలిపి ప్రతి విరేచనం తర్వాత తాగండి.' : language === 'hi' ? '1 लीटर पानी में 1 पैकेट ORS घोलकर हर दस्त के बाद पिएं।' : 'Drink 1 packet ORS mixed in 1 liter boiled water continuously.',
        language === 'te' ? 'కొబ్బరి నీళ్లు, మజ్జిగ, గంజి పుష్కలంగా తాగండి.' : language === 'hi' ? 'नारियल पानी, छाछ और चावल का मांड लें।' : 'Consume tender coconut water and light buttermilk.',
        language === 'te' ? 'నూనె, కారం తక్కువగా ఉన్న ఆహారం మాత్రమే తీసుకోండి.' : language === 'hi' ? 'हल्का और सुपाच्य भोजन करें।' : 'Eat light, bland, easily digestible food.'
      ];
      warningSigns = [
        language === 'te' ? 'మలంలో రక్తం పడటం లేదా తీవ్రమైన వాంతులు' : language === 'hi' ? 'मल में खून आना या लगातार उल्टी होना' : 'Blood in stool or severe inability to retain liquids',
        language === 'te' ? 'కళ్లు గుంటలు పడటం లేదా స్పృహ తప్పడం' : language === 'hi' ? 'आंखें धंसना या अत्यधिक बेहोशी' : 'Extreme lethargy, sunken eyes, or severe dizziness'
      ];
    } else if (isBp) {
      chiefComplaint = language === 'te' ? 'రక్తపోటు సమస్య (Blood Pressure)' : language === 'hi' ? 'रक्तचाप संबंधी समस्या (BP Concern)' : 'Blood Pressure (BP) Irregularity';
      symptomsList = language === 'te' ? ['తలతిరగడం', 'తలనొప్పి', 'అలసట'] : language === 'hi' ? ['सिरदर्द', 'चक्कर आना', 'थकान'] : ['Headache', 'Dizziness', 'Mild Palpitations'];
      possibleConditions = [{
        name: language === 'te' ? 'హైపర్‌టెన్షన్ / అధిక రక్తపోటు' : language === 'hi' ? 'उच्च रक्तचाप (Hypertension)' : 'Hypertension / BP Fluctuations',
        description: language === 'te' ? 'రక్తనాళాలలో ఒత్తిడి పెరిగిన పరిస్థితి.' : language === 'hi' ? 'रक्तचाप के स्तर में परिवर्तन।' : 'Elevated vascular blood pressure requiring clinical check.',
        level: 'High Match'
      }];
      homeCareTips = [
        language === 'te' ? 'ఆహారంలో ఉప్పు, నూనెలను గణనీయంగా తగ్గించండి.' : language === 'hi' ? 'भोजन में नमक और चिकनाई कम करें।' : 'Strictly reduce dietary salt and fried foods.',
        language === 'te' ? 'క్రమం తప్పకుండా నడవండి మరియు తగినంత నిద్రపోండి.' : language === 'hi' ? 'पर्याप्त नींद लें और तनाव मुक्त रहें।' : 'Ensure 7-8 hours of sound sleep and reduce stress.',
        language === 'te' ? 'PHC లో డిజిటల్ యంత్రంతో ఖచ్చితమైన BP నమోదు చేయించుకోండి.' : language === 'hi' ? 'PHC में जाकर नियमित रूप से BP नपवाएं।' : 'Get formal blood pressure checkup at the PHC.'
      ];
      warningSigns = [
        language === 'te' ? 'తీవ్రమైన తలనొప్పి లేదా ఛాతీ నొప్పి' : language === 'hi' ? 'सीने में भारीपन या बहुत तेज सिरदर्द' : 'Severe chest tightness or sudden blurring of vision',
        language === 'te' ? 'మాట తడబడటం లేదా ఒక వైపు బలహీనత' : language === 'hi' ? 'बोलने में लड़खड़ाहट या हाथ-पैर सुन्न होना' : 'Speech slurring or sudden numbness'
      ];
    } else if (isSugar) {
      chiefComplaint = language === 'te' ? 'మధుమేహం / షుగర్ స్థాయి సమస్య (Diabetes)' : language === 'hi' ? 'मधुमेह / शुगर संबंधी समस्या (Diabetes)' : 'Blood Sugar / Diabetes Symptoms';
      symptomsList = language === 'te' ? ['అధిక దాహం', 'తరచుగా మూత్రవిసర్జన', 'తీవ్ర అలసట'] : language === 'hi' ? ['ज्यादा प्यास', 'बार-बार पेशाब', 'कमजोरी'] : ['Excessive thirst', 'Frequent urination', 'Fatigue'];
      possibleConditions = [{
        name: language === 'te' ? 'టైప్-2 డయాబెటిస్ / షుగర్ అసమతుల్యత' : language === 'hi' ? 'मधुमेह असंतुलन (Diabetes Mellitus)' : 'Diabetes Mellitus / Glycemic Imbalance',
        description: language === 'te' ? 'రక్తంలో గ్లూకోజ్ స్థాయిలు అసమతుల్యంగా ఉన్న పరిస్థితి.' : language === 'hi' ? 'रक्त में शर्करा का असामान्य स्तर।' : 'Elevated blood glucose levels requiring dietary and clinical management.',
        level: 'High Match'
      }];
      homeCareTips = [
        language === 'te' ? 'తీపి పదార్థాలు, మైదా పూర్తిగా నివారించి చిరుధాన్యాలు తీసుకోండి.' : language === 'hi' ? 'मीठा और मैदा छोड़ें, मोटे अनाज का सेवन करें।' : 'Avoid refined sugars, eat fiber-rich millets and greens.',
        language === 'te' ? 'అకస్మాత్తుగా వణుకు, చెమటలు పడితే వెంటనే గ్లూకోజ్ లేదా పండ్ల రసం తాగండి.' : language === 'hi' ? 'कपकपी व पसीना होने पर तुरंत ग्लूकोज पानी पिएं।' : 'Keep emergency glucose candy for hypoglycemia episodes.',
        language === 'te' ? 'ఉదయం పరగడుపున PHC లో ఫాస్టింగ్ షుగర్ పరీక్ష చేయించుకోండి.' : language === 'hi' ? 'PHC में खाली पेट शुगर की जांच कराएं।' : 'Schedule fasting blood sugar test at PHC.'
      ];
      warningSigns = [
        language === 'te' ? 'స్పృహ కోల్పోవడం లేదా తీవ్రమైన తలతిరుగుడు' : language === 'hi' ? 'बेहोशी या अत्यधिक घबराहట్' : 'Loss of consciousness or extreme disorientation',
        language === 'te' ? 'కాళ్లలో మానని గాయాలు లేదా ఇన్‌ఫెక్షన్' : language === 'hi' ? 'पैरों में न भरने वाले घाव' : 'Non-healing foot ulcers or severe infection'
      ];
    }

    const fallbackResult = {
      severity,
      severityLabel: severity === 'severe' 
        ? (language === 'te' ? 'అత్యవసరం (SEVERE / EMERGENCY)' : language === 'hi' ? 'गंभीर आपातकाल (SEVERE)' : 'Severe / Emergency')
        : severity === 'moderate'
        ? (language === 'te' ? 'మితమైన సంరక్షణ (MODERATE)' : language === 'hi' ? 'मध्यम स्तर (MODERATE)' : 'Moderate Care Required')
        : (language === 'te' ? 'సురక్షితం / తేలికపాటి (SAFE)' : language === 'hi' ? 'सुरक्षित / सामान्य (SAFE)' : 'Safe / Mild Condition'),
      chiefComplaint,
      symptomsList,
      durationDays: '2-3 days',
      painLevel: isSevere ? 9 : 5,
      summary: severity === 'severe' 
        ? (language === 'te' ? 'లక్షణాలు అత్యవసర వైద్య సంరక్షణను సూచిస్తున్నాయి. వెంటనే 108 కి కాల్ చేయండి లేదా సమీప PHCకి వెళ్ళండి.' : language === 'hi' ? 'लक्षण तत्काल चिकित्सीय हस्तक्षेप की मांग करते हैं। तुरंत 108 पर कॉल करें या PHC जाएं।' : 'Symptoms require urgent emergency clinical intervention. Please dial 108 or reach PHC.')
        : (language === 'te' ? 'లక్షణాలు మితమైన స్వభావాన్ని కలిగి ఉన్నాయి. 24 గంటల్లో ప్రాథమిక ఆరోగ్య కేంద్రంలో డాక్టర్‌ను సంప్రదించడం మంచిది.' : language === 'hi' ? 'लक्षण मध्यम श्रेणी के हैं। 24 घंटे के भीतर सरकारी प्राथमिक स्वास्थ्य केंद्र में डॉक्टर से परामर्श लें।' : 'Symptoms suggest moderate health condition. A clinical checkup at the PHC is recommended within 24 hours.'),
      possibleConditions,
      recommendedAction: severity === 'severe' 
        ? (language === 'te' ? 'వెంటనే 108 అంబులెన్స్ ద్వారా ఆసుపత్రికి చేరుకోండి.' : language === 'hi' ? 'तुरंत 108 एम्बुलेंस से अस्पताल पहुंचें।' : 'Immediately proceed to nearest PHC or call 108 ambulance.')
        : (language === 'te' ? 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) లో అపాయింట్‌మెంట్ బుక్ చేసుకోండి.' : language === 'hi' ? 'नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से परामर्श करें।' : 'Book an appointment at the nearest Primary Health Centre (PHC).'),
      homeCareTips,
      warningSigns,
      needImmediateEmergency: isSevere
    };

    return res.json({ success: true, result: fallbackResult });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`curo healthcare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
