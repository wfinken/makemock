import React, { useState, useRef, useEffect } from 'react';
import ModelViewer from './components/ModelViewer';
import ConfigPanel from './components/ConfigPanel';
import './App.css';

function App() {
  const viewerRef = useRef();

  // Track window size to trigger re-render on resize
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [config, setConfig] = useState({
    color: '#343434',
    textureUrl: null,
    movementType: 'static', // 'static', 'autoRotate', 'bounceWiggle'
    rotationSpeed: 0.5,
    bounceSpeed: 1.5,
    bounceHeight: 1.5,
    wiggleSpeed: 1.0,
    wiggleIntensity: 1.0,
    userInteraction: true,
    cameraPosition: null, // { position: [x,y,z], target: [x,y,z] }
    backgroundType: 'solid', // 'transparent', 'solid', 'gradient'
    backgroundColor: '#e5e7eb',
    backgroundGradientStart: '#ffffff',
    backgroundGradientEnd: '#e5e7eb',
    backgroundGradientAngle: 45,
    aspectRatio: 'native', // 'native', '9:16', '16:9', '4:3', '1:1'
    lightingPreset: 'city',
    screenRoughness: 0.2, // 0-1
    screenEmissive: 0.0, // 0-2 (intensity)
    dofEnabled: false,
    dofFocusDistance: 0,
    dofBokehScale: 2,
    shadowOpacity: 0.6,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Clear interval ref to clean up if component unmounts (though unlikely for App)
  const timerRef = useRef(null);

  const handleExportImage = () => {
    if (viewerRef.current) {
      viewerRef.current.takeScreenshot();
    }
  };

  const handleRecordVideo = (duration) => {
    if (viewerRef.current) {
      // Start actual recording
      viewerRef.current.recordVideo(duration);

      // Start UI countdown
      setIsRecording(true);
      setRecordingTime(Math.ceil(duration / 1000));

      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRecording(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleResetModel = () => {
    if (viewerRef.current) {
      viewerRef.current.resetModel();
    }
  };

  return (
    <div className="App" style={{
      display: 'flex',
      flexDirection: 'row',
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <ConfigPanel
        config={config}
        setConfig={setConfig}
        onExportImage={handleExportImage}
        onRecordVideo={handleRecordVideo}
        onResetModel={handleResetModel}
      />
      <ModelViewer config={config} setConfig={setConfig} ref={viewerRef} />

      {/* Recording Indicator */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: 'rgba(255, 59, 48, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'pulse 1s infinite'
          }} />
          <span>REC</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{recordingTime}s</span>
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.85); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default App;
