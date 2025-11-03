import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight,Facebook, Twitter, Instagram, Linkedin
} from "lucide-react";
import { Container, Nav, Offcanvas, Button } from "react-bootstrap";
import logo from '../assets/LearnilmworldLogo.jpg'

import image1 from '../assets/become-trainer.png'



const BecomeTrainer: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  return (
    <div className="bg-[#dc8d33] min-h-screen text-[#2D274B]">

        <header className="sticky top-0 z-40 bg-[#dc8d33]/85 backdrop-blur-sm border-b border-white/40">
          <Container className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  {/* Main Logo */}
                  <Link to="/">
                  <div className="text-2xl md:text-3xl font-[Good Vibes] font-extrabold tracking-wide relative inline-flex items-center">
                    <span className="text-[#2D274B]">
                      LEARNILM
                    </span>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="inline-block mx-1 text-3xl"
                    >
                      🌎
                    </motion.span>
                    <span className="text-[#2D274B]">
                      WORLD
                    </span>
                    {/* <motion.div
                      className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full blur-xl pointer-events-none"
                      animate={{ x: [-200, 200] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    /> */}
                  </div>
                  </Link>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex items-center gap-6">
                <Link to="/main" className="text-sm font-semibold hover:text-[#CBE56A]">
                  Browse our Mentors
                </Link>

                <Link to="/login" className="text-sm font-semibold  hover:text-[#CBE56A]">
                  Sign In
                </Link>
              </nav>

              {/* Mobile Navigation */}
              <div className="sm:hidden">
                <Button
                  variant="light"
                  onClick={() => setShowOffcanvas(true)}
                  aria-label="Open menu"
                >
                  ☰
                </Button>

                <Offcanvas
                  show={showOffcanvas}
                  onHide={() => setShowOffcanvas(false)}
                  placement="end"
                  aria-labelledby="offcanvas-nav"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="offcanvas-nav">Menu</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <Nav className="flex-column gap-2">
                      <Nav.Link
                        as={Link}
                        to="/trainers"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Trainers
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/login"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Sign In
                      </Nav.Link>
                    </Nav>
                  </Offcanvas.Body>
                </Offcanvas>
              </div>
            </div>
          </Container>
        </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-[#2D274B] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Empower Learners, Inspire Growth 🌟
        </motion.h1>
        <motion.p
          className="max-w-2xl font-bold text-xl md:text-2xl text-white mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Join LearnILm🌍World as a Trainer and help students achieve their goals while
          growing your career in a flexible, rewarding environment.
        </motion.p>
        <motion.button
          onClick={() => navigate("/register?role=trainer")}
          className="px-8 py-4 bg-[#CBE56A] text-[#2D274B] font-semibold text-lg rounded-full shadow-lg hover:bg-[#CBE56A] transition-all"
          whileHover={{ scale: 1.05 }}
        >
          Join as a Trainer
        </motion.button>
      </section>

      {/* Image + Text Section */}
      <section className="py-20 px-6 md:px-16 flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl mx-auto">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-4xl font-bold text-[#2D274B]">
            Teach, Inspire, and Make a Difference
          </h2>
          <p className="text-lg font-bold text-white leading-relaxed">
            At LearnILmWorld, we believe in empowering individuals through knowledge.
            As a trainer, you’ll help learners from diverse backgrounds gain confidence,
            improve communication, and unlock new opportunities in their lives.
          </p>
          <ul className="list-disc list-inside text-white font-bold space-y-2">
            <li>Flexible working hours and teaching freedom</li>
            <li>Access to a supportive and growing learning community</li>
            <li>Opportunity to reach learners from around the world</li>
          </ul>
          <button
            onClick={() => navigate("/register?role=trainer")}
            className="mt-6 px-8 py-3 bg-[#CBE56A] text-[#2D274B] rounded-full font-semibold hover:bg-[#CBE56A] transition-all"
          >
            Become a Trainer Today
          </button>
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={image1}
            alt="Trainer Illustration"
            className="rounded-2xl shadow-lg max-w-l w-full object-cover"
          />
        </motion.div>
      </section>

      {/* Global Teaching Section */}
      <section className="py-20 px-6 md:px-16  flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl mx-auto rounded-2xl shadow-sm">
        {/* Left Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-4xl font-bold text-[#2D274B]">
            Empower Learners Across 150+ Countries 🌍
          </h2>
          <p className="text-lg text-white font-semibold leading-relaxed">
           Be part of LearnILm 🌎 World — where passionate educators and curious learners come together. Shape the future of learning and grow with our expanding global community. <br/>
            {/* <span className="font-semibold text-[#8CA0E5]">800,000+</span> students.  */}
            {/* Join us and get all the tools you need to teach, inspire, and grow. */}
          </p>
          <ul className="space-y-3 text-white font-semibold">
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Continuous Flow of Learners — Reach motivated students from around the world.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Smart Scheduling Tools — Manage your sessions effortlessly with our intuitive calendar.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Interactive Virtual Classrooms — Engage your students with real-time learning tools.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Secure & Flexible Payments — Get paid easily, wherever you are.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Growth-Focused Training — Access exclusive webinars and teaching resources.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2D274B] text-xl">✔</span>
              Thriving Educator Community — Connect, share, and collaborate with fellow mentors.
            </li>
          </ul>
          <button
            onClick={() => navigate("/register?role=trainer")}
            className="mt-8 px-8 py-3 bg-[#CBE56A] hover:bg-[#bdda54] text-[#2D274B] rounded-full font-bold  transition-all shadow-md"
          >
            Create Your Tutor Profile
          </button>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={image1}
            alt="Global teaching"
            className="rounded-2xl shadow-lg w-full max-w-lg object-cover"
          />
        </motion.div>
      </section>


      {/* Benefits Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#2D274B] mb-12">
          Why Teach with LearnILmWorld?
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto ">
          {[
            {
              title: "Flexible Schedule",
              desc: "Teach at your convenience from anywhere. Your time, your rules.",
              icon: "⏰",
            },
            {
              title: "Global Reach",
              desc: "Connect with students worldwide and make an impact beyond boundaries.",
              icon: "🌍",
            },
            {
              title: "Rewarding Experience",
              desc: "Earn while helping learners achieve their dreams — a win for everyone.",
              icon: "💼",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-blue-50 rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all hover:bg-[#e5f2b4] font-semibold"
              whileHover={{ scale: 1.03 }}
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-[#8CA0E5] mb-2">{item.title}</h3>
              <p className="text-[#2D274B] font-semibold">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section - trainer review */}
      <section className=" py-20 px-6">
        <h2 className="text-5xl md:text-4xl sm:text-3xl font-bold text-center mb-12 text-[#2D274B]">
          Straight from the Heart ❤️
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 ">
          {[
            {
              quote:
                "Teaching at LearnOsphere has given me the freedom to connect with passionate learners and grow my skills every day.",
              name: "Aarav Sharma",
              role: "IELTS Trainer",
            },
            {
              quote:
                "The best part is the flexibility — I can teach students globally from the comfort of my home.",
              name: "Neha Verma",
              role: "Spoken English Coach",
            },
            {
              quote:
                "LearnOsphere’s community of trainers is amazing. You always feel supported and valued.",
              name: "Ravi Kumar",
              role: "Communication Skills Trainer",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              className="bg-blue-50 rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all hover:bg-[#e5f2b4] font-semibold"
              whileHover={{ scale: 1.02 }}
            >
              <p className="italic text-[#2D274B] mb-4">“{t.quote}”</p>
              <div className="font-bold text-blue-700">{t.name}</div>
              <div className="text-sm font-bold text-[#2D274B]">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

     

      {/* Trainer FAQs Section */}
      <section
        className="py-14 "
        aria-labelledby="trainer-faq"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="trainer-faq"
              className="text-4xl md:text-4xl font-bold text-[#2D274B]"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-[#2D274B] text-lg font-bold max-w-2xl mx-auto">
              Everything you need to know before starting your teaching journey with
              LearnILm🌎World.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What kind of trainers do you look for?",
                a: "We welcome anyone passionate about teaching — no formal certification needed. If you love sharing knowledge, have good communication skills, and can personalize learning for global students, you’re a great fit.",
              },
              {
                q: "What subjects can I teach?",
                a: "You can teach from a wide range — from languages to academic and skill-based subjects. If you’re skilled in something, there’s likely a learner waiting for you!",
              },
              {
                q: "How do I become a trainer?",
                a: "Simply create your trainer profile, upload a photo, describe your teaching style, and record a short intro video. Once you complete these steps, our team reviews your profile within 2–3 business days.",
              },
              {
                q: "How can I get my profile approved quickly?",
                a: "Use a clear, real photo, add a short 1–2 minute video, and write an authentic description of your strengths. Avoid adding contact details or pricing in your profile to speed up approval.",
              },
              {
                q: "Why teach with LearnILm🌎World?",
                a: "You earn while helping students learn, set your own schedule, reach learners globally, and receive secure payments. Plus, you get access to growth webinars, community support, and built-in teaching tools.",
              },
              {
                q: "How much can I earn?",
                a: "Top trainers earn between ₹15,000–₹65,000 ($180–$780) per month depending on your hourly rate, session count, and student retention. You can adjust your rates anytime.",
              },
              {
                q: "What equipment do I need?",
                a: "A laptop or desktop, stable internet, webcam, and microphone are all you need to teach effectively in our virtual classroom.",
              },
              {
                q: "Is there any joining cost?",
                a: "It’s completely free to create your profile and start teaching. Learn🌎Sphere only takes a small commission per lesson to maintain platform quality and marketing reach.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg bg-white shadow-sm font-bold hover:shadow-md transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-left text-[#2D274B] font-bold text-base focus:outline-none"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronDown className="w-4 h-4 text-[#0ea5a3]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-4 text-slate-600 text-sm leading- font-bold"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


       {/* Call to Action Section */}
      <section className="text-center py-20 px-6 bg-[#dc8d33]">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-6 text-[#2D274B]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Ready to Start Your Journey as a Trainer?
        </motion.h2>
        <motion.button
          onClick={() => navigate("/register?role=trainer")}
          className="px-10 py-4  bg-[#CBE56A] hover:bg-[#bdda54] text-[#2D274B] font-semibold text-lg rounded-full shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
        >
          Get Started Now
        </motion.button>
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
  );
};

export default BecomeTrainer;



// Empower Learners Across 180+ Countries

// At LearnOSphere, educators connect with a global community of over 800,000 students. Join us and get all the tools you need to teach, inspire, and grow.

// ✅ Continuous Flow of Learners — Reach motivated students from around the world.
// ✅ Smart Scheduling Tools — Manage your sessions effortlessly with our intuitive calendar.
// ✅ Interactive Virtual Classrooms — Engage your students with real-time learning tools.
// ✅ Secure & Flexible Payments — Get paid easily, wherever you are.
// ✅ Growth-Focused Training — Access exclusive webinars and teaching resources.
// ✅ Thriving Educator Community — Connect, share, and collaborate with fellow mentors.
