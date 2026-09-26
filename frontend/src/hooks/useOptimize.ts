import { useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { api, OptimizeRequest, BenchmarkRequest } from '../services/api';

export const useOptimize = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    startLocation,
    stops,
    algorithm,
    fleetSize,
    vehicleCapacity,
    isRoundTrip,
    trafficEnabled,
    trafficHour,
    hazardsEnabled,
    mileage,
    fuelPrice,
    algorithmParams,
    setIsOptimizing,
    setIsLoading,
    setLiveProgress,
    setLiveEnergy,
    appendLiveHistory,
    clearLiveHistory,
    setOptimizedResult,
    setBenchmarkResults,
    setIsBenchmarking,
    setActiveTab
  } = useAppStore();

  const runRestFallback = async (payload: any) => {
    try {
      const data = await api.optimize(payload);
      setOptimizedResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Optimization failed');
    } finally {
      setIsOptimizing(false);
      setIsLoading(false);
    }
  };

  const runOptimization = useCallback(async () => {
    if (!startLocation) {
      setError('Please set a central depot / start location.');
      return;
    }
    if (stops.length === 0) {
      setError('Please add at least one destination stop.');
      return;
    }

    setError(null);
    setIsOptimizing(true);
    setIsLoading(true);
    setLiveProgress(0);
    clearLiveHistory();
    setLiveEnergy(null);

    const payload: OptimizeRequest = {
      start_location: startLocation,
      stops,
      algorithm,
      fleet_size: fleetSize,
      num_vehicles: fleetSize,
      vehicle_capacity: vehicleCapacity,
      round_trip: isRoundTrip,
      traffic_enabled: trafficEnabled,
      traffic_hour: trafficHour,
      hazards_enabled: hazardsEnabled,
      algorithm_params: algorithmParams,
    };

    // 1. Try WebSocket connection for live iteration streaming
    let wsSupported = true;
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/optimize';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify(payload));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'progress') {
            setLiveProgress(msg.progress_pct);
            setLiveEnergy(msg.current_energy);
            appendLiveHistory(msg.current_energy);
          } else if (msg.type === 'completed' || msg.type === 'complete') {
            setOptimizedResult(msg);
            setIsOptimizing(false);
            setIsLoading(false);
            ws.close();
          } else if (msg.type === 'error') {
            setError(msg.message || 'Optimization failed');
            setIsOptimizing(false);
            setIsLoading(false);
            ws.close();
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = async () => {
        wsSupported = false;
        ws.close();
        // Fallback to REST API
        await runRestFallback(payload);
      };
    } catch {
      wsSupported = false;
      await runRestFallback(payload);
    }
  }, [
    startLocation,
    stops,
    algorithm,
    fleetSize,
    vehicleCapacity,
    isRoundTrip,
    trafficEnabled,
    trafficHour,
    hazardsEnabled,
    algorithmParams,
  ]);

  const runBenchmark = useCallback(async () => {
    if (!startLocation || stops.length === 0) return;

    setIsBenchmarking(true);
    setError(null);

    try {
      const payload: BenchmarkRequest = {
        start_location: startLocation,
        stops,
        algorithms: ['QPSO', 'Classical PSO', 'Genetic Algorithm', 'Ant Colony', 'Exact Solver'],
        fleet_size: fleetSize,
        num_vehicles: fleetSize,
        vehicle_capacity: vehicleCapacity,
        traffic_enabled: trafficEnabled,
        traffic_hour: trafficHour,
        trials_per_algo: 1,
      };

      const data = await api.benchmark(payload);
      setBenchmarkResults(data);
      setActiveTab('optimizer');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Benchmark run failed');
    } finally {
      setIsBenchmarking(false);
    }
  }, [
    startLocation,
    stops,
    fleetSize,
    vehicleCapacity,
    trafficEnabled,
    trafficHour,
  ]);

  return { runOptimization, runBenchmark, error };
};

export default useOptimize;
