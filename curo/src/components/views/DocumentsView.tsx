import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Camera, FolderHeart, FileText, Trash2, Eye, Download, Sparkles, HardDrive, AlertCircle, X, Check, RefreshCw, Edit3 } from 'lucide-react';
import { MedicalDocument, Language, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';
import { apiService } from '../../services/api';
import { compressImage, formatBytes } from '../../services/imageCompressor';

interface DocumentsViewProps {
  language: Language;
  currentUser: UserProfile | null;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ language, currentUser }) => {
  const t = translations[language];
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => apiService.getDocuments());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<MedicalDocument | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<'prescription' | 'lab_report' | 'xray' | 'blood_test'>('prescription');

  // Rename document state
  const [docToRename, setDocToRename] = useState<MedicalDocument | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  // Delete confirmation state
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);

  // Requirement 3: 2 Options UI state: 'none' | 'camera' | 'upload'
  const [activeUploadMode, setActiveUploadMode] = useState<'idle' | 'camera' | 'file'>('idle');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalSavedBytes = documents.reduce((acc, doc) => acc + (doc.originalSizeBytes - doc.compressedSizeBytes), 0);

  // Stop camera on unmount or mode change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleStartCamera = async () => {
    setUploadError(null);
    setCameraPermissionError(null);
    setCapturedPhotoUrl(null);
    setActiveUploadMode('camera');

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this browser/device.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraPermissionError(
        language === 'te'
          ? 'కెమెరా యాక్సెస్ అనుమతించబడలేదు. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో కెమెరాను అనుమతించండి లేదా ఫైల్ అప్‌లోడ్ ఎంచుకోండి.'
          : language === 'hi'
          ? 'कैमरा अनुमति नहीं मिली। कृपया सेटिंग्स में कैमरा की अनुमति दें या फाइल अपलोड चुनें।'
          : 'Camera permission was denied. Please allow camera access or use the Upload Files option.'
      );
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhotoUrl(dataUrl);

      // Stop camera stream after capturing
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const handleSaveCapturedPhoto = async () => {
    if (!capturedPhotoUrl) return;

    setIsUploading(true);
    try {
      // Convert base64 dataUrl to File
      const res = await fetch(capturedPhotoUrl);
      const blob = await res.blob();
      const file = new File([blob], `prescription_${Date.now()}.jpg`, { type: 'image/jpeg' });

      await handleFileProcess(file);
      setCapturedPhotoUrl(null);
      setActiveUploadMode('idle');
    } catch (e) {
      console.error('Save photo error', e);
      setUploadError('Failed to process captured photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid medical photo or image report (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const compressionResult = await compressImage(file, 1400, 1400, 0.75);

      const title = customTitle.trim() || (customCategory === 'prescription' ? 'PHC Prescription Slip' : 'Diagnostic Lab Report');

      const newDoc: MedicalDocument = {
        id: `doc-${Date.now()}`,
        title,
        category: customCategory,
        recordDate: new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        originalSizeBytes: compressionResult.originalSizeBytes,
        compressedSizeBytes: compressionResult.compressedSizeBytes,
        compressionRatioPercent: compressionResult.compressionRatioPercent,
        dataUrl: compressionResult.dataUrl,
        notes: `Compressed report for ${currentUser?.name || 'Patient'}`,
      };

      apiService.saveDocument(newDoc);
      setDocuments(apiService.getDocuments());
      setCustomTitle('');
      setActiveUploadMode('idle');
    } catch (err: any) {
      console.error('Compression error:', err);
      setUploadError('Failed to compress document. Please try a different photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const openRenameModal = (doc: MedicalDocument) => {
    setDocToRename(doc);
    setNewTitleInput(doc.title);
  };

  const handleSaveRename = () => {
    if (docToRename && newTitleInput.trim()) {
      apiService.updateDocumentTitle(docToRename.id, newTitleInput.trim());
      setDocuments(apiService.getDocuments());
      if (selectedDocForPreview?.id === docToRename.id) {
        setSelectedDocForPreview({ ...selectedDocForPreview, title: newTitleInput.trim() });
      }
      setDocToRename(null);
    }
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      apiService.deleteDocument(docToDelete.id);
      setDocuments(apiService.getDocuments());
      if (selectedDocForPreview?.id === docToDelete.id) {
        setSelectedDocForPreview(null);
      }
      setDocToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    const target = documents.find(d => d.id === id);
    if (target) {
      setDocToDelete(target);
    } else {
      apiService.deleteDocument(id);
      setDocuments(apiService.getDocuments());
    }
  };

  const handleCancelUpload = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCapturedPhotoUrl(null);
    setActiveUploadMode('idle');
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 pb-24 space-y-4 text-slate-900">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {t.documentsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t.documentsSubtitle}
        </p>
      </div>

      {/* Cloud Storage Savings Metric Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#007ceb] via-[#0284c7] to-[#00a651] text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-100">
              Rural 2G/3G Storage Optimizer
            </span>
            <h3 className="text-base sm:text-lg font-black leading-tight">
              {formatBytes(totalSavedBytes)} Data Space Saved
            </h3>
            <p className="text-[11px] text-sky-100 font-medium">
              Compressed with high optical clarity for village doctor consultations
            </p>
          </div>
        </div>
        <div className="hidden sm:block px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold text-white">
          {documents.length} Records
        </div>
      </div>

      {/* Requirement 3: CLEAR INTERFACE IN REPORTS SECTION THAT ASKS 2 OPTIONS: CAMERA & UPLOAD FILES */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <FolderHeart className="w-4 h-4 text-[#007ceb]" />
          <span>{t.uploadOptionHeader || 'Choose Upload Method:'}</span>
        </h3>

        {/* 2 Options Cards: Camera & Upload Files */}
        {activeUploadMode === 'idle' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* OPTION 1: CAMERA (Take Photo Right There) */}
            <div
              id="option-upload-camera"
              onClick={handleStartCamera}
              className="p-5 rounded-2xl border-2 border-dashed border-sky-300 hover:border-[#007ceb] hover:bg-sky-50/50 bg-slate-50/50 transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#007ceb] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {t.optionCameraTitle || 'Take Photo (Camera)'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.optionCameraDesc || 'Snap prescription or lab report right now with your camera'}
                </p>
              </div>
              <span className="px-3 py-1 bg-[#007ceb] text-white rounded-xl text-xs font-bold shadow-xs">
                {t.captureLiveBtn || 'Take Photo Now 📸'}
              </span>
            </div>

            {/* OPTION 2: UPLOAD FILES (Existing Files from Mobile/Desktop) */}
            <div
              id="option-upload-files"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-[#00a651] hover:bg-emerald-50/50 bg-slate-50/50 transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00a651] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {t.optionUploadTitle || 'Upload Files (Gallery)'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.optionUploadDesc || 'Browse and upload existing PDF/Photos from device'}
                </p>
              </div>
              <span className="px-3 py-1 bg-[#00a651] text-white rounded-xl text-xs font-bold shadow-xs">
                Browse Files 📁
              </span>
            </div>
          </div>
        )}

        {/* Hidden File Input for Device Files */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Active Camera Viewfinder (#3) */}
        {activeUploadMode === 'camera' && (
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 text-center relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="font-bold flex items-center gap-1 text-emerald-400">
                <Camera className="w-4 h-4" />
                Live Prescription Camera
              </span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraPermissionError ? (
              <div className="p-4 bg-rose-900/80 rounded-xl text-xs text-rose-200 flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <span>{cameraPermissionError}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-white text-slate-900 rounded-xl font-bold"
                >
                  Upload from Files Instead
                </button>
              </div>
            ) : capturedPhotoUrl ? (
              /* Photo Captured Preview */
              <div className="space-y-3">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured Prescription"
                  className="max-h-64 mx-auto rounded-xl border border-white/20 object-contain bg-black"
                />
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.retakePhotoBtn || 'Retake Photo 🔄'}</span>
                  </button>
                  <button
                    id="btn-use-captured-photo"
                    type="button"
                    onClick={handleSaveCapturedPhoto}
                    disabled={isUploading}
                    className="px-5 py-2 bg-[#00a651] hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    {isUploading ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{t.usePhotoBtn || 'Use This Photo ✓'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Live Camera Stream */
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-64 mx-auto rounded-xl border border-white/20 object-contain bg-black w-full"
                />
                <button
                  id="btn-snap-prescription-photo"
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="px-6 py-2.5 bg-[#007ceb] hover:bg-sky-600 active:scale-95 text-white rounded-full text-xs font-black shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Snapshot 📸</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Document Title & Category Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t.docTitleLabel || 'Document Title'}
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={t.docTitlePlaceholder || 'e.g. Blood Sugar Report, PHC Prescription'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t.categoryLabel || 'Document Category'}
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb]"
            >
              <option value="prescription">{t.catPrescription || 'Prescription Slip (మందుల చీటీ)'}</option>
              <option value="lab_report">{t.catLabReport || 'Lab / Diagnostic Report'}</option>
              <option value="blood_test">{t.catBloodTest || 'Blood Test (రక్త పరీక్ష)'}</option>
              <option value="xray">{t.catXray || 'X-Ray / Scan (ఎక్స్-రే)'}</option>
            </select>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Saved Documents Grid / List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
          {t.savedDocsHeading || 'Your Saved Medical Documents'} ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
            <FolderHeart className="w-10 h-10 mx-auto mb-2 opacity-40 text-sky-600" />
            <p className="text-xs font-medium">{t.noDocsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:border-[#007ceb] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => setSelectedDocForPreview(doc)}
                      className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer shrink-0 relative group"
                    >
                      <img
                        src={doc.dataUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 bg-sky-100 text-[#007ceb] text-[10px] font-black uppercase rounded-lg">
                        {doc.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate mt-1">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Uploaded on {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  {/* Compression Metrics Badge */}
                  <div className="mt-3 p-2 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {formatBytes(doc.originalSizeBytes)} ➔ <strong className="text-[#00a651]">{formatBytes(doc.compressedSizeBytes)}</strong>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#00a651] text-white rounded-full text-[10px] font-black">
                      {doc.compressionRatioPercent}% SAVED
                    </span>
                  </div>
                </div>

                {/* Card Actions: Rename, Preview, Download, Delete */}
                <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openRenameModal(doc)}
                    className="px-2 py-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-200"
                    title={t.renameDocBtn || 'Rename File'}
                  >
                    <Edit3 className="w-3 h-3 text-[#007ceb]" />
                    <span>{t.renameDocBtn || 'Rename'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDocForPreview(doc)}
                      className="p-1.5 rounded-xl text-[#007ceb] hover:bg-sky-50 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={doc.dataUrl}
                      download={`${doc.title}.jpg`}
                      className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-xl text-[#e51b24] hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t.deleteDocBtn || 'Delete Record'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {docToRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#007ceb] flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {t.renameModalTitle || 'Rename Document'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDocToRename(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t.newDocNameLabel || 'New Document Name'}
                </label>
                <input
                  type="text"
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb]"
                  autoFocus
                  placeholder="Enter document title"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToRename(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRename}
                  disabled={!newTitleInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#007ceb] text-white hover:bg-sky-700 disabled:opacity-50 shadow-xs"
                >
                  {t.saveRenameBtn || 'Save Name'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#e51b24] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.confirmDeleteDocTitle || 'Delete Document?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.confirmDeleteDocMsg || 'Are you sure you want to permanently delete this document?'}: <strong>{docToDelete.title}</strong>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e51b24] text-white hover:bg-rose-700 shadow-xs"
                >
                  {t.deleteDocBtn || 'Delete Record'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedDocForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">{selectedDocForPreview.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{formatBytes(selectedDocForPreview.compressedSizeBytes)} • {selectedDocForPreview.compressionRatioPercent}% Compressed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocForPreview(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto my-4 rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center">
                <img
                  src={selectedDocForPreview.dataUrl}
                  alt={selectedDocForPreview.title}
                  className="max-h-[60vh] w-auto rounded-xl object-contain shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedDocForPreview;
                    openRenameModal(d);
                  }}
                  className="px-3 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#007ceb]" />
                  <span>{t.renameDocBtn || 'Rename'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedDocForPreview.dataUrl}
                    download={`${selectedDocForPreview.title}.jpg`}
                    className="px-4 py-2 bg-[#007ceb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Document</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const d = selectedDocForPreview;
                      setDocToDelete(d);
                    }}
                    className="p-2 rounded-xl text-[#e51b24] bg-rose-50 hover:bg-rose-100 text-xs font-bold"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
