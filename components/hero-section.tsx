'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="section-container text-center"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-8 flex justify-center">
          <div className="glass-sm px-4 py-2 inline-block">
            <p className="text-sm font-medium text-primary">
              Premium Digital Solutions
            </p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
        >
          Engineering Digital Experiences That
          <span className="gradient-text"> Move Businesses Forward</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Rutland Projects designs and develops world-class websites, applications, and automation systems that help ambitious businesses scale faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/contact"
            className="premium-button-primary flex items-center justify-center gap-2 group"
          >
            Book a Consultation
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/portfolio"
            className="premium-button-secondary flex items-center justify-center gap-2 group"
          >
            View Our Work
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Hero Image/Showcase */}
        <motion.div
          variants={item}
          className="relative"
        >
          <div className="glass rounded-3xl p-8 overflow-hidden">
            <div className="relative w-full h-96 rounded-2xl bg-gradient-to-b from-primary/20 to-transparent overflow-hidden">
              <Image
                src="/hero-showcase.png"
                alt="Digital Solutions"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-40 h-40 glass rounded-2xl glow-effect -z-10"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}
