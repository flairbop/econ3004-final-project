import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { AnalysisStatusResponse, CareerReport } from '../types';

interface UseAnalysisReturn {
  status: AnalysisStatusResponse | null;
  report: CareerReport | null;
  isLoading: boolean;
  error: string | null;
  pollStatus: (sessionId: string) => Promise<void>;
  fetchReport: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatusResponse | null>(null);
  const [report, setReport] = useState<CareerReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const pollStatus = useCallback(async (sessionId: string) => {
    try {
      const statusResponse = await api.getAnalysisStatus(sessionId);
      setStatus(statusResponse);

      if (statusResponse.status === 'completed') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        await fetchReport(sessionId);
      } else if (statusResponse.status === 'failed') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError(statusResponse.errorMessage || 'Analysis failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error polling status:', err);
    }
  }, []);

  const startPolling = useCallback((sessionId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsLoading(true);
    pollStatus(sessionId);

    pollingRef.current = setInterval(() => {
      pollStatus(sessionId);
    }, 3000);
  }, [pollStatus]);

  const fetchReport = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const reportData = await api.getReport(sessionId);
      setReport(reportData);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    status,
    report,
    isLoading,
    error,
    pollStatus: startPolling,
    fetchReport,
    clearError,
  };
}

function fetchReport(sessionId: string) {
  throw new Error('Function not implemented.');
}