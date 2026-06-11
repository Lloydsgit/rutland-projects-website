'use client'

import Link from 'next/link'
import { Share2, Briefcase, Send, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const footerLinks = {
  Services: [
    { label: 'Website Development', href: '/services' },
    { label: 'Web Applications', href: '/services' },
    { label: 'UI/UX Design', href: '/services' },
    { label: 'AI Solutions', href: '/services' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Resources: [
    { label: 'Process', href: '/process' },
    { label: 'Industries', href: '/industries' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

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

export function Footer() {
  return (
    <footer className="gradient-bg border-t border-white/[0.12] pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand */}
          <motion.div variants={item} className="md:col-span-1">
            <h3 className="text-xl font-bold gradient-text mb-4">Rutland Projects</h3>
            <p className="text-sm text-foreground/60 mb-4">
              Engineering digital experiences that move businesses forward.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/[0.08] backdrop-blur-[40px] border border-white/[0.12] rounded-2xl hover:bg-white/[0.12] rounded-lg transition-all duration-300">
                <Briefcase size={18} className="text-primary" />
              </a>
              <a href="#" className="p-2 bg-white/[0.08] backdrop-blur-[40px] border border-white/[0.12] rounded-2xl hover:bg-white/[0.12] rounded-lg transition-all duration-300">
                <Send size={18} className="text-primary" />
              </a>
              <a href="#" className="p-2 bg-white/[0.08] backdrop-blur-[40px] border border-white/[0.12] rounded-2xl hover:bg-white/[0.12] rounded-lg transition-all duration-300">
                <Share2 size={18} className="text-primary" />
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={item}>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2">
              {footerLinks.Services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={item}>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={item}>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.Resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={item}>
            <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
            <div className="space-y-3">
              <a href="tel:+441753" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
                <Phone size={16} />
                <span>+44 (0) 1753...</span>
              </a>
              <a href="mailto:hello@rutlandprojects.com" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
                <Mail size={16} />
                <span>hello@rutland.co.uk</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-foreground/60">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>5 St. Pauls Avenue, Slough, Berkshire, SL2 5EX, UK</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-white/[0.12] py-8">
          {/* Legal Links */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/60"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {footerLinks.Legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p>© 2024 Rutland Projects. All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
