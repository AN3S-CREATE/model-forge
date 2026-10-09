import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  BarChart3,
  Upload,
  Rocket,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { BRAND, LOGOS } from '@/config/branding';

const features = [
  {
    icon: Upload,
    title: 'Dataset Management',
    description: 'Upload and organize training data with type detection, validation, and preprocessing tools.',
  },
  {
    icon: Cpu,
    title: 'Model Training',
    description: 'Configure and launch training jobs with hyperparameter tuning and real-time progress tracking.',
  },
  {
    icon: BarChart3,
    title: 'Performance Metrics',
    description: 'Track accuracy, loss curves, and validation scores with detailed per-epoch analytics.',
  },
  {
    icon: Rocket,
    title: 'One-Click Deployment',
    description: 'Deploy trained models instantly with version control and rollback capabilities.',
  },
  {
    icon: Shield,
    title: 'Secure Workspace',
    description: 'Enterprise-grade isolation with project-level access controls and audit logging.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Intelligent coaching on hyperparameter optimization and overfitting detection.',
  },
];

const stats = [
  { value: '12', label: 'Active Models' },
  { value: '4', label: 'Datasets' },
  { value: '3', label: 'Training Jobs' },
  { value: '92.4%', label: 'Top Accuracy' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-muted/50 mb-6">
            <img src={LOGOS.forLight} alt={BRAND.name} className="h-8 object-contain dark:hidden" />
            <img src={LOGOS.forDark} alt={BRAND.name} className="h-8 object-contain hidden dark:block" />
            <span className="text-xs font-medium text-muted-foreground">{BRAND.tagline}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Train Smarter
            <br />
            <span className="text-primary">Deploy Faster</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            {BRAND.fullName} streamlines every stage of AI model development — from dataset ingestion
            through training and evaluation to production deployment. All within one unified
            workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(179,221,73,0.35)]"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150"
            >
              Upload a Dataset
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeUp}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 max-w-3xl mx-auto text-center">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="h-14 w-14 rounded-xl bg-background flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src={LOGOS.forLight} alt={BRAND.name} className="h-10 w-10 object-contain dark:hidden" />
            <img src={LOGOS.forDark} alt={BRAND.name} className="h-10 w-10 object-contain hidden dark:block" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to train your next model?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload a dataset, configure your parameters, and let {BRAND.name} handle the rest.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(179,221,73,0.35)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        {BRAND.fullName} — Built on Taskade Genesis
      </footer>
    </div>
  );
}
