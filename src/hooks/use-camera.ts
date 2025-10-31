import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  hasPermission: boolean | null;
}

interface UseCameraReturn extends CameraState {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  requestPermission: () => Promise<boolean>;
  switchCamera: () => Promise<void>;
}

export const useCamera = (): UseCameraReturn => {
  const [state, setState] = useState<CameraState>({
    stream: null,
    isLoading: false,
    error: null,
    isSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    hasPermission: null,
  });

  const currentFacingMode = useRef<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Camera not supported on this device' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode.current,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      setState(prev => ({
        ...prev,
        stream: mediaStream,
        isLoading: false,
        hasPermission: true,
        error: null,
      }));
    } catch (error: any) {
      let errorMessage = 'Failed to access camera';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        hasPermission: false,
      }));
    }
  }, [state.isSupported]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, stream: null }));
    }
  }, [state.stream]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      // Immediately stop the test stream
      testStream.getTracks().forEach(track => track.stop());

      setState(prev => ({ ...prev, hasPermission: true }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, hasPermission: false }));
      return false;
    }
  }, [state.isSupported]);

  const switchCamera = useCallback(async () => {
    if (!state.stream) return;

    // Stop current stream
    stopCamera();

    // Switch facing mode
    currentFacingMode.current = currentFacingMode.current === 'environment' ? 'user' : 'environment';

    // Start camera with new facing mode
    await startCamera();
  }, [state.stream, stopCamera, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    startCamera,
    stopCamera,
    requestPermission,
    switchCamera,
  };
};