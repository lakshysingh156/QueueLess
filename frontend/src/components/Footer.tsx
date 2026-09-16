import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sky-600 rounded flex items-center justify-center">
            <Activity className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-700">QueueLess</span>
          <span>— Healthcare Navigation Prototype</span>
        </div>
        <p className="text-center sm:text-right text-xs text-slate-400 max-w-xs">
          For a real medical emergency, contact local emergency services immediately. This is a B.Tech project prototype and does not provide medical diagnosis.
        </p>
      </div>
    </footer>
  );
}
