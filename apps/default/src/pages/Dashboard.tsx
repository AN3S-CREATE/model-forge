import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Database,
  Play,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { getNodes, getFieldValue, getFieldNumber, getTitle } from '@/lib/genesis-data';
import type { GenesisNode } from '@/lib/genesis-data';
import {
  DATASETS_PROJECT_ID,
  MODELS_PROJECT_ID,
  JOBS_PROJECT_ID,
  METRICS_PROJECT_ID,
} from '@/config/projects';

interface DashboardData {
  datasetCount: number;
  modelCount: number;
  activeJobs: number;
  topAccuracy: number | null;
  recentModels: GenesisNode[];
  runningJobs: GenesisNode[];
  recentMetrics: GenesisNode[];
}

function useDashboardData(): { data: DashboardData | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [datasets, models, jobs, metrics] = await Promise.all([
          getNodes(DATASETS_PROJECT_ID),
          getNodes(MODELS_PROJECT_ID),
          getNodes(JOBS_PROJECT_ID),
          getNodes(METRICS_PROJECT_ID),
        ]);

        if (cancelled) return;

        const runningJobs = jobs.filter(
          (j) => getFieldValue(j, '@jstat') === 'opt-run',
        );
        const recentModels = models.slice(0, 5);
        const recentMetrics = metrics.slice(0, 5);

        const accuracies = models
          .map((m) => getFieldNumber(m, '@macc'))
          .filter((v): v is number => v != null && v > 0);
        const topAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : null;

        setData({
          datasetCount: datasets.length,
          modelCount: models.length,
          activeJobs: runningJobs.length,
          topAccuracy,
          recentModels,
          runningJobs,
          recentMetrics,
        });
      } catch (err) {
        if (!cancelled) setError('Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

const statCards = [
  {
    key: 'datasetCount',
    label: 'Datasets',
    icon: Database,
    link: '/upload',
  },
  {
    key: 'modelCount',
    label: 'Models',
    icon: Cpu,
    link: '/models',
  },
  {
    key: 'activeJobs',
    label: 'Active Jobs',
    icon: Play,
    link: '/training',
  },
] as const;

export default function Dashboard() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-5 h-48 animate-pulse" />
          <div className="rounded-xl border border-border bg-card p-5 h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{error ?? 'No data available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your AI training workspace
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, link }) => (
          <Link
            key={key}
            to={link}
            className="group rounded-xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {String(data[key])}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}

        {/* Top accuracy card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Accuracy
            </span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary tabular-nums">
            {data.topAccuracy != null ? `${data.topAccuracy.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Running jobs + Recent models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Running jobs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Running Jobs</h2>
            <Link
              to="/training"
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          {data.runningJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active training jobs.</p>
          ) : (
            <div className="space-y-3">
              {data.runningJobs.map((job) => {
                const progress = getFieldNumber(job, '@jprog') ?? 0;
                const model = getFieldValue(job, '@jmodel') ?? getTitle(job, 'Title') ?? 'Unknown';
                const hasBg = progress > 0;
                return (
                  <div key={job.id} className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{model}</p>
                      <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full',
                            hasBg ? 'bg-primary' : 'bg-muted-foreground/30',
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent models */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Models</h2>
            <Link
              to="/models"
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          {data.recentModels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No models yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentModels.map((model) => {
                const name = getTitle(model, 'Name', 'Title') ?? 'Unnamed';
                const accuracy = getFieldNumber(model, '@macc');
                const status = getFieldValue(model, '@mstat');
                const isReady = status === 'opt-ready';
                const isDeployed = status === 'opt-dep';

                return (
                  <div key={model.id} className="flex items-center gap-3">
                    {isReady || isDeployed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {accuracy != null && accuracy > 0
                          ? `${accuracy.toFixed(1)}% accuracy`
                          : 'No metrics yet'}
                      </p>
                    </div>
                    {isReady && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Ready
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
