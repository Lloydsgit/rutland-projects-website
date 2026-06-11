'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BarChart3, Zap, Briefcase, Lock, TrendingUp, Package } from 'lucide-react'

const industries = [
  {
    icon: Briefcase,
    title: 'Professional Services',
    description: 'Streamline client management and project delivery with custom solutions.',
    solutions: ['Client portals', 'Project tracking', 'Document management', 'Billing systems'],
  },
  {
    icon: Lock,
    title: 'Finance & Banking',
    description: 'Enterprise-grade solutions with top security and compliance standards.',
    solutions: ['Payment systems', 'Risk analytics', 'Compliance tracking', 'Trading platforms'],
  },
  {
    icon: Zap,
    title: 'Technology',
    description: 'B2B and B2C platforms built for scale, performance, and innovation.',
    solutions: ['SaaS platforms', 'APIs & integrations', 'Cloud infrastructure', 'DevOps'],
  },
  {
    icon: TrendingUp,
    title: 'E-Commerce & Retail',
    description: 'High-converting digital storefronts that drive sales and customer loyalty.',
    solutions: ['Online stores', 'Inventory management', 'Personalization', 'Analytics'],
  },
  {
    icon: BarChart3,
    title: 'Healthcare',
    description: 'HIPAA-compliant solutions that improve patient care and operations.',
    solutions: ['Patient portals', 'Telemedicine', 'EHR systems', 'Appointment booking'],
  },
  {
    icon: Package,
    title: 'Manufacturing & Logistics',
    description: 'Real-time visibility and optimization across your supply chain.',
    solutions: ['Inventory systems', 'Fleet tracking', 'Warehouse management', 'Forecasting'],
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

export default function IndustriesPage() {
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
            Industries We Serve
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Deep expertise across diverse sectors, enabling us to understand your unique challenges
          </p>
        </motion.div>
      </section>

      {/* Industries Grid */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {industries.map((industry, index) => {
            const Icon = industry.icon
            return (
              <motion.div key={index} variants={item} className="group glass-card">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 glass-sm">
                    <Icon size={28} className="text-primary group-hover:text-accent transition-colors" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3">{industry.title}</h3>
                <p className="text-foreground/70 mb-6">{industry.description}</p>

                <div>
                  <h4 className="text-sm font-semibold text-primary mb-3">Solutions We Provide</h4>
                  <ul className="space-y-2">
                    {industry.solutions.map((solution, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/60">
                        <span className="text-primary">→</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Why Us */}
      <section className="section-container py-20 border-y border-white/[0.12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose Rutland Projects</h2>
          <p className="text-xl text-foreground/60">For your industry challenges</p>
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
              title: 'Industry Expertise',
              description: 'We understand sector-specific challenges, compliance requirements, and best practices.',
            },
            {
              title: 'Proven Track Record',
              description: 'Successful deployments across multiple industries demonstrate our versatility.',
            },
            {
              title: 'Custom Solutions',
              description: 'We build tailored solutions that address your unique business requirements.',
            },
          ].map((reason, index) => (
            <motion.div key={index} variants={item} className="glass-card">
              <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
              <p className="text-foreground/70">{reason.description}</p>
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
          <h2 className="text-4xl font-bold mb-6">Let&apos;s discuss your industry needs</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Our experts can help you identify opportunities and create a strategy for success
          </p>
          <Link
            href="/contact"
            className="premium-button-primary inline-flex items-center gap-2 group"
          >
            Schedule a Discovery Call
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
