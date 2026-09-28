import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Camera, CheckCircle2, Heart, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface HeartRateMonitorProps {
  onClose: () => void;
  language: 'en' | 'te' | 'hi';
}

type MeasurementState = 'idle' | 'measuring' | 'done' | 'error';

const DURATION_SECONDS = 30;
const SAMPLE_INTERVAL_MS = 100;

const text = {
  en: {
    title: 'Heart Rate Monitor',
    instruction: 'Place your fingertip gently over the rear camera and flash. Keep it still.',
    start: 'Start Measurement',
    stop: 'Stop',
    measuring: 'Measuring… keep your finger still',
    result: 'Estimated Heart Rate',
    bpm: 'BPM',
    again: 'Measure Again',
    close: 'Close',
    permission: 'Camera permission is required to estimate heart rate.',
    unsupported: 'Camera access is not supported by this browser/device.',
    error: 'Unable to start the camera. Allow camera permission and try again.',
    note: 'This is a camera-based estimate for demonstration purposes, not a medical-grade measurement.',
    noSignal: 'Not enough pulse signal was detected. Cover the camera lens completely and try again.',
  },
  te: {
    title: 'హార్ట్ రేట్ మానిటర్',
    instruction: 'వెనుక కెమెరా మరియు ఫ్లాష్‌పై మీ వేలు మెల్లగా ఉంచండి. కదపకుండా ఉంచండి.',
    start: 'కొలత ప్రారంభించండి',
    stop: 'ఆపండి',
    measuring: 'కొలుస్తోంది… వేలు కదపకండి',
    result: 'అంచనా హార్ట్ రేట్',
    bpm: 'BPM',
    again: 'మళ్లీ కొలవండి',
    close: 'మూసివేయండి',
    permission: 'హార్ట్ రేట్ అంచనా కోసం కెమెరా అనుమతి అవసరం.',
    unsupported: 'ఈ బ్రౌజర్/పరికరంలో కెమెరా అందుబాటులో లేదు.',
    error: 'కెమెరా ప్రారంభించలేకపోయాం. కెమెరా అనుమతి ఇచ్చి మళ్లీ ప్రయత్నించండి.',
    noSignal: 'తగిన పల్స్ సిగ్నల్ గుర్తించలేదు. కెమెరా లెన్స్‌ను పూర్తిగా కప్పి మళ్లీ ప్రయత్నించండి.',
  },
  hi: {
    title: 'हार्ट रेट मॉनिटर',
    instruction: 'पीछे के कैमरे और फ्लैश पर अपनी उंगली हल्के से रखें। स्थिर रखें।',
    start: 'माप शुरू करें',
    stop: 'रोकें',
    measuring: 'माप हो रहा है… उंगली स्थिर रखें',
    result: 'अनुमानित हार्ट रेट',
    bpm: 'BPM',
    again: 'फिर से मापें',
    close: 'बंद करें',
    permission: 'हार्ट रेट का अनुमान लगाने के लिए कैमरा अनुमति आवश्यक है।',
    unsupported: 'इस ब्राउज़र/डिवाइस में कैमरा उपलब्ध नहीं है।',
    error: 'कैमरा शुरू नहीं हो सका। कैमरा अनुमति दें और फिर कोशिश करें।',
    noSignal: 'पर्याप्त पल्स सिग्नल नहीं मिला। कैमरा लेंस को पूरी तरह ढककर फिर कोशिश करें।',
  },
};

function calculateBpm(samples: { time: number; red: number }[]): number | null {
  if (samples.length < 100) return null;

  // Remove the slow lighting trend, then smooth the pulse waveform.
  const values = samples.map((s) => s.red);
  const smooth: number[] = [];
  const trendWindow = 25;

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - trendWindow);
    const end = Math.min(values.length, i + trendWindow + 1);
    let sum = 0;
    for (let j = start; j < end; j++) sum += values[j];
    smooth.push(values[i] - sum / (end - start));
  }

  const filtered: number[] = [];
  for (let i = 0; i < smooth.length; i++) {
    const start = Math.max(0, i - 2);
    const end = Math.min(smooth.length, i + 3);
    let sum = 0;
    for (let j = start; j < end; j++) sum += smooth[j];
    filtered.push(sum / (end - start));
  }

  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance = filtered.reduce((a, b) => a + (b - mean) ** 2, 0) / filtered.length;
  const std = Math.sqrt(variance);
  const threshold = Math.max(std * 0.35, 0.8);
  const peaks: number[] = [];
  const minPeakDistance = 350; // ms => max about 171 BPM

  for (let i = 2; i < filtered.length - 2; i++) {
    const isPeak =
      filtered[i] > filtered[i - 1] &&
      filtered[i] >= filtered[i + 1] &&
      filtered[i] > filtered[i - 2] &&
      filtered[i] >= filtered[i + 2] &&
      filtered[i] - mean > threshold;

    if (isPeak) {
      const time = samples[i].time;
      const last = peaks[peaks.length - 1];
      if (last === undefined || time - last >= minPeakDistance) peaks.push(time);
    }
  }

  if (peaks.length < 4) return null;

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    const interval = peaks[i] - peaks[i - 1];
    if (interval >= 350 && interval <= 1500) intervals.push(interval);
  }

  if (intervals.length < 3) return null;
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  const bpm = Math.round(60000 / median);

  if (bpm < 40 || bpm > 180) return null;
  return bpm;
}

