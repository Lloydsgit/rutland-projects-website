'use client'

import { motion } from 'framer-motion'
import { Code2, Smartphone, Palette, Zap, Brain, Cog } from 'lucide-react'
import { useState } from 'react'

const services = [
  {
    icon: Code2,
    title: 'Website Development',
    description: 'Custom-built websites optimized for performance, conversion, and user experience.',
    features: ['Responsive Design', 'Fast Loading', 'SEO Optimized'],
  },
  {
    icon: Smartphone,
    title: 'Web Applications',
    description: 'Scalable web applications with modern architecture and best-in-class UX.',
    features: ['Real-time Sync', 'Scalability', 'Enterprise Ready'],
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Thoughtful design that balances aesthetics with functionality.',
    features: ['User Research', 'Prototyping', 'Design Systems'],
  },
  {
    icon: Brain,
    title: 'AI Integrations',
    description: 'Leverage AI to automate processes and unlock new possibilities.',
    features: ['LLM Integration', 'Automation', 'Analytics'],
  },
  {
    icon: Cog,
    title: 'Automation Systems',
    description: 'Streamline your workflows with intelligent automation solutions.',
    features: ['Process Automation', 'Integration', 'Optimization'],
  },
  {
    icon: Zap,
    title: 'Digital Transformation',
    description: 'Complete digital overhaul to modernize your business operations.',
    features: ['Strategy', 'Implementation', 'Support'],
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

export function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="section-container">
      <div className="mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Our Services
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-foreground/60 max-w-2xl mx-auto"
        >
          Comprehensive digital solutions tailored to your business needs
        </motion.p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <motion.div
              key={index}
              variants={item}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <div className="glass-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 glass-sm">
                    <Icon size={24} className="text-primary group-hover:text-accent transition-colors" />
                  </div>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-primary"
                    >
                      ↗
                    </motion.div>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">
                  {service.title}
                </h3>
                <p className="text-foreground/60 mb-4 text-sm">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 glass-sm text-primary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
