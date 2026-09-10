import React, { useState } from 'react';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { useBenchmark } from '../hooks/useBenchmark';
import { useAppStore } from '../store/appStore';
import { Award, Zap, Activity } from 'lucide-react';

export const BenchmarkLab: React.FC = () => {
  const { isBenchmarking, benchmarkResults, stops } = useAppStore();
  const { runBenchmarkSuite, error } = useBenchmark();

  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'QPSO',
    'Simulated Annealing',
    'Genetic Algorithm',
    'Ant Colony',
  ]);

  const allAlgorithms = [
    'QPSO',
    'Simulated Annealing',
    'Genetic Algorithm',
    'Ant Colony',
    'Classical PSO',
    'Exact Solver',
  ];

  const handleToggle = (algo: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]
    );
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Control Bar */}
      <div className="glass-panel p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-orbitron font-bold text-sm text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-cyan-400" /> Metaheuristic Algorithm Benchmark Lab
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Execute multi-algorithm comparison across identical distance matrices and traffic profiles.
            </p>
          </div>

          <button
            onClick={() => runBenchmarkSuite(selectedAlgos)}
            disabled={isBenchmarking || selectedAlgos.length === 0}
            className={`px-5 py-2.5 rounded-lg font-orbitron font-bold text-xs flex items-center gap-2 transition-all shadow-neon-cyan ${
              isBenchmarking
                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black'
            }`}
          >
            {isBenchmarking ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Running Benchmark Suite...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>▶️ RUN BENCHMARK SUITE</span>
              </>
            )}
          </button>
        </div>

        {/* Algorithm Checkboxes */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
          {allAlgorithms.map((algo) => (
            <button
              key={algo}
              onClick={() => handleToggle(algo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                selectedAlgos.includes(algo)
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                  : 'bg-[#050711] border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {selectedAlgos.includes(algo) ? '✓ ' : '+ '} {algo}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-2 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Benchmark Results */}
      {benchmarkResults ? (
        <BenchmarkChart />
      ) : (
        <div className="glass-panel p-8 text-center rounded-xl">
          <p className="text-gray-400 font-roboto text-xs">
            Select algorithms above and click <strong>"RUN BENCHMARK SUITE"</strong> to compare QPSO against classical metaheuristics.
          </p>
        </div>
      )}
    </div>
  );
};
