import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaChartLine, FaShieldHeart, FaWandSparkles } from 'react-icons/fa6'
import { heroStats, featureCards } from '../utils/mockData'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'

const Home = () => {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-12"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              <FaWandSparkles />
              New • AI-powered planning experience
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Take control of your money with clarity and confidence.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              FinTrack AI brings together expense tracking, budgeting, analytics, and predictive insights into one polished experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <PrimaryButton>Start for Free</PrimaryButton>
              </Link>
              <Link to="/dashboard">
                <SecondaryButton>Explore Dashboard</SecondaryButton>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-6 text-white shadow-xl">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-100">Monthly snapshot</p>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs">Live preview</span>
              </div>
              <div className="mt-6 space-y-4">
                {heroStats.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/15 p-3">
                    <span className="text-sm text-indigo-100">{item.label}</span>
                    <span className="text-lg font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <FaShieldHeart />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Why FinTrack AI?</h2>
          <p className="mt-3 text-slate-600">
            Built for professionals who want a calm, modern way to monitor accounts, reduce waste, and make confident decisions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <motion.article
              key={feature.title}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-indigo-600">
                <FaChartLine />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Ready to elevate your finances?</h2>
            <p className="mt-2 text-slate-600">Create a workspace that feels focused, modern, and motivating.</p>
          </div>
          <Link to="/register">
            <PrimaryButton className="flex items-center gap-2">
              Get Started <FaArrowRight />
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
