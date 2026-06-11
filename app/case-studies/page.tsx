'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Users, Zap, Award, Heart } from 'lucide-react'

const caseStudies = [
  {
    id: 1,
    title: 'FinTech Startup - 3x Growth in 6 Months',
    description: 'How a digital transformation initiative helped a fintech startup scale their operations',
    challenge: 'Manual processes limiting growth',
    solution: 'Built automated platform',
    result: '3x revenue growth',
  },
  {
    id: 2,
    title: 'E-Commerce Giant - 250% Conversion Boost',
    description: 'Redesigning and rebuilding an e-commerce platform resulted in massive conversion improvements',
    challenge: 'Poor UX driving cart abandonment',
    solution: 'Redesigned entire platform',
    result: '250% conversion increase',
  },
  {
    id: 3,
    title: 'Healthcare Provider - Patient Portal Success',
    description: 'Implementing a HIPAA-compliant patient portal improved engagement and reduced support costs',
    challenge: 'No digital patient engagement',
    solution: 'Built secure portal',
    result: '85% patient adoption',
  },
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

export default function CaseStudiesPage() {
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
            Success Stories
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Real results from real partnerships with ambitious companies
          </p>
        </motion.div>
      </section>

      {/* Case Studies */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {caseStudies.map((caseStudy, index) => (
            <motion.div key={index} variants={item} className="glass-card group cursor-pointer">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content */}
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold mb-3 group-hover:gradient-text transition-all">
                    {caseStudy.title}
                  </h3>
                  <p className="text-lg text-foreground/70 mb-8">{caseStudy.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-2">The Challenge</h4>
                      <p className="text-foreground/60">{caseStudy.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-2">Our Solution</h4>
                      <p className="text-foreground/60">{caseStudy.solution}</p>
                    </div>
                  </div>
                </div>

                {/* Result Box */}
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 text-center w-full">
                    <Award size={40} className="text-primary mx-auto mb-4" />
                    <p className="text-sm text-foreground/60 mb-2">Result</p>
                    <p className="text-2xl font-bold">{caseStudy.result}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="section-container py-20 border-y border-white/[0.12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Companies Choose Us</h2>
          <p className="text-xl text-foreground/60">Proven benefits our clients experience</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {[
            {
              icon: Zap,
              title: 'Measurable Results',
              description: 'We focus on metrics that matter to your bottom line—revenue, efficiency, growth.',
            },
            {
              icon: Users,
              title: 'Expert Team',
              description: 'Experienced designers, engineers, and strategists who deliver excellence.',
            },
            {
              icon: Award,
              title: 'Quality Guarantee',
              description: 'Rigorous testing and optimization ensure a solution that exceeds expectations.',
            },
            {
              icon: Heart,
              title: 'Long-term Partnership',
              description: 'We continue supporting and optimizing your solution long after launch.',
            },
          ].map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div key={index} variants={item} className="glass-card flex items-start gap-4">
                <div className="p-3 glass-sm flex-shrink-0">
                  <Icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-foreground/70">{benefit.description}</p>
                </div>
              </motion.div>
            )
          })}
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
          <h2 className="text-4xl font-bold mb-6">Ready for Your Success Story?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Let&apos;s discuss how we can create similar results for your business
          </p>
          <Link
            href="/contact"
            className="premium-button-primary inline-flex items-center gap-2 group"
          >
            Start Your Project
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
