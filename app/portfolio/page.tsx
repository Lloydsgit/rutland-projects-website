'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { Filter } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform Redesign',
    category: 'E-Commerce',
    image: '/portfolio-1.png',
    description: 'Complete redesign and rebuild of a mid-market e-commerce platform',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    impact: '250% increase in conversion rate',
  },
  {
    id: 2,
    title: 'AI-Powered SaaS Dashboard',
    category: 'SaaS',
    image: '/portfolio-2.png',
    description: 'Advanced analytics platform with machine learning integration',
    technologies: ['Next.js', 'Python', 'TensorFlow'],
    impact: '90+ Lighthouse Score',
  },
  {
    id: 3,
    title: 'Enterprise Automation System',
    category: 'Automation',
    image: '/portfolio-3.png',
    description: 'Streamlined workflow automation for financial services firm',
    technologies: ['Node.js', 'AWS', 'PostgreSQL'],
    impact: '60% time savings',
  },
  {
    id: 4,
    title: 'Brand Identity & Website',
    category: 'Branding',
    image: '/portfolio-4.png',
    description: 'Complete rebranding and premium website for luxury brand',
    technologies: ['Next.js', 'TailwindCSS', 'Figma'],
    impact: '3x brand engagement',
  },
  {
    id: 5,
    title: 'HealthTech Web Application',
    category: 'SaaS',
    image: '/portfolio-5.png',
    description: 'HIPAA-compliant patient management system',
    technologies: ['React', 'Node.js', 'MongoDB'],
    impact: '10,000+ active users',
  },
  {
    id: 6,
    title: 'Real Estate Platform',
    category: 'Web Design',
    image: '/portfolio-6.png',
    description: 'Interactive property listing and CRM system',
    technologies: ['Next.js', 'GraphQL', 'PostgreSQL'],
    impact: '£2M in transaction volume',
  },
]

const categories = ['All', 'Web Design', 'SaaS', 'E-Commerce', 'Branding', 'Automation']

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

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(project => project.category === selectedCategory)

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
            Our Portfolio
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Showcase of our most impactful projects and successful collaborations
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="section-container pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'premium-button-primary'
                  : 'glass hover:bg-white/[0.12]'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Portfolio Grid */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              className="group glass-card flex flex-col overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                <span className="text-sm text-primary font-medium mb-2">{project.category}</span>
                <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                  {project.title}
                </h3>
                <p className="text-foreground/60 text-sm mb-4 flex-1">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-1 glass-sm text-primary">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Impact */}
                <div className="pt-4 border-t border-white/[0.12]">
                  <p className="text-sm font-medium text-primary">{project.impact}</p>
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
          <h2 className="text-4xl font-bold mb-6">Impressed with our work?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Let&apos;s discuss how we can create something equally impressive for your business
          </p>
          <a
            href="/contact"
            className="premium-button-primary inline-flex items-center gap-2 group"
          >
            Start Your Project
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
