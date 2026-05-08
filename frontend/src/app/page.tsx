'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="w-20 h-20 bg-[#0052FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0052FF]/50">
                <span className="text-white font-bold text-4xl">A</span>
              </div>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Trustless Freelancing
              <br />
              <span className="text-[#0052FF]">on Arc Network</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Secure escrow, transparent payments, and onchain reputation. 
              Work with confidence using USDC on Arc Testnet.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={isConnected ? "/jobs" : "/jobs"}
                className="px-8 py-4 bg-[#0052FF] text-white text-lg font-semibold rounded-lg hover:bg-[#0046DD] transition-all transform hover:scale-105 shadow-lg shadow-[#0052FF]/50"
              >
                Get Started →
              </Link>
              <Link
                href="/jobs"
                className="px-8 py-4 bg-transparent border-2 border-gray-700 text-white text-lg font-semibold rounded-lg hover:border-[#0052FF] hover:text-[#0052FF] transition-all"
              >
                Browse Jobs
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="glass-card p-6 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-gray-400">Secure Escrow</div>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">1-5%</div>
                <div className="text-sm text-gray-400">Platform Fee</div>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">Onchain</div>
                <div className="text-sm text-gray-400">Reputation</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to trustless freelancing</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="glass-card glass-hover rounded-xl p-8">
                <div className="w-16 h-16 bg-[#0052FF]/20 rounded-full flex items-center justify-center mb-6 border border-[#0052FF]/30">
                  <span className="text-3xl font-bold text-[#0052FF]">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Post or Find Jobs</h3>
                <p className="text-gray-400 leading-relaxed">
                  Clients post jobs with descriptions and required skills. Freelancers browse and apply with proposals.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#0052FF] to-transparent" />
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card glass-hover rounded-xl p-8">
                <div className="w-16 h-16 bg-[#0052FF]/20 rounded-full flex items-center justify-center mb-6 border border-[#0052FF]/30">
                  <span className="text-3xl font-bold text-[#0052FF]">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Secure Escrow</h3>
                <p className="text-gray-400 leading-relaxed">
                  USDC is locked in a smart contract escrow. Funds are safe and released only when work is approved.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#0052FF] to-transparent" />
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="glass-card glass-hover rounded-xl p-8">
                <div className="w-16 h-16 bg-[#0052FF]/20 rounded-full flex items-center justify-center mb-6 border border-[#0052FF]/30">
                  <span className="text-3xl font-bold text-[#0052FF]">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Get Paid</h3>
                <p className="text-gray-400 leading-relaxed">
                  Submit work, get approved, and receive instant payment. Build your onchain reputation with every job.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose ArcHire?</h2>
            <p className="text-xl text-gray-400">Built for trust, transparency, and efficiency</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Escrow</h3>
              <p className="text-gray-400">Smart contract holds funds until work is completed and approved</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dispute Resolution</h3>
              <p className="text-gray-400">Fair arbitration system protects both clients and freelancers</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Onchain Reputation</h3>
              <p className="text-gray-400">Build verifiable reputation with ERC-8004 integration</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">USDC Payments</h3>
              <p className="text-gray-400">Stable, fast payments using USDC on Arc Testnet</p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Skills Matching</h3>
              <p className="text-gray-400">Find the perfect match with skill-based job filtering</p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card glass-hover rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-[#0052FF]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transparent Pricing</h3>
              <p className="text-gray-400">Platform fee: 1-5% (adjustable) — transparent, fair, and built onchain</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center glass-card p-12 rounded-2xl"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Working?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join ArcHire today and experience trustless freelancing on Arc Network
          </p>
          <Link
            href="/jobs"
            className="inline-block px-8 py-4 bg-[#0052FF] text-white text-lg font-semibold rounded-lg hover:bg-[#0046DD] transition-all transform hover:scale-105 shadow-lg shadow-[#0052FF]/50"
          >
            Get Started Now →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold">ArcHire</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
              <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
              <Link href="/my-jobs" className="hover:text-white transition-colors">My Jobs</Link>
            </div>
            <div className="text-sm text-gray-400 mt-4 md:mt-0">
              Built on Arc Testnet
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
