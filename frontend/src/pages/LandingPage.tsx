import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Globe,
  Play,
  Users,
  BookOpen,
  Award,
  Clock,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail
} from 'lucide-react'
import { Navbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap'
import logo from "../assets/LearnilmworldLogo.jpg";
import { useAuth } from "../contexts/AuthContext"; 
import 'bootstrap/dist/css/bootstrap.min.css'


// LinguaNest — Enhanced Landing Page (single-file React component)
// Adjusted image positions: hero image lifted up slightly and the three overlapping
// cards have been moved upwards for a stronger visual overlap and nicer composition.

export default function LandingPageAlt() {
  const [mounted, setMounted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showOffcanvas, setShowOffcanvas] = useState(false)

  const navigate = useNavigate();
  const { user } = useAuth();


  const handleLanguageClick = async (language: string) => {
    // try {
    //   const res = await axios.get("/api/users/trainers");
    //   const trainers = res.data;
    //   console.log("✅ Trainers fetched:", trainers);

    //   if (!Array.isArray(trainers)) {
    //     console.error("Unexpected trainers format:", trainers);
    //     alert("API did not return a valid trainer list.");
    //     return;
    //   }

    //   const matching = trainers.filter((t: any) => {
    //     const verified = t?.profile?.verificationStatus === "verified";
    //     const allLangs = [
    //       ...(t?.profile?.languages || []),
    //       ...(t?.profile?.trainerLanguages?.map((tl: any) => tl.language) || []),
    //     ]
    //       .filter(Boolean)
    //       .map((l: string) => l.toLowerCase());
    //     return verified && allLangs.includes(language.toLowerCase());
    //   });

    //   console.log(`🔍 Matching trainers for ${language}:`, matching);

    //   if (!matching.length) {
    //     alert(`No trainers found for ${language} yet.`);
    //     return;
    //   }

    //   const bestTrainer = matching.sort(
    //     (a: any, b: any) =>
    //       (b?.profile?.averageRating || 0) - (a?.profile?.averageRating || 0)
    //   )[0];

    //   const trainerId = bestTrainer?._id;
    //   console.log("🎯 Best trainer ID:", trainerId);

    //   if (!trainerId) {
    //     alert("Trainer ID missing!");
    //     return;
    //   }

    //   if (!user) {
    //     localStorage.setItem("redirectAfterLogin", `/book/${trainerId}`);
    //     navigate("/login");
    //   } else {
    //     navigate(`/book/${trainerId}`);
    //   }
    // } catch (err) {
    //   console.error("❌ Error finding trainer:", err);
    //   alert("Something went wrong while finding a trainer.");
    // }

    const trainerMap: Record<string, string> = {
      German: "trainer_id_for_german",
      French: "trainer_id_for_french",
      Japanese: "trainer_id_for_japanese",
      Spanish: "trainer_id_for_spanish",
      English: "68ef33d0cad95b62472f382a",
      Sanskrit: "trainer_id_for_sanskrit",
    };

    const trainerId = trainerMap[language];

    if (!trainerId) return alert("Trainer not found!");

    if (!user) {
      // Save the clicked language temporarily for redirect after login
      localStorage.setItem("redirectAfterLogin", `/book/${trainerId}`);
      navigate("/login");
    } else {
      navigate(`/book/${trainerId}`);
    }
  };



  const flagIcons: Record<string, string> = {
    German: "https://flagcdn.com/w40/de.png",
    French: "https://flagcdn.com/w40/fr.png",
    Japanese: "https://flagcdn.com/w40/jp.png",
    Spanish: "https://flagcdn.com/w40/es.png",
    English: "https://flagcdn.com/w40/gb.png",
    Sanskrit: "https://flagcdn.com/w40/in.png"
  }


  useEffect(() => setMounted(true), [])

  const steps = [
    {
      icon: Users,
      title: 'Find your trainer',
      desc: 'Smart filters: language, accent, price, availability and student ratings.'
    },
    {
      icon: BookOpen,
      title: 'Book a session',
      desc: 'One-click booking, instant calendar sync and secure payments.'
    },
    {
      icon: Play,
      title: 'Practice & improve',
      desc: 'Live lessons, role-plays, recordings and tailored homework.'
    },
    {
      icon: Award,
      title: 'Track progress',
      desc: 'Personal dashboard, streaks, and certificates.'
    }
  ]

  const features = [
    { icon: Clock, title: 'Flexible Hours', text: 'Lessons at any time — morning, night or weekends.' },
    { icon: Star, title: 'Expert Trainers', text: 'Certified tutors with real teaching experience.' },
    { icon: MessageSquare, title: 'Immersive Tools', text: 'Live transcripts, quizzes and pronunciation scoring.' }
  ]

  const faqs = [
    { q: 'How do I choose a trainer?', a: 'Use filters (experience, rating, price) and send a short message to get a feel. Look for video intros and student reviews.' },
    { q: 'What languages are available?', a: '50+ languages including Spanish, French, German, Chinese, Japanese, Arabic and many dialects.' },
    // { q: 'Can I try before I pay?', a: 'Yes — we offer a free trial credit for first-time students. Trial availability depends on the trainer.' },
    { q: 'How do payments work?', a: 'We use Stripe for secure checkout. Cards and Apple/Google Pay are accepted where available.' },
    { q: 'Can I reschedule or cancel?', a: 'Reschedule up to 24 hours before a session. Some trainers may have different policies — check their profile.' },
    { q: 'Do trainers provide materials?', a: 'Many trainers include PDFs, flashcards or audio. You can also upload your own material before a lesson.' },
    { q: 'Is there a mobile app?', a: 'Coming soon — our PWA works great on mobile and can be installed to your home screen.' },
    {
      q: "What is the procedure to become a tutor at LearnILmWorld?",
      a: "Becoming a tutor involves a few simple steps — from applying to onboarding. Here’s how you can start your journey with us:",
    },
    {
      q: "Step 1: How do I submit my application?",
      a: "Begin by submitting your application through our official LearnOsphere website. Make sure your details are accurate and complete.",
    },
    {
      q: "Step 2: What happens after I apply?",
      a: "Our recruitment team will carefully review your application within 7 working days. You’ll receive an update about your application status via email.",
    },
    {
      q: "Step 3: What is the interview and evaluation process?",
      a: "If your profile meets our criteria, you’ll be invited for an interview and assessment. This step evaluates your communication and conversational teaching skills.",
    },
    {
      q: "Step 4: What happens after the evaluation?",
      a: "After successfully completing the evaluation, our team provides personalized feedback and necessary training to align your teaching with our methods.",
    },
    {
      q: "Step 5: How does onboarding work?",
      a: "Once you complete the required steps and training, you officially join EnglishYaari as a tutor — ready to empower learners with improved spoken English skills.",
    },
  ]

  const reviews = [
    {
      name: 'Sarath',
      
      text: 'The trainers are excellent — practical and patient. After a month I was comfortable conducting client calls in Spanish. The homework and recorded sessions were invaluable.',
      rating: 5
    },
    {
      name: 'Murali',
      text: 'Lessons are structured but flexible. My speaking confidence improved rapidly. The trainer recommended focused listening tasks that really helped.',
      rating: 4
    },
    {
      name: 'Akhil',
      text: 'The cultural mini-lessons helped me with real conversations while traveling. The trainer prepared a short phrase sheet for my trip — super useful!',
      rating: 5
    },
    {
      name: 'Neha',
      text: 'Easy scheduling and consistent progress checks. I love the micro-lessons between full sessions.',
      rating: 4
    }
  ]

  // Curated images (Unsplash)
  const heroImage = 'https://ufhealthjax.org/assets/images/stories/_860x573_crop_center-center_line/Overcoming-Language-Barriers-in-Health-Care.jpg'
  const cardImage1 = 'https://gurmentor.com/wp-content/uploads/2020/11/gurmentor.com-best-language-learning-methods-and-teaching-approaches-explained-2020-11-17_16-21-09_140956.png'
  const cardImage2 = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'
  const cardImage3 = 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=900&auto=format&fit=crop'

  return (
    <div className="min-h-screen font-inter bg-[#dc8d33] text-[#2D274B] transition-colors duration-500"> 

      {/* 2D274B */}
      <header className="sticky top-0 z-40 bg-[#dc8d33]/95 backdrop-blur-sm border-b border-[#8CA0E5]/30 text-[#8CA0E5]">

        <Container className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div className="flex flex-col items-center gap-1">

                {/* Main Logo */}
                <div className="text-2xl md:text-3xl font-[Good Vibes] font-extrabold tracking-wide relative inline-flex items-center"> 
                  
                  {/* LEARN */} 
                  <span className="text-[#2D274B] bg-clip-text drop-shadow-lg"> LEARNILM </span> 
                   
                  {/* Rotating Globe */} 
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} className="inline-block mx-1 text-3xl" > 🌎 </motion.span> 

                   {/* World */} 
                  <span className="text-[#2D274B] bg-clip-text drop-shadow-lg"> WORLD </span>
                 
                  {/* Optional subtle shine */} 
                  {/* <motion.div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full blur-xl pointer-events-none" animate={{ x: [-200, 200] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} />  */}
                </div>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-6">
              <Link to="/main" className="text-base text-[#2D274B] font-medium hover:text-[#CBE56A]">Browse our Mentors</Link>
              
              
              <Link to="/login" className="text-base font-medium text-[#2D274B] hover:text-[#CBE56A]">Sign In</Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CBE56A] text-[#2D274B] text-sm font-semibold shadow hover:scale-105 transition">Get started</Link>
            </nav>

            <div className="sm:hidden">
              <Button variant="light" onClick={() => setShowOffcanvas(true)} aria-label="Open menu">☰</Button>

              <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" aria-labelledby="offcanvas-nav">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title id="offcanvas-nav">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Nav className="flex-column gap-2">
                    <Nav.Link as={Link} to="/main" onClick={() => setShowOffcanvas(false)}>Trainers</Nav.Link>
                    <Nav.Link as={Link} to="/login" onClick={() => setShowOffcanvas(false)}>Sign In</Nav.Link>
                    <div className="mt-3">
                      <Link to="/register" onClick={() => setShowOffcanvas(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9787F3] text-white text-sm font-semibold">Get started</Link>
                    </div>
                  </Nav>
                </Offcanvas.Body>
              </Offcanvas>
            </div>
          </div>
        </Container>
      </header>

      <main className="pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-left"
            >
              <h1 className="text-5xl md:text-6xl font-serif leading-tight font-extrabold text-[#2D274B]">
                Learn the Subject,Speak with Confidence — <span className="text-white">Real Tutors, Real Conversations</span>
              </h1>

              <p className="mt-6 text-2xl text-[#2D274B] font-bold max-w-xl">
                Quickly gain practical speaking skills with 1:1 lessons, micro-modules and conversation practice designed by expert tutors.
                Start with a free trial, learn at your pace and see measurable progress every week.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-sm text-[#4B437C] shadow-sm">⭐ 4.9 Average Rating</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-sm text-[#4B437C] shadow-sm">✅ Verified Tutors</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-sm text-[#4B437C] shadow-sm">⏱️ 15–60 min Lessons</div>
              </div>

              

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/trainers" className="inline-flex items-center gap-3 px-6 py-3 bg-[#CBE56A] text-[#4B437C] text-lg rounded-lg shadow hover:scale-105 transition" aria-label="Start learning"> 
                  <Play />
                  Start Learning
                </Link>
                <Link to="/become-trainer" className="inline-flex items-center gap-3 px-6 py-3 border border-[#9787F3] text-blue-50 text-lg rounded-lg hover:text-[#4B437C] hover:bg-[#CBE56A] transition" aria-label="Become a trainer">
                  <Users /> Become a Trainer
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                 {/* chaned color to wite from [#7fe808],[#ef4444] and [#9787F3] */}
                <motion.div initial={{ scale: 0.95 }} animate={mounted ? { scale: 1 } : {}} className="text-center">
                  <div className="text-2xl font-bold text-white">400+</div>
                  <div className="text-sm text-[#4B437C]">Trainers</div>
                </motion.div>
                <motion.div initial={{ scale: 0.95 }} animate={mounted ? { scale: 1.03 } : {}} className="text-center">
                 
                  <div className="text-2xl font-bold text-white">60+</div>
                  <div className="text-sm text-[#4B437C]">Languages</div>
                </motion.div>
                <motion.div initial={{ scale: 0.95 }} animate={mounted ? { scale: 1.06 } : {}} className="text-center">
                  <div className="text-2xl font-bold text-white">12K+</div>
                  <div className="text-sm text-[#4B437C]">Students</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl -translate-y-6 md:-translate-y-12">
              <img loading="lazy" src={heroImage} alt="students practicing a language together" className="w-full h-[420px] md:h-96 lg:h-[520px] object-cover" />

              {/* Left card - moved up */}
              {/* <div className="absolute left-6 bottom-24 w-52 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-white">
                <img loading="lazy" src={cardImage1} alt="culture and conversation" className="w-full h-32 object-cover" />
                <div className="p-3">
                  <div className="text-sm font-semibold">Cultural conversations</div>
                  <div className="text-xs text-slate-500">Contextual lessons you’ll actually use</div>
                </div>
              </div> */}

              {/* Right top card - nudged slightly higher */}
              {/* <div className="absolute right-6 top-2 w-44 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-white">
                <img loading="lazy" src={cardImage2} alt="tutor profile" className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="text-sm font-semibold">Meet tutors</div>
                  <div className="text-xs text-slate-500">See video intros & ratings</div>
                </div>
              </div> */}

              {/* Lower-right card - lifted up and pulled inwards */}
              {/* <div className="absolute -right-6 bottom-36 w-64 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-white">
                <div className="p-4">
                  <div className="text-lg font-bold">Practice </div>
                  <div className="text-xs text-slate-500 mt-2">Short tasks to try between lessons</div>
                </div>
                <img loading="lazy" src={cardImage3} alt="mini lesson" className="w-full h-20 object-cover" />
              </div> */}

            </motion.div>
          </div>
        </div>
      </main>

     {/* Language Levels Explanation */}
    <section
      className="relative py-28 bg-[#dc8d33] text-[#8CA0E5]"
      aria-labelledby="sdil-courses"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          id="sdil-courses"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-5xl md:text-5xl font-extrabold font-serif text-[#2D274B] tracking-tight"
        >
          Languages That Open Doors
          <span className="block text-[#2D274B] mt-1">
            Speak to the World with Confidence
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-5 text-xl text-white font-bold max-w-3xl mx-auto"
        >
          Explore world languages guided by international certification standards.
          Learn from certified trainers across every level.
        </motion.p>

        {/* Tag */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border text-sm font-medium text-[#4B437C] shadow-sm">
            🌍 Languages & Levels
          </div>
        </div>

        {/* Responsive Grid with Flags */}
        <div className="mt-20 grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {[
            {
              lang: "German",
              flag: "https://flagcdn.com/w40/de.png",
              pattern: "MMB Pattern",
              bg: "https://st2.depositphotos.com/1518767/8469/i/450/depositphotos_84693888-stock-photo-pretty-student-in-the-library.jpg",
              levels: [
                { name: "A1", desc: "Basic introductions & phrases." },
                { name: "A2", desc: "Everyday conversations & travel." },
                { name: "B1", desc: "Confident speaking in work & study." },
              ],
            },
            {
              lang: "French",
              flag: "https://flagcdn.com/w40/fr.png",
              pattern: "DELF Pattern",
              bg: "https://t3.ftcdn.net/jpg/04/70/92/80/360_F_470928010_XLZ5r8ksCXK8ZEGUnc6X5PPTPFpbgSwv.jpg",
              levels: [
                { name: "A1", desc: "Greetings & simple interactions." },
                { name: "A2", desc: "Conversations on daily topics." },
                { name: "B1", desc: "Fluent discussions & media." },
              ],
            },
            {
              lang: "Japanese",
              flag: "https://flagcdn.com/w40/jp.png",
              pattern: "JLPT / Japan Foundation",
              bg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmgp7s6ne8OUyY3aOKKDYbfdMLwCEG_qaThSBYaZYrA4uqLYDkioAmr4JvVXuI4qaVp_8&usqp=CAU",
              levels: [
                { name: "N5", desc: "Basic greetings & phrases." },
                { name: "N4", desc: "Daily conversation & reading." },
                { name: "N3", desc: "Understand news & articles." },
              ],
            },
            {
              lang: "Spanish",
              flag: "https://flagcdn.com/w40/es.png",
              pattern: "DELE Pattern",
              bg: "https://st5.depositphotos.com/1003234/69163/i/450/depositphotos_691637142-stock-photo-beautiful-woman-student-spanish-flag.jpg",
              levels: [
                { name: "A1", desc: "Everyday vocabulary & phrases." },
                { name: "A2", desc: "Converse about daily life." },
              ],
            },
            {
              lang: "English",
              flag: "https://flagcdn.com/w40/gb.png",
              pattern: "Cambridge English",
              bg: "https://st5.depositphotos.com/10614052/68049/i/450/depositphotos_680499390-stock-photo-young-students-language-school-books.jpg",
              levels: [
                { name: "A2", desc: "Understand daily expressions." },
                { name: "B1", desc: "Detailed conversations." },
                { name: "B2", desc: "Fluent in professional settings." },
              ],
            },
            {
              lang: "Sanskrit",
              flag: "https://flagcdn.com/w40/in.png",
              pattern: "Classical Language",
              bg: "https://st2.depositphotos.com/3591429/11681/i/450/depositphotos_116814870-stock-photo-college-students-using-wireless-devices.jpg",
              levels: [{ name: "Intro", desc: "Learn alphabets & chanting." }],
            },
          ].map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden group  hover:shadow-2xl transition-all duration-300 cursor-pointer "
              onClick={() => handleLanguageClick(course.lang)}
            >
              {/* Language Header (moved outside image) */}
              <div className="flex items-center justify-between px-3 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                    <img
                      src={course.flag}
                      alt={`${course.lang} flag`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{course.lang}</h3>
                </div>
                <span className="text-xs bg-[#9787F3] text-white px-2 py-1 rounded-full">
                  {course.pattern}
                </span>
              </div>

              {/* Image with gradient and text content below */}
              <div
                className="relative rounded-b-2xl overflow-hidden"
                style={{
                  backgroundImage: `url(${course.bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "280px",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/50 transition-all duration-300"></div>
                <div className="relative z-10 text-left p-6 flex flex-col justify-end h-full">
                  <ul className="text-base font-semibold text-gray-200 space-y-1">
                    {course.levels.map((level, i) => (
                      <li key={i} className="leading-snug">
                        <strong>{level.name}:</strong> {level.desc}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[#CBE56A] font-semibold">
                    Click to start learning →
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>



      {/* Explore subjects section */}
      <section
        className="relative py-24 bg-[#dc8d33]"
        aria-labelledby="sdil-subjects"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          {/* Heading */}
          <motion.h2
            id="sdil-subjects"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-5xl md:text-5xl font-serif tracking-tight font-extrabold"
          >
            Subjects You Can Explore
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-5 text-xl text-white font-bold max-w-2xl mx-auto"
          >
            Comprehensive courses across academic and professional subjects for holistic learning.
          </motion.p>

          {/* Grid Subjects */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 1.12 } },
            }}
            className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {[
              {
                name: "History",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUfVuI-52gMsBUjICo8U71bZzPh_Sl60a0rw&s",
              },
              {
                name: "Geography",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStimZbjbIU3wmA6leFoxxaiMHEV44X5zg6Eg&s",
              },
              {
                name: "Physics",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaokOEDxUXqruUqK6jfotlGNnh_cqkv_7YKQ&s",
              },
              {
                name: "Chemistry",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYYeicpqHLfxEoRF1mR5aUn8bda5xZKp_50w&s",
              },
              {
                name: "Mathematics",
                img: "https://www.shutterstock.com/image-vector/math-school-subject-pupils-studying-260nw-2193849035.jpg",
              },
              {
                name: "Biology",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwCZsh8ORVYuaRBk5UVIjupZH-uJdpqSrNNA&s",
              },
              {
                name: "Economics",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQikC6ieHuOnISux2eESzpHmmiq8ag7xTIi5w&s",
              },
              {
                name: "Computer Science",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGt5xq-25cqfQWyM8Z0Yu706O8s_aCraXM9A&s",
              },
            ].map((subject, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-56 rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundImage: `url(${subject.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>

                {/* Subject Name */}
                <div className="absolute top-3 left-3 bg-white/90 text-[#2D274B] px-3 py-1 rounded-md font-bold text-lg shadow">
                  {subject.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


       {/* How it works section */}
      <section className="py-16" aria-labelledby="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="how-it-works" className="text-4xl font-bold md:text-4xl font-serif">How it works — in 4 simple steps</h2>
            <p className="mt-3 text-white text-lg font-bold max-w-2xl mx-auto">Designed to get you speaking fast: pick, book, practice and track.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="bg-gradient-to-b from-[#f0fdf4] to-white rounded-2xl p-6 shadow hover:shadow-xl transition" role="article">
                <div className="w-14 h-14 rounded-lg bg-white shadow flex items-center justify-center mb-4">
                  <s.icon className="text-[#9787F3]" aria-hidden />
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-[#4B437C] mt-2">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why learners love us section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-4xl font-semibold font-serif">Why learners love <br/> LEARNILM🌎WORLD</h3>
              <p className="mt-4 text-white text-lg font-bold max-w-xl">Short lessons, lots of speaking time and tutors focused on practical outcomes. Learn phrases you’ll use the very next day.</p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {features.map((f, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 rounded-xl shadow hover:bg-[#CBE56A] hover:scale-[1.02] transition" role="group">
                    <f.icon className="w-9 h-9 text-[#9787F3]" aria-hidden />
                    <div className="font-bold mt-3">{f.title}</div>
                    <div className="text-base font-semibold text-[#4B437C] mt-1">{f.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-2xl shadow ">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#fde68a] flex items-center justify-center">⭐</div>
                  <div>
                    <div className="font-extrabold text-xl ">Real outcomes</div>
                    <div className="text-base font-semibold text-[#4B437C]">Progress reports every 4 lessons</div>
                  </div>
                </div>
                <p className="text-[#4B437C] font-semibold text-lg">From small talk to business calls — our curriculum is outcome-focused so you can see measurable improvement.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl shadow font-extrabold  hover:bg-[#CBE56A] ">Quick lessons</div>
                <div className="bg-blue-50 p-4 rounded-xl shadow font-extrabold  hover:bg-[#CBE56A] ">Excellent Material</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      


      {/* Reviews */}
      <section className="py-16" aria-labelledby="reviews">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 id="reviews" className="text-4xl font-serif font-bold">What learners say</h3>
            <p className="mt-2 text-white font-bold text-lg">Real reviews from students and professionals who used LearnILm 🌍 World.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <article key={i} className="bg-white rounded-xl shadow p-6 hover:shadow-2xl transition " aria-label={`Review by ${r.name}`}>
                <div className="flex items-center gap-3 mb-3 ">
                  <div className="w-12 h-12 rounded-full bg-[#fde68a] flex items-center justify-center font-semibold">{r.name.split(' ')[0][0]}</div>
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    {/* <div className="text-xs text-[#4B437C]">{r.role}</div> */}
                  </div>
                </div>
                <p className="text-[#4B437C]">“{r.text}”</p>
                <div className="mt-4 text-sm text-[#4B437C]">{Array.from({ length: r.rating }).map((_, idx) => '★').join('')}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights section */}
      <section
        className="relative py-24 bg-gradient-to-b from-[#f0f9ff] to-white"
        aria-labelledby="sdil-highlights"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Heading */}
          <motion.h2
            id="sdil-highlights"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-[#2D274B] tracking-tight text-center"
          >
            Highlights of LEARNILM 🌎 WORLD
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-5 text-xl font-bold text-[#4B437C] max-w-2xl mx-auto text-center"
          >
            Our approach is designed to ensure effective learning, flexibility, and comprehensive support.
          </motion.p>

          {/* Image + Highlights */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <img
                src="https://tse1.mm.bing.net/th/id/OIP.wDczP_2HXmI-762eR-rEoQHaHa?w=612&h=612&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Learning Highlights"
                className="rounded-2xl shadow-md max-w-sm w-full object-cover"
              />
            </motion.div>

            {/* Right Bullet Points */}
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
              }}
              className="space-y-4 text-lg text-slate-800 list-disc list-inside"
            >
              {[
                "Flexible Timings",
                "Online Batches",
                "Certified Courses",
                "Expert Faculty",
                "Personalized Support & Guidance",
              ].map((point, idx) => (
                <motion.li
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                >
                  {point}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-16" aria-labelledby="faq-heading">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h3 id="faq-heading" className="text-4xl font-serif text-center font-extrabold">Frequently Asked Questions</h3>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between" aria-expanded={openFaq === i} aria-controls={`faq-${i}`}>
                  <div className="text-left">
                    <div className="font-bold text-lg">{f.q}</div>
                    {openFaq === i && <div id={`faq-${i}`} className="text-base font-bold text-[#4B437C] mt-2">{f.a}</div>}
                  </div>
                  <div className="ml-4">
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown />
                    </motion.div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA  bg-gradient-to-r from-[#9787F3]/10 to-[#f97316]/8*/}
      <section className="py-12 ">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h4 className="text-4xl font-extrabold">Start speaking confidently</h4>
          <p className="text-white text-xl font-bold mt-2">Sign up now and claim your free trial lesson. Get personalized recommendations and a 7-day plan after your first session.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/main" className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[#CBE56A] text-[#2D274B]">Browse trainers <ChevronRight /></Link>
            <Link to="/register" className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border bg-[#CBE56A] border-[#CBE56A] text-[#2D274B] hover:bg-[#CBE56A]">Become a trainer</Link>
          </div>
        </div>
      </section>

      {/* Footer - expanded */}
      <footer className="bg-[#6b48af] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-semibold text-lg">LearnILmWorld</div>
            <div className="text-sm text-slate-300 mt-2">© {new Date().getFullYear()} LearnILmWorld — All rights reserved</div>
            <div className="mt-4 text-sm text-slate-300">Email: hello@LearnILmWorld.example</div>
            <div className="text-sm text-slate-300">Phone: +1 (555) 123-4567</div>
          </div>

          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Resources</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link to="/help" className="hover:underline">Help Center</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Stay in touch</div>
            

            <div className="mt-4 flex items-center gap-3 text-slate-300">
              <a href="#" aria-label="Facebook"><Facebook /></a>
              <a href="#" aria-label="Twitter"><Twitter /></a>
              <a href="#" aria-label="Instagram"><Instagram /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin /></a>
            </div>
            <div className='Logo'>
              <img src={logo} width={'150px'} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 border-t border-white/10 pt-6 text-sm  flex flex-col sm:flex-row justify-between">
          <div>Made with ❤️ in LearnILmWorld</div>
          <div className="mt-3 sm:mt-0">Version 1.0 • Privacy policy</div>
        </div>
      </footer>
    </div>
  )
}
