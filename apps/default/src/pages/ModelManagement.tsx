import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Search,
  CheckCircle2,
  Rocket,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { getNodes, getFieldValue, getFieldNumber, getTitle } from '@/lib/genesis-data';
import type { GenesisNode } from '@/lib/genesis-data';
import { MODELS_PROJECT_ID } from '@/config/projects';

const statusConfig: Record<string, { label: string; color: string }> = {
  'opt-draft': { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  'opt-train': { label: 'Training', color: 'bg-amber-500/10 text-amber-500' },
  'opt-eval': { label: 'Evaluating', color: 'bg-blue-500/10 text-blue-500' },
  'opt-ready': { label: 'Ready', color: 'bg-primary/10 text-primary' },
  'opt-dep': { label: 'Deployed', color: 'bg-emerald-500/10 text-emerald-500' },
  'opt-fail': { label: 'Failed', color: 'bg-destructive/10 text-destructive' },
};

export default function ModelManagement() {
  const [models, setModels] = useState<GenesisNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchModels = useCallback(async () => {
    try {
      const nodes = await getNodes(MODELS_PROJECT_ID);
      setModels(nodes);
    } catch {
      setError('Failed to load models.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const filtered = models.filter((m) => {
    if (!search) return true;
    const name = (getTitle(m, 'Name', 'Title') ?? '').toLowerCase();
    const arch = (getFieldValue(m, '@march') ?? '').toLowerCase();
    const ds = (getFieldValue(m, '@mdset') ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || arch.includes(q) || ds.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-10 bg-muted rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Model Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse, search, and manage your trained models
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Models grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center">
            <Cpu className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No models match your search.' : 'No models registered yet.'}
            </p>
          </div>
        ) : (
          filtered.map((model, i) => {
            const name = getTitle(model, 'Name', 'Title') ?? 'Unnamed';
            const arch = getFieldValue(model, '@march') ?? '—';
            const accuracy = getFieldNumber(model, '@macc');
            const version = getFieldNumber(model, '@mver');
            const status = getFieldValue(model, '@mstat') ?? '';
            const dataset = getFieldValue(model, '@mdset') ?? '—';
            const type = getFieldValue(model, '@mtype');

            const typeLabel =
              type === 'opt-clf' ? 'Classifier'
              : type === 'opt-reg' ? 'Regressor'
              : type === 'opt-nlp' ? 'NLP'
              : type === 'opt-cv' ? 'CV'
              : type === 'opt-gen' ? 'Generative'
              : 'Unknown';

            const cfg = statusConfig[status] ?? statusConfig['opt-draft'];
            const isReady = status === 'opt-ready';
            const isDeployed = status === 'opt-dep';

            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group rounded-xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {isDeployed ? (
                        <Rocket className="h-4 w-4 text-primary" />
                      ) : isReady ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {arch}
                        {version != null ? ` v${version}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', cfg.color)}>
                    {cfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="text-foreground font-medium mt-0.5">{typeLabel}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dataset</span>
                    <p className="text-foreground font-medium mt-0.5 truncate">{dataset}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy</span>
                    <p className="text-foreground font-medium mt-0.5 tabular-nums">
                      {accuracy != null && accuracy > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          {accuracy.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Version</span>
                    <p className="text-foreground font-medium mt-0.5 tabular-nums">
                      {version != null ? `v${version}` : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center gap-3">
                  <Link
                    to="/training"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View Training Jobs
                  </Link>
                  {isReady && (
                    <button className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                      Deploy
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
