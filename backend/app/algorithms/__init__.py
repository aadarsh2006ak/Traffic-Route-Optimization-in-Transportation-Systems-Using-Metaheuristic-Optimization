# backend/app/algorithms/__init__.py
from .qpso import qpso_solver, QPSOSolver
from .simulated_annealing import sa_solver, SimulatedAnnealingSolver
from .genetic_algorithm import ga_solver, GeneticAlgorithmSolver
from .ant_colony import aco_solver, AntColonySolver
from .classical_pso import classical_pso_solver, ClassicalPSOSolver
from .exact_solver import exact_solver, ExactSolver
from .shortest_path import shortest_path_finder, ShortestPathFinder

ALGORITHM_REGISTRY = {
    "QPSO": qpso_solver,
    "Simulated Annealing": sa_solver,
    "Genetic Algorithm": ga_solver,
    "Ant Colony": aco_solver,
    "Classical PSO": classical_pso_solver,
    "Exact Solver": exact_solver
}
