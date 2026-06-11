'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const openRoles = [
  {
    id: 1,
    title: 'Senior React Developer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Slough, UK (Hybrid)',
    experience: '5+ years',
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    department: 'Design',
    type: 'Full-time',
    location: 'Slough, UK (Hybrid)',
    experience: '3+ years',
  },
  {
    id: 3,
    title: 'Project Manager',
    department: 'Operations',
    type: 'Full-time',
    location: 'Slough, UK (On-site)',
    experience: '4+ years',
  },
  {
    id: 4,
    title: 'Backend Engineer (Node.js)',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Slough, UK (Hybrid)',
    experience: '4+ years',
  },
  {
    id: 5,
    title: 'AI/ML Engineer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Slough, UK (Hybrid)',
    experience: '3+ years',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Slough, UK (Remote)',
    experience: '3+ years',
  },
]

const benefits = [
  'Competitive salary',
  'Health insurance',
  'Professional development',
  'Flexible working',
  'Team outings',
  'Latest tech',
  'Mentorship program',
  'Performance bonus',
]

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

export default function CareersPage() {
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
            Join Our Team
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Work with talented people building world-class digital solutions for innovative companies
          </p>
        </motion.div>
      </section>

      {/* Culture */}
      <section className="section-container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Our Culture</h2>
          <p className="text-xl text-foreground/60">What it&apos;s like to work at Rutland Projects</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {[
            {
              title: 'Innovation First',
              description: 'We encourage creative thinking and reward excellence in everything we do.',
            },
            {
              title: 'Collaborative Spirit',
              description: 'Strong teamwork, open communication, and mutual respect define our culture.',
            },
            {
              title: 'Continuous Learning',
              description: 'We invest in your growth with training, mentorship, and new opportunities.',
            },
          ].map((value, index) => (
            <motion.div key={index} variants={item} className="glass-card">
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-foreground/70">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <div className="glass-card p-12">
          <h3 className="text-2xl font-bold mb-8 text-center">Benefits & Perks</h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={item}
                className="flex items-center gap-3"
              >
                <span className="text-primary text-2xl">✓</span>
                <span className="font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="section-container py-20 border-y border-white/[0.12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Open Positions</h2>
          <p className="text-xl text-foreground/60">{openRoles.length} exciting opportunities</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {openRoles.map((role) => (
            <motion.div
              key={role.id}
              variants={item}
              className="glass-card flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:bg-white/[0.12] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                  {role.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
                  <span className="px-2 py-1 glass-sm">{role.department}</span>
                  <span className="px-2 py-1 glass-sm">{role.type}</span>
                  <span className="px-2 py-1 glass-sm">{role.location}</span>
                  <span className="px-2 py-1 glass-sm">{role.experience}</span>
                </div>
              </div>
              <button className="premium-button-secondary flex items-center gap-2 group/btn">
                Apply Now
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="section-container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-20 text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Don&apos;t see the right role?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Send us your CV and let us know what you&apos;re looking for
          </p>
          <Link
            href="/contact"
            className="premium-button-primary inline-flex items-center gap-2 group"
          >
            Get in Touch
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
