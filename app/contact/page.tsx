'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="section-container pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Let&apos;s discuss your project and how we can help you achieve your digital goals
          </p>
        </motion.div>
      </section>

      {/* Contact Info & Form */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Contact Information */}
          <motion.div variants={item} className="lg:col-span-1 space-y-6">
            {/* Phone */}
            <div className="glass-card flex flex-col items-start gap-3">
              <div className="p-3 glass-sm">
                <Phone size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <a href="tel:+441753" className="text-foreground/60 hover:text-primary transition-colors">
                  +44 7575 509767
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="glass-card flex flex-col items-start gap-3">
              <div className="p-3 glass-sm">
                <Mail size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a href="mailto:hello@rutlandprojects.co.uk" className="text-foreground/60 hover:text-primary transition-colors">
                  info@rutlandprojects.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="glass-card flex flex-col items-start gap-3">
              <div className="p-3 glass-sm">
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-foreground/60 text-sm">
                  5 St. Pauls Avenue<br />
                  Slough, Berkshire<br />
                  SL2 5EX, United Kingdom
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={item} className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="+44 (0) 1234 567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="premium-button-primary w-full flex items-center justify-center gap-2 group"
              >
                Send Message
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/20 border border-primary rounded-lg text-primary text-center"
                >
                  Thank you! We&apos;ll be in touch shortly.
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="section-container py-20 border-t border-white/[0.12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">What&apos;s Next?</h2>
          <p className="text-xl text-foreground/60">Our process</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              step: '01',
              title: 'Discovery Call',
              description: 'We&apos;ll schedule a 30-minute call to understand your project, goals, and requirements.',
            },
            {
              step: '02',
              title: 'Proposal',
              description: 'We&apos;ll prepare a detailed proposal outlining scope, timeline, and investment.',
            },
            {
              step: '03',
              title: 'Kickoff',
              description: 'Once approved, we&apos;ll kick off your project and assign a dedicated project manager.',
            },
          ].map((process, index) => (
            <motion.div key={index} variants={item} className="glass-card text-center">
              <div className="text-4xl font-bold gradient-text mb-4">{process.step}</div>
              <h3 className="text-xl font-bold mb-3">{process.title}</h3>
              <p className="text-foreground/60">{process.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