export const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({ onClose, language }) => {
  const t = text[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const samplesRef = useRef<{ time: number; red: number }[]>([]);
  const lastSampleRef = useRef(0);

  const [state, setState] = useState<MeasurementState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [bpm, setBpm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startMeasurement = async () => {
    setError(null);
    setBpm(null);
    samplesRef.current = [];
    lastSampleRef.current = 0;
    setSecondsLeft(DURATION_SECONDS);

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error');
      setError(t.unsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];

      // Torch is supported only on some Android browsers/devices.
      try {
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] });
        }
      } catch {
        // Continue without torch if the browser does not expose it.
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setState('measuring');

      const startedAt = performance.now();
      timerRef.current = window.setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        const now = performance.now();
        if (now - lastSampleRef.current < SAMPLE_INTERVAL_MS) return;
        lastSampleRef.current = now;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const width = 120;
        const height = 90;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);

        // Sample the center region; fingertip covering the camera should dominate it.
        const image = ctx.getImageData(20, 15, 80, 60).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let i = 0; i < image.length; i += 4) {
          red += image[i];
          green += image[i + 1];
          blue += image[i + 2];
          count++;
        }

        const avgRed = red / count;
        const avgGreen = green / count;
        const avgBlue = blue / count;
        const signal = avgRed - (avgGreen + avgBlue) / 2;

        // Ignore frames with very little red dominance; these usually mean the lens is uncovered.
        if (signal > 4) samplesRef.current.push({ time: now, red: signal });

        const elapsed = (now - startedAt) / 1000;
        setSecondsLeft(Math.max(0, Math.ceil(DURATION_SECONDS - elapsed)));

        if (elapsed >= DURATION_SECONDS) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }

          const result = calculateBpm(samplesRef.current);
          stopCamera();
          if (result === null) {
            setState('error');
            setError(t.noSignal);
          } else {
            setBpm(result);
            setState('done');
          }
        }
      }, SAMPLE_INTERVAL_MS);
    } catch (err) {
      console.error('Heart-rate camera error:', err);
      stopCamera();
      setState('error');
      setError(err instanceof DOMException && err.name === 'NotAllowedError' ? t.permission : t.error);
    }
  };

  const handleStop = () => {
    stopCamera();
    setState('idle');
    setSecondsLeft(DURATION_SECONDS);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#e51b24] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{t.title}</h2>
              <p className="text-[11px] text-slate-500 font-medium">Camera-based pulse estimate</p>
            </div>
          </div>
          <button type="button" onClick={() => { stopCamera(); onClose(); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer" aria-label={t.close}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 font-semibold leading-relaxed">
            {t.instruction}
          </div>

          <div className="relative aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {state === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 bg-slate-900">
                <Camera className="w-10 h-10 mb-3 opacity-80" />
                <p className="text-xs font-semibold opacity-80">{t.instruction}</p>
              </div>
            )}
            {state === 'measuring' && (
              <div className="absolute inset-x-0 bottom-0 bg-black/55 p-3 text-center text-white">
                <div className="flex items-center justify-center gap-2 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  {t.measuring}
                </div>
                <div className="text-2xl font-black mt-1">{secondsLeft}s</div>
              </div>
            )}
          </div>

          {state === 'done' && bpm !== null && (
            <div className="rounded-3xl bg-rose-50 border border-rose-200 p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#00a651] mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">{t.result}</p>
              <div className="flex items-end justify-center gap-2 mt-1">
                <span className="text-5xl font-black text-[#e51b24]">{bpm}</span>
                <span className="text-sm font-black text-slate-600 mb-2">{t.bpm}</span>
              </div>
            </div>
          )}

          {state === 'error' && error && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-semibold flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            {state === 'measuring' ? (
              <button type="button" onClick={handleStop} className="flex-1 py-3 rounded-2xl bg-slate-800 text-white font-black text-sm cursor-pointer">
                {t.stop}
              </button>
            ) : (
              <button type="button" onClick={startMeasurement} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#e51b24] to-[#c1121f] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer">
                {state === 'done' || state === 'error' ? <RefreshCw className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                {state === 'done' || state === 'error' ? t.again : t.start}
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">{t.note}</p>
        </div>
      </div>
    </div>
  );
};
