import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Toast { id: number; message: string; }

const ToastContext = createContext<{ show: (msg: string) => void } | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="animate-fade-in flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-lg max-w-sm">
            <CheckCircle2 className="h-5 w-5 text-success-icon shrink-0" />
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-auto shrink-0">
              <X className="h-4 w-4 text-white/60 hover:text-white" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
