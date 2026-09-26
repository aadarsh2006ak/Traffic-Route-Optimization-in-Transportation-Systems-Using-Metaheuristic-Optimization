# backend/app/optimizers/__init__.py
from .qpso import qpso_solver, QPSOSolver
from .classical_pso import classical_pso_solver, ClassicalPSOSolver
from .genetic_algorithm import genetic_solver, GeneticAlgorithmSolver
from .ant_colony import ant_colony_solver, AntColonySolver
from .exact_methods import exact_solver, ExactMethodsSolver

ALGORITHM_REGISTRY = {
    "QPSO": qpso_solver,
    "Quantum-Behaved PSO": qpso_solver,
    "Classical PSO": classical_pso_solver,
    "PSO": classical_pso_solver,
    "Genetic Algorithm": genetic_solver,
    "GA": genetic_solver,
    "Ant Colony": ant_colony_solver,
    "ACO": ant_colony_solver,
    "Exact Solver": exact_solver,
    "Dijkstra / Exact": exact_solver
}

__all__ = [
    "qpso_solver",
    "QPSOSolver",
    "classical_pso_solver",
    "ClassicalPSOSolver",
    "genetic_solver",
    "GeneticAlgorithmSolver",
    "ant_colony_solver",
    "AntColonySolver",
    "exact_solver",
    "ExactMethodsSolver",
    "ALGORITHM_REGISTRY"
]
