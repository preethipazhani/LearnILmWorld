import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Phone, HelpCircle, FileText, BookOpen } from "lucide-react"
import { Navbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap'

export default function AboutPage() {
  const location = useLocation()
  const [showOffcanvas, setShowOffcanvas] = useState(false)

  // Scroll to specific section when link with hash is clicked (like /about#contact)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [location])

  return (
    <div className="min-h-screen font-inter bg-[#dc8d33] text-[#2D274B] scroll-smooth">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#dc8d33]/95 backdrop-blur-sm border-b border-white/30 text-[#8CA0E5]">

        <Container className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div className="flex flex-col items-center gap-1">

                {/* Main Logo */}
                <div className="text-2xl md:text-3xl font-[Good Vibes] font-extrabold tracking-wide relative inline-flex items-center"> 
                  
                  {/* LEARN */} 
                  <span className="bg-gradient-to-r from-black via-gray-800 to-[#8EA6ED] bg-clip-text text-transparent drop-shadow-lg"> LEARNILM </span> 
                   {/* World */} 
                  <span className="bg-gradient-to-r from-black via-gray-800 to-[#8EA6ED] bg-clip-text text-transparent drop-shadow-lg"> WORLD </span> 
                  {/* Rotating Globe */} 
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} className="inline-block mx-1 text-3xl" > 🌎 </motion.span> 
                 
                  {/* Optional subtle shine */} 
                  <motion.div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full blur-xl pointer-events-none" animate={{ x: [-200, 200] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} /> 
                </div>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-6">
              <Link to="/main" className="text-sm text-[#8CA0E5] font-medium hover:text-[#CBE56A]">Browse our Mentors</Link>
              
              
              <Link to="/login" className="text-sm font-medium text-[#8CA0E5] hover:text-[#CBE56A]">Sign In</Link>
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

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 bg-[#dc8d33]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-serif font-extrabold text-[#9787F3]"
          >
            About Learnilm 🌎
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-xl text-white font-bold leading-relaxed max-w-3xl mx-auto"
          >
            At Learnilm World, we connect students with expert trainers across the
            globe to master languages, subjects, and skills through personalized
            1-on-1 sessions. Our mission is to empower learners with real-world
            communication and practical confidence.
          </motion.p>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact" className="py-24 px-6 bg-[#2D274B] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif font-bold text-[#CBE56A]"
          >
            Contact Us
          </motion.h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">
            Have questions, suggestions, or feedback? Reach out — we’d love to hear from you.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <Mail size={36} className="text-[#9787F3] mb-2" />
              <p className="text-lg font-semibold">support@learnilmworld.com</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone size={36} className="text-[#9787F3] mb-2" />
              <p className="text-lg font-semibold">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="blog" className="py-24 px-6 bg-[#dc8d33] text-[#2D274B]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-serif font-bold text-[#9787F3]"
          >
            Our Blog
          </motion.h2>
          <p className="mt-5 text-lg text-white font-semibold max-w-3xl mx-auto">
            Insights, tips, and stories from the Learnilm community. Stay tuned for our latest updates!
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {["Language Mastery", "Online Learning", "Trainer Tips"].map((title, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/80 p-6 rounded-2xl shadow hover:scale-105 transition"
              >
                <BookOpen size={36} className="text-[#9787F3] mb-3 mx-auto" />
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-[#4B437C]">
                  Dive into curated articles on improving communication, finding mentors,
                  and mastering new skills at your own pace.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HELP CENTER SECTION */}
      <section id="help" className="py-24 px-6 bg-[#2D274B] text-white">
        <div className="max-w-6xl mx-auto text-center">
          <HelpCircle size={40} className="mx-auto mb-4 text-[#CBE56A]" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif font-bold text-[#CBE56A]"
          >
            Help Center
          </motion.h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-200">
            Get answers to frequently asked questions, troubleshooting guides, and
            community support resources all in one place.
          </p>
        </div>
      </section>

      {/* TERMS & POLICY SECTION */}
      <section id="terms" className="py-24 px-6 bg-[#dc8d33] text-[#2D274B]">
        <div className="max-w-6xl mx-auto text-center">
          <FileText size={40} className="mx-auto mb-4 text-[#9787F3]" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif font-bold text-[#9787F3]"
          >
            Terms & Privacy Policy
          </motion.h2>
          <p className="mt-4 text-lg text-white font-semibold max-w-3xl mx-auto">
            We value your privacy and transparency. Our terms outline your rights,
            data protection, and fair usage of the Learnilm platform.
          </p>
          <div className="mt-8">
            <Link
              to="/privacy"
              className="inline-block px-6 py-3 bg-[#CBE56A] text-[#2D274B] font-bold rounded-full hover:scale-105 transition"
            >
              Read Full Policy
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D274B] text-gray-400 text-center py-6 text-sm">
        © {new Date().getFullYear()} Learnilm World — All rights reserved.
      </footer>
    </div>
  )
}
