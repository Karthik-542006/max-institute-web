import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, X, Check, RefreshCw, AlertCircle, Upload, Square } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const [mode, setMode] = useState('photo'); // 'photo' | 'video'
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCapturedFile(null);
    if (capturedPreview && capturedPreview.startsWith('blob:')) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedPreview(null);
    setCameraError(null);
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    resetState();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported in this browser. Please use file selection.');
      return;
    }

    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please grant camera permissions in browser settings or upload a file.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was found on this system.');
      } else {
        setCameraError('Unable to start camera feed. Please try using file upload instead.');
      }
      setIsCameraActive(false);
    }
  };

  // Switch between Photo and Video capture modes
  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    stopCamera();
  };

  // Capture photo from live video frame
  const takePhoto = () => {
    if (!videoRef.current || !stream) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          setCameraError('Failed to capture photo frame.');
          return;
        }

        const fileName = `camera-photo-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedFile(file);
        setCapturedPreview(previewUrl);
        stopCamera();
      }, 'image/jpeg', 0.9);
    } catch (e) {
      setCameraError('Photo capture error: ' + e.message);
    }
  };

  // Start video recording using MediaRecorder API
  const startRecording = () => {
    if (!stream) return;

    try {
      recordedChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : MediaRecorder.isTypeSupported('video/mp4')
        ? { mimeType: 'video/mp4' }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `camera-video-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedFile(file);
        setCapturedPreview(previewUrl);
        stopCamera();
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) {
      setCameraError('Video recording failed: ' + e.message);
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Accept captured file and send to caller component
  const handleAccept = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      stopCamera();
      resetState();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { stopCamera(); resetState(); onClose(); }}
      title="Camera Capture"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        {!capturedFile && (
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange('photo')}
              disabled={isRecording}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'photo' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-primary'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo Mode</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('video')}
              disabled={isRecording}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'video' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-primary'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Mode</span>
            </button>
          </div>
        )}

        {/* Viewfinder / Preview Display */}
        <div className="relative aspect-[16/10] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
          {capturedPreview ? (
            mode === 'photo' ? (
              <img src={capturedPreview} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <video src={capturedPreview} controls autoPlay className="w-full h-full object-contain" />
            )
          ) : isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-md animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-white/80 flex flex-col items-center gap-3">
              <Camera className="w-12 h-12 text-white/40" />
              {cameraError ? (
                <div className="max-w-md space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-red-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Camera Error</span>
                  </div>
                  <p className="text-xs text-slate-300">{cameraError}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-white mb-1">Live Camera Preview</p>
                  <p className="text-xs text-slate-400">Click start camera below to request permission and start feed.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {capturedFile ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={RefreshCw}
                onClick={() => { resetState(); startCamera(); }}
              >
                Retake
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={Check}
                onClick={handleAccept}
              >
                Use Captured {mode === 'photo' ? 'Photo' : 'Video'}
              </Button>
            </>
          ) : isCameraActive ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>

              {mode === 'photo' ? (
                <button
                  type="button"
                  onClick={takePhoto}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              ) : isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={Camera}
                onClick={startCamera}
              >
                Start Camera Feed
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => { stopCamera(); resetState(); onClose(); }}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
