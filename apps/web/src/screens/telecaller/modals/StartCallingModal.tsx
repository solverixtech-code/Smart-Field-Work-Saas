import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, CheckCircle, FileText, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

interface StartCallingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName?: string;
  company?: string;
  phone?: string;
}

export const StartCallingModal: React.FC<StartCallingModalProps> = ({
  isOpen,
  onClose,
  leadName = 'Ramesh Verma',
  company = 'Veema Solutions',
  phone = '+91 98765 43210',
}) => {
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'ended'>('dialing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [disposition, setDisposition] = useState('Interested');
  const [callNotes, setCallNotes] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCallState('dialing');
      setSeconds(0);
      return;
    }

    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    toast.success(`Call ended (${formatTimer(seconds)}). Logged as ${disposition}`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Dialer Header */}
        <div className="bg-[#0D1F3D] text-white p-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-red-600/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-red-400">
            <User className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-extrabold text-white">{leadName}</h2>
          <p className="text-xs text-slate-300 font-medium">{company} • <span className="font-mono text-white">{phone}</span></p>

          <div className="mt-3">
            {callState === 'dialing' && (
              <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 animate-pulse">
                <Phone className="w-3.5 h-3.5" /> Dialing customer...
              </span>
            )}
            {callState === 'connected' && (
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {formatTimer(seconds)} Call Connected
              </span>
            )}
            {callState === 'ended' && (
              <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30">
                Call Ended
              </span>
            )}
          </div>
        </div>

        {/* Call Controls & Disposition Logger */}
        <div className="p-5 space-y-4">
          {/* Audio Toggle Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className={`p-3 rounded-full border transition-all ${
                muted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => setSpeaker(!speaker)}
              className={`p-3 rounded-full border transition-all ${
                !speaker ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}
            >
              {speaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Call Disposition Select */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Call Disposition</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Interested', 'Booked Demo', 'Callback Req', 'Not Interested', 'No Answer', 'Busy'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDisposition(opt)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    disposition === opt
                      ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Call Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Call Notes</label>
            <textarea
              rows={2}
              placeholder="Type quick notes during the call..."
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Submit/Save Button */}
          <Button
            onClick={handleEndCall}
            className="w-full bg-[#E20613] hover:bg-red-700 text-white font-bold text-xs py-2.5"
          >
            Save & Log Call
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
