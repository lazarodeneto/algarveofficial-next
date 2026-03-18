"use client";
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
 * - Mobile devices (as a fallback when connection info unavailable)
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
      ) || window.innerWidth < 768;
      setIsMobile(mobile);
      return mobile;
    };

    const mobile = checkMobile();

    // Get network connection API
    const connection = 
      navigator.connection || 
      navigator.mozConnection || 
      navigator.webkitConnection;

    const updateConnectionQuality = () => {
      if (!connection) {
        // No connection API available - use mobile as fallback indicator
        setQuality(mobile ? 'slow' : 'unknown');
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
      const nowMobile = checkMobile();
      if (!connection) {
        setQuality(nowMobile ? 'slow' : 'unknown');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    quality,
    isSlow: quality === 'slow' || (quality === 'unknown' && isMobile),
    isMobile,
  };
}
