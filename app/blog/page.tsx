'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: 'The Future of AI in Web Development',
    excerpt: 'Exploring how AI is transforming the way we build and optimize web applications.',
    category: 'AI',
    author: 'Sarah Chen',
    date: 'Jan 15, 2024',
    readTime: '8 min read',
  },
  {
    id: 2,
    title: 'Building Scalable SaaS Platforms',
    excerpt: 'Best practices and architectural patterns for building products that scale.',
    category: 'Architecture',
    author: 'James Wilson',
    date: 'Jan 12, 2024',
    readTime: '12 min read',
  },
  {
    id: 3,
    title: 'The ROI of Digital Transformation',
    excerpt: 'How companies can measure and maximize returns from their digital initiatives.',
    category: 'Business',
    author: 'Emma Rodriguez',
    date: 'Jan 10, 2024',
    readTime: '10 min read',
  },
  {
    id: 4,
    title: 'Modern UI/UX Design Trends',
    excerpt: 'What\'s new in design in 2024 and how to implement it in your projects.',
    category: 'Design',
    author: 'Alex Thompson',
    date: 'Jan 8, 2024',
    readTime: '7 min read',
  },
  {
    id: 5,
    title: 'Automation: From Concept to Reality',
    excerpt: 'Real-world strategies for implementing automation in your business processes.',
    category: 'Automation',
    author: 'Marcus Lee',
    date: 'Jan 5, 2024',
    readTime: '9 min read',
  },
  {
    id: 6,
    title: 'Security Best Practices for 2024',
    excerpt: 'Essential security measures for modern web applications and SaaS platforms.',
    category: 'Security',
    author: 'Sophie Martin',
    date: 'Jan 1, 2024',
    readTime: '11 min read',
  },
]

const categories = ['All', 'AI', 'Design', 'Architecture', 'Business', 'Security', 'Automation']

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

export default function BlogPage() {
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
            Insights & Articles
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Industry insights, best practices, and expert perspectives on digital innovation
          </p>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="section-container pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={item}
              className="glass-card flex flex-col hover:scale-105 transition-transform duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-3 py-1 glass-sm text-primary font-medium">
                  {post.category}
                </span>
                <span className="text-xs text-foreground/50">{post.readTime}</span>
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">
                {post.title}
              </h3>

              <p className="text-foreground/60 text-sm mb-6 flex-1">
                {post.excerpt}
              </p>

              <div className="border-t border-white/[0.12] pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <User size={14} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-20 text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for insights, trends, and expert perspectives
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button className="premium-button-primary">
              Subscribe
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
