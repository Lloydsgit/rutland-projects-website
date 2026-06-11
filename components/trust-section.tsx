'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const stats = [
  { label: 'Projects Delivered', value: 150, suffix: '+' },
  { label: 'Happy Clients', value: 120, suffix: '+' },
  { label: 'Years in Business', value: 8, suffix: '' },
  { label: 'Team Members', value: 45, suffix: '+' },
]

const technologies = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL',
  'AWS', 'Vercel', 'TailwindCSS', 'GraphQL'
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

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = target / 30
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 50)

    return () => clearInterval(interval)
  }, [target])

  return <>{count}</>
}

export function TrustSection() {
  return (
    <section className="section-container border-y border-white/[0.12]">
      {/* Stats */}
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Growing Businesses
          </h2>
          <p className="text-xl text-foreground/60">
            Success measured by our clients&apos; growth
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-card flex flex-col items-center justify-center py-8"
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                <Counter target={stat.value} />
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <p className="text-sm text-foreground/60 text-center">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Technologies */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold mb-2">Modern Technology Stack</h3>
          <p className="text-foreground/60">Built with the best tools and frameworks</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-sm px-4 py-2 text-sm font-medium text-primary hover:bg-white/[0.12] transition-all duration-300"
            >
              {tech}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
