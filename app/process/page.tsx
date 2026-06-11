'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

const processSteps = [
  {
    number: '01',
    title: 'Discovery & Research',
    description: 'We deep dive into your business, market, and users to understand the opportunity and challenges.',
    details: [
      'Business goal alignment',
      'Market analysis',
      'User research',
      'Competitive landscape',
      'Technical assessment',
    ],
    duration: '1-2 weeks',
  },
  {
    number: '02',
    title: 'Strategy & Planning',
    description: 'We develop a comprehensive strategy that outlines the approach, timeline, and roadmap.',
    details: [
      'Strategic framework',
      'Project roadmap',
      'Technology stack selection',
      'Resource allocation',
      'Risk mitigation',
    ],
    duration: '1 week',
  },
  {
    number: '03',
    title: 'Design & Prototyping',
    description: 'Our design team creates beautiful, user-centric interfaces with interactive prototypes.',
    details: [
      'Wireframing',
      'UI/UX design',
      'Design system creation',
      'Interactive prototypes',
      'Stakeholder review',
    ],
    duration: '2-3 weeks',
  },
  {
    number: '04',
    title: 'Development & Build',
    description: 'Our engineers build a robust, scalable solution using modern technologies and best practices.',
    details: [
      'Frontend development',
      'Backend architecture',
      'Database design',
      'API integration',
      'Quality assurance',
    ],
    duration: '4-8 weeks',
  },
  {
    number: '05',
    title: 'Testing & Optimization',
    description: 'Comprehensive testing ensures performance, security, and user experience excellence.',
    details: [
      'Functional testing',
      'Performance optimization',
      'Security audit',
      'User acceptance testing',
      'Bug fixes',
    ],
    duration: '1-2 weeks',
  },
  {
    number: '06',
    title: 'Launch & Support',
    description: 'We launch with confidence and provide ongoing support for sustained success.',
    details: [
      'Deployment',
      'Launch monitoring',
      'Performance tracking',
      'Maintenance support',
      'Continuous optimization',
    ],
    duration: 'Ongoing',
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

export default function ProcessPage() {
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
            Our Process
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            A proven 6-step framework that delivers exceptional results and sustainable success
          </p>
        </motion.div>
      </section>

      {/* Process Steps */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className={`glass-card flex flex-col lg:flex-row gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Number and Title Section */}
              <div className="lg:w-1/3 flex flex-col justify-center">
                <div className="text-6xl font-bold gradient-text mb-4">{step.number}</div>
                <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                <p className="text-foreground/70 mb-6">{step.description}</p>
                <div className="inline-block">
                  <span className="text-sm px-3 py-1 glass-sm text-primary font-medium">
                    Duration: {step.duration}
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                      <span className="text-foreground/70">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why This Process */}
      <section className="section-container py-20 border-y border-white/[0.12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why This Process Works</h2>
          <p className="text-xl text-foreground/60">Key principles that ensure project success</p>
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
              title: 'Collaboration',
              description: 'Your team is involved at every stage, ensuring alignment and ownership.',
            },
            {
              title: 'Transparency',
              description: 'Clear communication and regular updates keep everyone informed and engaged.',
            },
            {
              title: 'Quality',
              description: 'Rigorous testing and optimization ensure a polished, high-performing solution.',
            },
            {
              title: 'Flexibility',
              description: 'We adapt to your needs and changing requirements throughout the project.',
            },
            {
              title: 'Scalability',
              description: 'Solutions are built to grow with your business and evolving demands.',
            },
            {
              title: 'Support',
              description: 'Our relationship doesn\'t end at launch—we provide ongoing optimization.',
            },
          ].map((principle, index) => (
            <motion.div key={index} variants={item} className="glass-card">
              <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
              <p className="text-foreground/70">{principle.description}</p>
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
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Let&apos;s discuss your project and create a roadmap for success
          </p>
          <Link
            href="/contact"
            className="premium-button-primary inline-flex items-center gap-2 group"
          >
            Schedule a Consultation
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
