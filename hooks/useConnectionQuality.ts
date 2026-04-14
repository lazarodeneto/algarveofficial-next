import { useState, useEffect } from 'react';

type ConnectionQuality = 'fast' | 'slow' | 'unknown';

interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

/**
 * Detects connection quality to optimize media loading.
 * Returns 'slow' for:
 * - Save Data mode enabled
 * - 2G/3G connections
 * - Low downlink speed (<1.5 Mbps)
 *
 * Mobile devices are NOT assumed slow when connection info is unavailable
 * (e.g. Safari/iOS which lacks the Network Information API). This ensures
 * hero videos still play on mobile devices with good connectivity.
 */
export function useConnectionQuality(): {
  quality: ConnectionQuality;
  isSlow: boolean;
  isMobile: boolean;
} {
  const [quality, setQuality] = useState<ConnectionQuality>('unknown');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ?? window.innerWidth < 768;
      setIsMobile(mobile);
      return mobile;
    };

    checkMobile();

    // Get network connection API
    const connection =
      navigator.connection ||
      navigator.mozConnection ?? navigator.webkitConnection;

    const updateConnectionQuality = () => {
      if (!connection) {
        // No connection API available (e.g. Safari/iOS).
        // Default to 'unknown' — do NOT assume mobile means slow,
        // since most mobile devices are on fast Wi-Fi or 4G/5G.
        setQuality('unknown');
        return;
      }

      // Check for Save Data mode first
      if (connection.saveData) {
        setQuality('slow');
        return;
      }

      // Check effective connection type
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
        setQuality('slow');
        return;
      }

      // Check downlink speed (Mbps)
      const downlink = connection.downlink;
      if (downlink !== undefined && downlink < 1.5) {
        setQuality('slow');
        return;
      }

      // 4G or good connection
      setQuality('fast');
    };

    updateConnectionQuality();

    // Listen for connection changes
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateConnectionQuality);
      return () => {
        connection.removeEventListener?.('change', updateConnectionQuality);
      };
    }

    // Also listen for resize to update mobile status
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    quality,
    isSlow: quality === 'slow',
    isMobile,
  };
}
