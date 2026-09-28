import { Doctor, Helpline, AshaWorker, BloodDonor, MedicalDocument } from '../types';

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. K. Srinivas Rao',
    nameTe: 'డాక్టర్ కె. శ్రీనివాస్ రావు',
    nameHi: 'डॉ. के. श्रीनिवास राव',
    qualification: 'MBBS, DCH (Pediatrics & Family Medicine)',
    specialization: 'General Medicine & Rural Health',
    specializationTe: 'జనరల్ మెడిసిన్ & గ్రామీణ ఆరోగ్యం',
    specializationHi: 'सामान्य चिकित्सा एवं ग्रामीण स्वास्थ्य',
    hospitalName: 'Rampur Primary Health Centre (PHC)',
    hospitalType: 'PHC',
    address: 'Near Gram Panchayat Office, Main Road, Rampur',
    village: 'Rampur',
    district: 'Medak',
    distanceKm: 1.8,
    rating: 4.8,
    reviewsCount: 142,
    contactNumber: '+91 94401 23456',
    fee: 0,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeSlots: [
      { time: '09:00 AM - 10:00 AM', available: true, totalSlots: 5, availableSlots: 3 },
      { time: '10:00 AM - 11:00 AM', available: true, totalSlots: 5, availableSlots: 2 },
      { time: '11:30 AM - 12:30 PM', available: false, totalSlots: 5, availableSlots: 0 }, // 0 slots remaining
      { time: '02:00 PM - 03:00 PM', available: true, totalSlots: 4, availableSlots: 1 },
      { time: '03:30 PM - 04:30 PM', available: true, totalSlots: 5, availableSlots: 4 },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    mapCoordinates: { lat: 17.6142, lng: 78.4321 }
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Sharma',
    nameTe: 'డాక్టర్ అనన్య శర్మ',
    nameHi: 'डॉ. अनन्या शर्मा',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    specialization: 'Maternal & Women Health Specialist',
    specializationTe: 'మహిళా & ప్రసూతి వైద్య నిపుణురాలు',
    specializationHi: 'मातृ एवं महिला स्वास्थ्य विशेषज्ञ',
    hospitalName: 'Narsapur Community Health Centre (CHC)',
    hospitalType: 'CHC',
    address: 'Bus Stand Road, Narsapur Mandal',
    village: 'Narsapur',
    district: 'Medak',
    distanceKm: 4.5,
    rating: 4.1, // Testing 4.1 rating star calculation
    reviewsCount: 210,
    contactNumber: '+91 98480 87654',
    fee: 0,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    timeSlots: [
      { time: '09:30 AM - 10:30 AM', available: true, totalSlots: 6, availableSlots: 4 },
      { time: '11:00 AM - 12:00 PM', available: false, totalSlots: 5, availableSlots: 0 },
      { time: '01:00 PM - 02:00 PM', available: true, totalSlots: 5, availableSlots: 2 },
      { time: '03:00 PM - 04:00 PM', available: true, totalSlots: 4, availableSlots: 1 },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1594824813686-35368a4d4681?w=300&auto=format&fit=crop&q=80',
    mapCoordinates: { lat: 17.6521, lng: 78.3891 }
  },
  {
    id: 'doc-3',
    name: 'Dr. Ramesh Chandra Verma',
    nameTe: 'డాక్టర్ రమేష్ చంద్ర వర్మ',
    nameHi: 'डॉ. रमेश चंद्र वर्मा',
    qualification: 'MBBS, MD (General Physician)',
    specialization: 'Chronic Illness, Diabetes & Fever Clinic',
    specializationTe: 'దీర్ఘకాలిక వ్యాధులు, మధుమేహం & జ్వరం',
    specializationHi: 'शुगर, बीपी एवं संक्रामक बुखार विशेषज्ञ',
    hospitalName: 'Chandanagar Rural Sub-District Hospital',
    hospitalType: 'District Hospital',
    address: 'Hospital Cross Roads, Chandanagar',
    village: 'Chandanagar',
    district: 'Medak',
    distanceKm: 7.2,
    rating: 3.0, // Testing 3.0 rating star calculation
    reviewsCount: 98,
    contactNumber: '+91 97000 11223',
    fee: 0,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    timeSlots: [
      { time: '10:00 AM - 11:00 AM', available: true, totalSlots: 4, availableSlots: 2 },
      { time: '11:30 AM - 12:30 PM', available: true, totalSlots: 4, availableSlots: 3 },
      { time: '02:30 PM - 03:30 PM', available: false, totalSlots: 4, availableSlots: 0 },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    mapCoordinates: { lat: 17.6890, lng: 78.4110 }
  },
  {
    id: 'doc-4',
    name: 'Dr. G. Lakshmi Prasanna',
    nameTe: 'డాక్టర్ జి. లక్ష్మీ ప్రసన్న',
    nameHi: 'डॉ. जी. लक्ष्मी प्रसन्ना',
    qualification: 'BAMS (Ayurveda & Integrative Medicine)',
    specialization: 'Ayush & Herbal Community Care',
    specializationTe: 'ఆయుష్ & సహజ సంరక్షణ',
    specializationHi: 'आयुष एवं प्राकृतिक चिकित्सा',
    hospitalName: 'Ganga Seva Arogya Mandir',
    hospitalType: 'Community Clinic',
    address: 'Temple Street, Shiva Nagar',
    village: 'Shiva Nagar',
    district: 'Medak',
    distanceKm: 3.1,
    rating: 4.6,
    reviewsCount: 76,
    contactNumber: '+91 91234 56780',
    fee: 50,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeSlots: [
      { time: '08:30 AM - 09:30 AM', available: true, totalSlots: 5, availableSlots: 2 },
      { time: '10:00 AM - 11:00 AM', available: true, totalSlots: 5, availableSlots: 1 },
      { time: '04:00 PM - 05:00 PM', available: true, totalSlots: 5, availableSlots: 4 },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    mapCoordinates: { lat: 17.6010, lng: 78.4550 }
  }
];

export const mockHelplines: Helpline[] = [
  {
    id: 'help-108',
    number: '108',
    name: '108 National Emergency Ambulance Service',
    nameTe: '108 అత్యవసర అంబులెన్స్ సేవ',
    nameHi: '108 राष्ट्रीय आपातकालीन एम्बुलेंस',
    description: 'Free 24x7 emergency medical response for accidents, cardiac events, snake bites & trauma transport.',
    descriptionTe: 'ప్రమాదాలు, గుండెపోటు, పాముకాటు మరియు అత్యవసర ఆసుపత్రి రవాణా కోసం ఉచిత 24x7 అంబులెన్స్.',
    descriptionHi: 'दुर्घटना, हार्ट अटैक, सर्पदंश और गंभीर आपातकाल में तत्काल निःशुल्क 24x7 एम्बुलेंस सेवा।',
    category: 'emergency',
    icon: 'Ambulance',
    isTollFree: true
  },
  {
    id: 'help-102',
    number: '102',
    name: '102 Janani Shishu Suraksha Vahan (Maternal Care)',
    nameTe: '102 జననీ శిశు సురక్ష వాహనం (గర్భిణీ రవాణా)',
    nameHi: '102 जननी शिशु सुरक्षा वाहन (मातृ एवं नवजात)',
    description: 'Free dedicated transport for pregnant mothers to hospital for delivery and return drop to home.',
    descriptionTe: 'కాన్పుల కోసం గర్భిణీ స్త్రీలను ఉచితంగా ఆసుపత్రికి చేర్చి, సురక్షితంగా తిరిగి ఇంటికి చేర్చే సేవ.',
    descriptionHi: 'प्रसव हेतु गर्भवती महिलाओं और नवजात शिशुओं के लिए निःशुल्क अस्पताल आवागमन सेवा।',
    category: 'maternal',
    icon: 'Baby',
    isTollFree: true
  },
  {
    id: 'help-104',
    number: '104',
    name: '104 Arogya Seva Health Advice & Tele-Consultation',
    nameTe: '104 ఆరోగ్య సలహా & వైద్య సమాచారం',
    nameHi: '104 स्वास्थ्य सलाह और टेली-परामर्श',
    description: '24x7 medical counseling, drug information, seasonal illness queries and mental wellness guidance.',
    descriptionTe: '24x7 ఉచిత వైద్య సలహాలు, మందుల సమాచారం మరియు వ్యాధులపై నిపుణుల మార్గదర్శకత్వం.',
    descriptionHi: '24x7 स्वास्थ्य परामर्श, दवाओं की जानकारी व डॉक्टरों से टेली-परामर्श की निःशुल्क सुविधा।',
    category: 'telemedicine',
    icon: 'PhoneCall',
    isTollFree: true
  },
  {
    id: 'help-112',
    number: '112',
    name: '112 Unified National Emergency Helpline',
    nameTe: '112 జాతీయ అత్యవసర హెల్ప్‌లైన్',
    nameHi: '112 एकीकृत राष्ट्रीय आपातकालीन नंबर',
    description: 'Single unified emergency number connecting Police, Fire, and Medical response across all states.',
    descriptionTe: 'పోలీస్, ఫైర్ మరియు వైద్య అత్యవసరాలను అనుసంధానించే ఒకే ఒక్క జాతీయ నంబర్.',
    descriptionHi: 'पुलिस, अग्निशमन और चिकित्सा आपातकाल के लिए एकल अखिल भारतीय आपातकालीन नंबर।',
    category: 'emergency',
    icon: 'ShieldAlert',
    isTollFree: true
  },
  {
    id: 'help-1098',
    number: '1098',
    name: '1098 Childline Emergency Helpline',
    nameTe: '1098 చైల్డ్‌లైన్ అత్యవసర సహాయం',
    nameHi: '1098 चाइल्डलाइन बाल सहायता',
    description: '24-hour nationwide emergency phone outreach service for children in need of care and protection.',
    descriptionTe: 'చిన్నపిల్లల ఆరోగ్యం, రక్షణ మరియు అత్యవసర సహాయం కోసం 24 గంటల ఉచిత సేవ.',
    descriptionHi: 'बच्चों की सुरक्षा, स्वास्थ्य और आपातकालीन सहायता हेतु 24 घंटे की सेवा।',
    category: 'child',
    icon: 'HeartHandshake',
    isTollFree: true
  },
  {
    id: 'help-181',
    number: '181',
    name: '181 Women Helpline & Medical Support',
    nameTe: '181 మహిళా హెల్ప్‌లైన్ & మద్దతు',
    nameHi: '181 महिला हेल्पलाइन व स्वास्थ्य सहायता',
    description: '24x7 toll-free crisis response and counseling for women in distress.',
    descriptionTe: 'మహిళల అత్యవసర సహాయం మరియు కౌన్సెలింగ్ కొరకు 24x7 ఉచిత హెల్ప్‌లైన్.',
    descriptionHi: 'महिलाओं की सुरक्षा, स्वास्थ्य व संकट में त्वरित सहायता हेतु 24x7 हेल्पलाइन।',
    category: 'women',
    icon: 'Heart',
    isTollFree: true
  }
];

export const mockAshaWorkers: AshaWorker[] = [
  {
    id: 'asha-1',
    name: 'Sunitha Bai (సునీత బాయి / सुनीता बाई)',
    village: 'Rampur Village',
    subCentre: 'Rampur Sub-Centre PHC',
    district: 'Medak',
    phone: '+91 94901 88231',
    experienceYears: 8,
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'asha-2',
    name: 'M. Padmavati (ఎం. పద్మావతి / एम. पद्मावती)',
    village: 'Narsapur Gram',
    subCentre: 'Narsapur CHC Sector 2',
    district: 'Medak',
    phone: '+91 98492 77114',
    experienceYears: 12,
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'asha-3',
    name: 'Radha Devi (రాధా దేవి / राधा देवी)',
    village: 'Chandanagar Basti',
    subCentre: 'Chandanagar Sector 1',
    district: 'Medak',
    phone: '+91 91000 44556',
    experienceYears: 6,
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'asha-4',
    name: 'K. Kavitha (కె. కవిత / के. कविता)',
    village: 'Shiva Nagar Tanda',
    subCentre: 'Shiva Nagar Sub-Centre',
    district: 'Medak',
    phone: '+91 96180 33221',
    experienceYears: 10,
    available: false,
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80'
  }
];

export const mockBloodDonors: BloodDonor[] = [
  {
    id: 'bd-1',
    name: 'Venkatesh Goud (వెంకటేష్ గౌడ్)',
    bloodGroup: 'O+',
    village: 'Rampur Village',
    district: 'Medak',
    phone: '+91 98480 33445',
    lastDonated: '4 months ago',
    isAvailable: true
  },
  {
    id: 'bd-2',
    name: 'Raju Yadav (రాజు యాదవ్)',
    bloodGroup: 'B+',
    village: 'Narsapur',
    district: 'Medak',
    phone: '+91 97011 55667',
    lastDonated: '2 months ago',
    isAvailable: true
  },
  {
    id: 'bd-3',
    name: 'Mohammed Imran (మహ్మద్ ఇమ్రాన్)',
    bloodGroup: 'A+',
    village: 'Chandanagar',
    district: 'Medak',
    phone: '+91 99890 12345',
    lastDonated: '6 months ago',
    isAvailable: true
  },
  {
    id: 'bd-4',
    name: 'P. Sai Kumar (పి. సాయి కుమార్)',
    bloodGroup: 'AB+',
    village: 'Rampur Main Road',
    district: 'Medak',
    phone: '+91 94411 99887',
    lastDonated: '1 month ago',
    isAvailable: true
  },
  {
    id: 'bd-5',
    name: 'Santosh Kumar (సంతోష్ కుమార్)',
    bloodGroup: 'O-',
    village: 'Narsapur Bypass',
    district: 'Medak',
    phone: '+91 93900 88776',
    lastDonated: '3 months ago',
    isAvailable: true
  }
];

export const initialSampleDocuments: MedicalDocument[] = [
  {
    id: 'sample-doc-1',
    title: 'PHC OPD Prescription - Seasonal Viral Fever',
    category: 'prescription',
    doctorName: 'Dr. K. Srinivas Rao',
    hospitalName: 'Rampur Primary Health Centre',
    recordDate: '2026-08-15',
    uploadedAt: '2026-08-15 11:30 AM',
    originalSizeBytes: 4280000,
    compressedSizeBytes: 142000,
    compressionRatioPercent: 96,
    dataUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    source: 'camera',
    notes: 'Prescribed Paracetamol 500mg, ORS packets, and Cetirizine for 3 days.'
  }
];
