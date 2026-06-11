'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Website Development',
    description: 'Custom-built websites optimized for performance, conversion, and user experience.',
    features: [
      'Responsive Design',
      'Fast Loading (90+ Lighthouse)',
      'SEO Optimized',
      'Mobile-First Approach',
      'Progressive Enhancement',
      'Accessibility Compliance',
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'TailwindCSS'],
  },
  {
    title: 'Web Applications',
    description: 'Scalable web applications with modern architecture and best-in-class UX.',
    features: [
      'Real-time Synchronization',
      'Cloud Scalability',
      'Enterprise-Ready',
      'Advanced Security',
      'API Integration',
      'Performance Monitoring',
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'GraphQL'],
  },
  {
    title: 'UI/UX Design',
    description: 'Thoughtful design that balances aesthetics with functionality.',
    features: [
      'User Research',
      'Prototyping & Wireframing',
      'Design Systems',
      'Usability Testing',
      'Accessibility Design',
      'Brand Integration',
    ],
    technologies: ['Figma', 'Webflow', 'Adobe Creative Suite'],
  },
  {
    title: 'AI Integrations',
    description: 'Leverage AI to automate processes and unlock new possibilities.',
    features: [
      'LLM Integration',
      'Intelligent Automation',
      'Machine Learning Models',
      'Natural Language Processing',
      'Computer Vision',
      'Analytics & Insights',
    ],
    technologies: ['OpenAI', 'LangChain', 'TensorFlow', 'Python'],
  },
  {
    title: 'Automation Systems',
    description: 'Streamline your workflows with intelligent automation solutions.',
    features: [
      'Process Automation',
      'Workflow Optimization',
      'Integration Solutions',
      'Error Handling',
      'Monitoring & Alerts',
      'Continuous Improvement',
    ],
    technologies: ['Node.js', 'Python', 'Zapier', 'Custom APIs'],
  },
  {
    title: 'Digital Transformation',
    description: 'Complete digital overhaul to modernize your business operations.',
    features: [
      'Strategic Planning',
      'Technology Implementation',
      'Change Management',
      'Team Training',
      'Long-term Support',
      'Performance Analytics',
    ],
    technologies: ['Cloud Platforms', 'Modern Stack', 'DevOps Tools'],
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

export default function ServicesPage() {
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
            Our Services
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Comprehensive digital solutions tailored to your business needs and growth objectives
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-card flex flex-col h-full"
            >
              <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <p className="text-foreground/70 mb-6">{service.description}</p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-primary mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/60">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <h4 className="text-sm font-semibold text-primary mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech, i) => (
                    <span key={i} className="text-xs px-3 py-1 glass-sm text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
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
            Let&apos;s discuss how we can help transform your business
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
