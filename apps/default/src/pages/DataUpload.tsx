import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Image,
  Table2,
  Music,
  File,
  Database,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getNodes, getFieldValue, getFieldNumber, getTitle } from '@/lib/genesis-data';
import type { GenesisNode } from '@/lib/genesis-data';
import { DATASETS_PROJECT_ID } from '@/config/projects';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Image: Image,
  Text: FileText,
  Tabular: Table2,
  Audio: Music,
  Other: File,
};

const statusColors: Record<string, string> = {
  Ready: 'bg-primary/10 text-primary',
  Raw: 'bg-amber-500/10 text-amber-500',
  Cleaned: 'bg-blue-500/10 text-blue-500',
  Archived: 'bg-muted-foreground/20 text-muted-foreground',
};

export default function DataUpload() {
  const [datasets, setDatasets] = useState<GenesisNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDatasets = useCallback(async () => {
    try {
      const nodes = await getNodes(DATASETS_PROJECT_ID);
      setDatasets(nodes);
    } catch {
      setError('Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          fetchDatasets();
          return 100;
        }
        return prev + Math.random() * 25;
      });
    }, 400);
  }, [fetchDatasets]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="rounded-xl border border-border bg-card p-8 h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage your training datasets
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-colors duration-200 p-8 md:p-12 text-center',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50',
        )}
      >
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
            <p className="text-sm font-medium text-foreground">Uploading dataset...</p>
            <div className="max-w-xs mx-auto h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Drop your dataset here
            </p>
            <p className="text-xs text-muted-foreground">
              CSV, Parquet, NPZ, WAV, JSON — up to 500 MB
            </p>
          </>
        )}
      </div>

      {/* Dataset list */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        {datasets.length === 0 && !loading && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Database className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No datasets uploaded yet.</p>
          </div>
        )}

        {datasets.map((ds, i) => {
          const type = getFieldValue(ds, '@dtype');
          const status = getFieldValue(ds, '@dstat');
          const size = getFieldNumber(ds, '@dsize');
          const format = getFieldValue(ds, '@dformat');
          const name = getTitle(ds, 'Name', 'Title') ?? 'Unnamed Dataset';

          const typeLabel =
            type === 'opt-img' ? 'Image'
            : type === 'opt-text' ? 'Text'
            : type === 'opt-tab' ? 'Tabular'
            : type === 'opt-aud' ? 'Audio'
            : 'Other';

          const statusLabel =
            status === 'opt-ready' ? 'Ready'
            : status === 'opt-raw' ? 'Raw'
            : status === 'opt-clean' ? 'Cleaned'
            : 'Archived';

          const TypeIcon = typeIcons[typeLabel] ?? File;
          const statusClass = statusColors[statusLabel] ?? 'bg-muted text-muted-foreground';

          return (
            <motion.div
              key={ds.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TypeIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {format ?? 'Unknown'} {size != null ? `· ${size} MB` : ''}
                </p>
              </div>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', statusClass)}>
                {statusLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
