import { useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { api, OptimizeRequest } from '../api/client';

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
    mileage,
    fuelPrice,
    algorithmParams,
    setIsOptimizing,
    setLiveProgress,
    setLiveEnergy,
    appendLiveHistory,
    clearLiveHistory,
    setOptimizedResult,
  } = useAppStore();

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
    setLiveProgress(0);
    clearLiveHistory();
    setLiveEnergy(null);

    const payload: OptimizeRequest = {
      start_location: startLocation,
      stops,
      algorithm,
      fleet_size: fleetSize,
      vehicle_capacity: vehicleCapacity,
      round_trip: isRoundTrip,
      traffic_enabled: trafficEnabled,
      traffic_hour: trafficHour,
      mileage_km_per_l: mileage,
      fuel_price_per_l: fuelPrice,
      algorithm_params: algorithmParams,
    };

    // 1. Try WebSocket connection for live iteration streaming
    let wsSupported = true;
    try {
      const wsUrl = `ws://127.0.0.1:8000/ws/optimize`;
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
          } else if (msg.type === 'complete') {
            setOptimizedResult(msg);
            setIsOptimizing(false);
            ws.close();
          } else if (msg.type === 'error') {
            setError(msg.message || 'Optimization failed');
            setIsOptimizing(false);
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

    async function runRestFallback(reqPayload: OptimizeRequest) {
      try {
        const data = await api.optimize(reqPayload);
        setOptimizedResult(data);
        setIsOptimizing(false);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Optimization execution failed.');
        setIsOptimizing(false);
      }
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
    mileage,
    fuelPrice,
    algorithmParams,
  ]);

  return { runOptimization, error };
};
