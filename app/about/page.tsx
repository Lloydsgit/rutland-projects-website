'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const values = [
  {
    title: 'Excellence',
    description: 'We deliver premium-quality solutions that exceed expectations and drive real business value.',
  },
  {
    title: 'Innovation',
    description: 'We stay ahead of technology trends and apply cutting-edge solutions to solve complex problems.',
  },
  {
    title: 'Partnership',
    description: 'We work as an extension of your team, invested in your long-term success and growth.',
  },
  {
    title: 'Transparency',
    description: 'We communicate clearly, keep you informed, and ensure complete alignment on goals and progress.',
  },
]

const timeline = [
  { year: '2016', milestone: 'Founded Rutland Projects' },
  { year: '2018', milestone: 'Expanded to 15+ team members' },
  { year: '2020', milestone: 'Launched AI solutions division' },
  { year: '2023', milestone: 'Delivered 150+ successful projects' },
  { year: '2024', milestone: 'Recognized as top digital agency in UK' },
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

export default function AboutPage() {
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
            About Rutland Projects
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            We&apos;re a team of digital craftspeople dedicated to engineering world-class digital experiences
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="section-container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-foreground/70 mb-4 leading-relaxed">
              Founded in 2016, Rutland Projects emerged from a simple belief: businesses deserve digital partners who genuinely understand their vision and have the expertise to bring it to life.
            </p>
            <p className="text-lg text-foreground/70 mb-4 leading-relaxed">
              What started as a small team of passionate developers has evolved into a full-service digital agency with a proven track record of delivering transformative solutions across diverse industries.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Today, we work with ambitious companies who demand excellence and are willing to invest in quality digital products that drive sustainable growth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 h-96 bg-gradient-to-br from-primary/20 to-accent/20"
          >
            {/* Placeholder for team image */}
            <div className="w-full h-full rounded-2xl bg-white/[0.05] flex items-center justify-center">
              <Image
                src="/about-hero.png"
                alt="Our Team"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-container py-20 border-y border-white/[0.12]">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          <motion.div variants={item} className="glass-card">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-foreground/70 leading-relaxed">
              To be the most trusted digital partner for ambitious businesses seeking to leverage technology for sustainable competitive advantage and growth.
            </p>
          </motion.div>

          <motion.div variants={item} className="glass-card">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-foreground/70 leading-relaxed">
              To design and deliver world-class digital solutions that transform how businesses operate, engage with customers, and compete in their markets.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
          <p className="text-xl text-foreground/60">What guides our decisions and shapes our culture</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {values.map((value, index) => (
            <motion.div key={index} variants={item} className="glass-card">
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-foreground/70">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
          <p className="text-xl text-foreground/60">Key milestones in our growth</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-card flex items-center gap-6"
            >
              <div className="text-3xl font-bold gradient-text">{item.year}</div>
              <div className="h-12 w-px bg-gradient-to-b from-primary to-accent"></div>
              <p className="text-lg text-foreground/70">{item.milestone}</p>
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
          <h2 className="text-4xl font-bold mb-6">Let&apos;s work together</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Interested in partnering with a digital agency that genuinely cares about your success?
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
