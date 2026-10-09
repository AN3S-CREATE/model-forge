import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { getNodes, getFieldValue, getFieldNumber, getTitle, createNode } from '@/lib/genesis-data';
import type { GenesisNode } from '@/lib/genesis-data';
import { JOBS_PROJECT_ID, DATASETS_PROJECT_ID, MODELS_PROJECT_ID } from '@/config/projects';

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'opt-que': { label: 'Queued', icon: Clock, color: 'text-muted-foreground' },
  'opt-run': { label: 'Running', icon: Loader2, color: 'text-amber-500' },
  'opt-comp': { label: 'Completed', icon: CheckCircle2, color: 'text-primary' },
  'opt-fail': { label: 'Failed', icon: XCircle, color: 'text-destructive' },
};

interface FormState {
  modelName: string;
  architecture: string;
  dataset: string;
  epochs: string;
  learningRate: string;
  batchSize: string;
}

const initialForm: FormState = {
  modelName: '',
  architecture: '',
  dataset: '',
  epochs: '50',
  learningRate: '0.001',
  batchSize: '64',
};

export default function ModelTraining() {
  const [jobs, setJobs] = useState<GenesisNode[]>([]);
  const [datasets, setDatasets] = useState<GenesisNode[]>([]);
  const [existingModels, setExistingModels] = useState<GenesisNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [jobNodes, datasetNodes, modelNodes] = await Promise.all([
        getNodes(JOBS_PROJECT_ID),
        getNodes(DATASETS_PROJECT_ID),
        getNodes(MODELS_PROJECT_ID),
      ]);
      setJobs(jobNodes);
      setDatasets(datasetNodes);
      setExistingModels(modelNodes);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (formOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [formOpen]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const selectDataset = (ds: GenesisNode) => {
    const name = getTitle(ds, 'Name', 'Title') ?? getFieldValue(ds, '@dformat') ?? 'Unknown';
    updateField('dataset', name);
  };

  const selectModel = (model: GenesisNode) => {
    const name = getTitle(model, 'Name', 'Title') ?? 'Unknown';
    const arch = getFieldValue(model, '@march') ?? '';
    updateField('modelName', name);
    if (arch) updateField('architecture', arch);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const modelName = form.modelName.trim();
    const dataset = form.dataset;
    const epochsNum = Number(form.epochs);
    const lrNum = Number(form.learningRate);
    const bsNum = Number(form.batchSize);

    if (!modelName) {
      setSubmitError('Model name is required.');
      return;
    }
    if (!dataset) {
      setSubmitError('Please select a dataset.');
      return;
    }
    if (!Number.isFinite(epochsNum) || epochsNum <= 0) {
      setSubmitError('Epochs must be a positive number.');
      return;
    }
    if (!Number.isFinite(lrNum) || lrNum <= 0) {
      setSubmitError('Learning rate must be a positive number.');
      return;
    }
    if (!Number.isFinite(bsNum) || bsNum <= 0 || !Number.isInteger(bsNum)) {
      setSubmitError('Batch size must be a positive integer.');
      return;
    }

    setSubmitting(true);

    try {
      await createNode(JOBS_PROJECT_ID, {
        Model: modelName,
        Dataset: dataset,
        Status: 'opt-que',
        Epochs: String(epochsNum),
        'Learning Rate': String(lrNum),
        'Batch Size': String(bsNum),
        'Progress (%)': '0',
      });

      await fetchAll();
      setForm(initialForm);
      setFormOpen(false);
      setSuccessMessage(`Job queued: ${modelName}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setSubmitError('Failed to create training job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const datasetOptions = datasets
    .filter((ds) => getFieldValue(ds, '@dstat') === 'opt-ready' || getFieldValue(ds, '@dstat') === 'opt-clean')
    .map((ds) => ({
      node: ds,
      name: getTitle(ds, 'Name', 'Title') ?? 'Unnamed',
      type: getFieldValue(ds, '@dtype'),
      format: getFieldValue(ds, '@dformat'),
      size: getFieldNumber(ds, '@dsize'),
    }));

  const modelOptions = existingModels.map((m) => ({
    node: m,
    name: getTitle(m, 'Name', 'Title') ?? 'Unnamed',
    arch: getFieldValue(m, '@march'),
    accuracy: getFieldNumber(m, '@macc'),
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="rounded-xl border border-border bg-card p-6 h-24 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Model Training</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and monitor training jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/models"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            View Models
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => { setFormOpen(!formOpen); setSubmitError(null); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-[0_0_20px_rgba(179,221,73,0.3)] transition-shadow duration-200"
          >
            {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {formOpen ? 'Cancel' : 'New Job'}
          </button>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 flex items-center gap-2.5"
          >
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Job Form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-primary/40 bg-card p-6 space-y-5"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">New Training Job</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure hyperparameters and launch
                  </p>
                </div>
              </div>

              {/* Existing model quick-select */}
              {modelOptions.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Quick-select Existing Model
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {modelOptions.map((m) => (
                      <button
                        key={m.node.id}
                        type="button"
                        onClick={() => selectModel(m.node)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                          form.modelName === m.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
                        )}
                      >
                        <Cpu className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Model name + architecture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modelName" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Model Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="modelName"
                    type="text"
                    value={form.modelName}
                    onChange={(e) => updateField('modelName', e.target.value)}
                    placeholder="e.g. ResNet-50 Classifier"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="architecture" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Architecture
                  </label>
                  <input
                    id="architecture"
                    type="text"
                    value={form.architecture}
                    onChange={(e) => updateField('architecture', e.target.value)}
                    placeholder="e.g. ResNet-50, BERT-base"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Dataset picker */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Dataset <span className="text-destructive">*</span>
                </label>
                {datasetOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No ready or cleaned datasets available.{' '}
                    <Link to="/upload" className="text-primary hover:underline font-medium">
                      Upload one first
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {datasetOptions.map((ds) => {
                      const isSelected = form.dataset === ds.name;
                      const typeLabel =
                        ds.type === 'opt-img' ? 'Image'
                        : ds.type === 'opt-text' ? 'Text'
                        : ds.type === 'opt-tab' ? 'Tabular'
                        : ds.type === 'opt-aud' ? 'Audio'
                        : 'Other';
                      return (
                        <button
                          key={ds.node.id}
                          type="button"
                          onClick={() => selectDataset(ds.node)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground/30',
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{ds.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {typeLabel}
                              {ds.format ? ` · ${ds.format}` : ''}
                              {ds.size != null ? ` · ${ds.size} MB` : ''}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hyperparameters */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Hyperparameters
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="epochs" className="text-xs text-muted-foreground mb-1 block">
                      Epochs
                    </label>
                    <input
                      id="epochs"
                      type="number"
                      min={1}
                      max={1000}
                      value={form.epochs}
                      onChange={(e) => updateField('epochs', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="learningRate" className="text-xs text-muted-foreground mb-1 block">
                      Learning Rate
                    </label>
                    <input
                      id="learningRate"
                      type="number"
                      min={0.00001}
                      max={1}
                      step={0.0001}
                      value={form.learningRate}
                      onChange={(e) => updateField('learningRate', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="batchSize" className="text-xs text-muted-foreground mb-1 block">
                      Batch Size
                    </label>
                    <input
                      id="batchSize"
                      type="number"
                      min={1}
                      max={1024}
                      step={1}
                      value={form.batchSize}
                      onChange={(e) => updateField('batchSize', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              {submitError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-[0_0_20px_rgba(179,221,73,0.3)] transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {submitting ? 'Queuing...' : 'Launch Training Job'}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setForm(initialForm); setSubmitError(null); }}
                  className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Jobs summary */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular-nums">{jobs.length}</span> total
        </span>
        <span className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 text-amber-500 animate-spin" />
          <span className="font-semibold text-foreground tabular-nums">
            {jobs.filter((j) => getFieldValue(j, '@jstat') === 'opt-run').length}
          </span>{' '}
          running
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-primary" />
          <span className="font-semibold text-foreground tabular-nums">
            {jobs.filter((j) => getFieldValue(j, '@jstat') === 'opt-comp').length}
          </span>{' '}
          completed
        </span>
      </div>

      {/* Jobs list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center">
            <Cpu className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No training jobs yet.</p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-[0_0_20px_rgba(179,221,73,0.3)] transition-shadow duration-200"
            >
              <Plus className="h-4 w-4" />
              Create Your First Job
            </button>
          </div>
        ) : (
          jobs.map((job, i) => {
            const status = getFieldValue(job, '@jstat') ?? '';
            const model = getFieldValue(job, '@jmodel') ?? getTitle(job, 'Title') ?? 'Unknown';
            const dataset = getFieldValue(job, '@jdset') ?? '—';
            const epochs = getFieldNumber(job, '@jepc');
            const learningRate = getFieldNumber(job, '@jlr');
            const batchSize = getFieldNumber(job, '@jbs');
            const progress = getFieldNumber(job, '@jprog') ?? 0;

            const cfg = statusConfig[status] ?? statusConfig['opt-que'];
            const StatusIcon = cfg.icon;
            const isRunning = status === 'opt-run';

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusIcon
                      className={cn('h-4 w-4 shrink-0', cfg.color, isRunning && 'animate-spin')}
                    />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {model}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                    status === 'opt-comp' ? 'bg-primary/10 text-primary'
                    : status === 'opt-run' ? 'bg-amber-500/10 text-amber-500'
                    : status === 'opt-fail' ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground',
                  )}>
                    {cfg.label}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Dataset</span>
                    <span className="text-foreground font-medium">{dataset}</span>
                  </div>
                  {epochs != null && (
                    <div className="flex justify-between">
                      <span>Epochs</span>
                      <span className="text-foreground font-medium tabular-nums">{epochs}</span>
                    </div>
                  )}
                  {learningRate != null && (
                    <div className="flex justify-between">
                      <span>Learning Rate</span>
                      <span className="text-foreground font-medium tabular-nums">{learningRate}</span>
                    </div>
                  )}
                  {batchSize != null && (
                    <div className="flex justify-between">
                      <span>Batch Size</span>
                      <span className="text-foreground font-medium tabular-nums">{batchSize}</span>
                    </div>
                  )}
                </div>

                {isRunning && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                )}
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
