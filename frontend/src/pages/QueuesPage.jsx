import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { LoadingSpinner, StatusBadge, EmptyState } from '../components/common/UIComponents';
import { Monitor, RefreshCw, Wifi, WifiOff, Clock, CheckCircle2, AlertCircle, Volume2, Play, Check, SkipForward } from 'lucide-react';

const speakCall = (queueNumber, poliName) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // stop current sound
    const text = `Nomor antrean ${queueNumber}, silakan menuju ${poliName}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

const QueueCard = ({ reg, onAction, actionLoading }) => {
  const queueId = reg.queue?.id;
  const queueNum = reg.queue?.queue_number || '—';
  const isCurrent = reg.queue?.status === 'CALLED' || reg.status === 'CHECKED_IN' || reg.status === 'EXAMINATION';
  const isWaiting = reg.status === 'WAITING';

  return (
    <div className={`group relative border rounded-2xl overflow-hidden transition bg-white ${
      isCurrent ? 'border-emerald-300 shadow-md shadow-emerald-500/10' : 'border-slate-200'
    }`}>
      {isCurrent && (
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse" />
      )}
      <div className="p-4 flex items-center gap-3">
        {/* Queue number */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 ${
          isCurrent
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {queueNum}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 truncate">{reg.patient?.name}</div>
          <div className="text-xs text-slate-500 truncate">{reg.doctor?.name} · {reg.policlinic?.name}</div>
        </div>
        <StatusBadge status={reg.status} paymentStatus={reg.payment?.payment_status} />
      </div>

      {/* Complaint */}
      {reg.initial_complaint && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-500 italic line-clamp-2">"{reg.initial_complaint}"</p>
        </div>
      )}

      {/* Interactive Actions */}
      {queueId && reg.status !== 'COMPLETED' && reg.status !== 'CANCELLED' && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1.5 flex-wrap">
          {/* Call button */}
          <button
            onClick={() => onAction(queueId, 'call', queueNum, reg.policlinic?.name)}
            disabled={actionLoading === queueId}
            className="btn btn-secondary text-xs py-1 px-2.5 gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            title="Panggil Antrean (dengan suara)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Panggil
          </button>

          {/* Start examination button */}
          {reg.status === 'CHECKED_IN' || reg.queue?.status === 'CALLED' ? (
            <button
              onClick={() => onAction(queueId, 'start')}
              disabled={actionLoading === queueId}
              className="btn btn-primary text-xs py-1 px-2.5 gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              Mulai Exam
            </button>
          ) : null}

          {/* Complete queue button */}
          {reg.status === 'EXAMINATION' && (
            <button
              onClick={() => onAction(queueId, 'complete')}
              disabled={actionLoading === queueId}
              className="btn text-xs py-1 px-2.5 gap-1 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Check className="w-3.5 h-3.5" />
              Selesai
            </button>
          )}

          {/* Skip queue button */}
          {isWaiting && (
            <button
              onClick={() => onAction(queueId, 'skip')}
              disabled={actionLoading === queueId}
              className="btn btn-secondary text-xs py-1 px-2 text-slate-500 hover:text-amber-700"
              title="Lewati Antrean"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border ${color} shadow-sm transition-transform hover:scale-[1.02]`}>
    <div>
      <div className="text-[11px] font-bold opacity-80 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black leading-none">{value}</div>
    </div>
    <Icon className="w-8 h-8 opacity-75 flex-shrink-0" />
  </div>
);

const QueuesPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/registrations/today');
      if (res.data.success) {
        setRegistrations(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleQueueAction = async (queueId, action, queueNum = '', poliName = '') => {
    setActionLoading(queueId);
    try {
      if (action === 'call') {
        speakCall(queueNum, poliName);
      }
      await api.patch(`/queues/${queueId}/${action}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses aksi antrean.');
    } finally {
      setActionLoading(null);
    }
  };

  const waiting    = registrations.filter(r => r.status === 'WAITING');
  const inProgress = registrations.filter(r => ['CHECKED_IN', 'EXAMINATION'].includes(r.status));
  const completed  = registrations.filter(r => r.status === 'COMPLETED');

  if (loading) return <LoadingSpinner label="Memuat data antrean..." />;

  return (
    <div className="space-y-5">
      {/* Live Badge + Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            LIVE — Panggilan & Antrean Hari Ini
          </span>
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Update: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(p => !p)}
            className={`btn btn-sm gap-1.5 ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
            title={autoRefresh ? 'Auto-refresh aktif (setiap 15 detik)' : 'Auto-refresh nonaktif'}
          >
            {autoRefresh ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoRefresh ? 'Auto (15s)' : 'Manual'}</span>
          </button>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm btn-icon"
            title="Refresh sekarang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatPill
          icon={Clock}
          label="Menunggu"
          value={waiting.length}
          color="border-amber-200 bg-amber-50 text-amber-700"
        />
        <StatPill
          icon={AlertCircle}
          label="Dipanggil / Diperiksa"
          value={inProgress.length}
          color="border-indigo-200 bg-indigo-50 text-indigo-700"
        />
        <StatPill
          icon={CheckCircle2}
          label="Selesai"
          value={completed.length}
          color="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: BIG NOW SERVING */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="card p-6 bg-slate-900 text-white border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Volume2 className="w-64 h-64" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/10 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3 mb-6">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-sm font-bold tracking-widest text-emerald-400 uppercase">Sedang Dipanggil / Diperiksa</h2>
            </div>
            
            {inProgress.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {/* Show the most recently called one as the BIG one */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">No. Antrean</div>
                    <div className="text-7xl sm:text-8xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                      {inProgress[0].queue?.queue_number}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pasien</div>
                    <div className="text-3xl font-bold text-white mb-4">{inProgress[0].patient?.name}</div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 border border-slate-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-sm font-semibold text-slate-300">
                        {inProgress[0].policlinic?.name} • {inProgress[0].doctor?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* The rest of in progress (if any) as smaller cards */}
                {inProgress.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {inProgress.slice(1).map(r => (
                      <div key={r.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-white">{r.queue?.queue_number}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[150px]">{r.patient?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase">{r.policlinic?.name}</div>
                          <StatusBadge status={r.status} paymentStatus={r.payment?.payment_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 text-center py-24">
                <Monitor className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-500">Belum ada pasien yang dipanggil</h3>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Waiting List */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="card flex-1 flex flex-col max-h-[800px]">
            <div className="card-header bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                <span className="text-sm font-bold text-slate-800">Antrean Menunggu</span>
              </div>
              <span className="badge badge-waiting">{waiting.length} pasien</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {waiting.length === 0
                ? <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">Tidak ada antrean menunggu</div>
                : <div className="space-y-3">
                    {waiting.map(r => (
                      <QueueCard
                        key={r.id}
                        reg={r}
                        onAction={handleQueueAction}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Completed Section (Below main board) */}
      <div className="card">
        <div className="card-header bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span className="text-sm font-bold text-slate-800">Antrean Selesai</span>
          </div>
          <span className="badge badge-done">{completed.length} pasien</span>
        </div>
        <div className="p-4">
          {completed.length === 0
            ? <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">Belum ada yang selesai</div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {completed.map(r => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-4 bg-emerald-50/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      {r.queue?.queue_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">{r.patient?.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{r.policlinic?.name}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {registrations.length === 0 && (
        <EmptyState
          icon={Monitor}
          title="Tidak ada data antrean hari ini"
          description="Belum ada pasien yang mendaftar hari ini."
        />
      )}
    </div>
  );
};

export default QueuesPage;
