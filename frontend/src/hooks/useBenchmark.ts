import { useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { api, BenchmarkRequest } from '../api/client';

export const useBenchmark = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    startLocation,
    stops,
    fleetSize,
    vehicleCapacity,
    isRoundTrip,
    trafficEnabled,
    trafficHour,
    setIsBenchmarking,
    setBenchmarkResults,
  } = useAppStore();

  const runBenchmarkSuite = useCallback(
    async (selectedAlgorithms: string[]) => {
      if (!startLocation || stops.length === 0) {
        setError('Please load stops first from the Route Optimizer sidebar.');
        return;
      }

      setError(null);
      setIsBenchmarking(true);

      const payload: BenchmarkRequest = {
        start_location: startLocation,
        stops,
        algorithms: selectedAlgorithms,
        fleet_size: fleetSize,
        vehicle_capacity: vehicleCapacity,
        round_trip: isRoundTrip,
        traffic_enabled: trafficEnabled,
        traffic_hour: trafficHour,
      };

      try {
        const data = await api.benchmark(payload);
        setBenchmarkResults(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Benchmark execution failed.');
      } finally {
        setIsBenchmarking(false);
      }
    },
    [startLocation, stops, fleetSize, vehicleCapacity, isRoundTrip, trafficEnabled, trafficHour]
  );

  return { runBenchmarkSuite, error };
};
