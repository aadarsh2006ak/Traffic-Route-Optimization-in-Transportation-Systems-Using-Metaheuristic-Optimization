# Mathematical Formulation: Capacitated Vehicle Routing with Time Windows (CVRPTW) & Quantum-Behaved Particle Swarm Optimization (QPSO)

**Organization**: Egreen Quanta | **Vertical**: Quantum Technology  
**SIH 2026 Problem Statement 1**: Quantum-Inspired Intelligent Traffic Route Optimization in Transportation Systems Using Metaheuristic Optimization.

---

## 1. Transportation Network Graph Model

The urban transportation network is formalized as a directed, time-dependent weighted graph:

$$\mathcal{G} = (V, E, W(t))$$

Where:
- $V = \{0, 1, 2, \dots, n\}$ is the set of network vertices:
  - Vertex $0$: Central Logistics Depot / Dispatch Hub.
  - $V' = V \setminus \{0\} = \{1, 2, \dots, n\}$: Set of customer delivery destinations / demand nodes.
- $E = \{(i, j) \mid i, j \in V, i \neq j\}$: Set of directed road arcs connecting location $i$ to location $j$.
- $K = \{1, 2, \dots, m\}$: Set of available homogeneous or heterogeneous fleet dispatch vehicles.
- $W(t) = \{ c_{ij}(t) \mid (i,j) \in E \}$: Dynamic time-dependent edge cost weight matrix.

---

## 2. Decision Variables

The optimization model defines the following binary and continuous decision variables:

### 2.1 Binary Routing & Assignment Variables
- **$x_{ijk} \in \{0, 1\}$**: Binary routing variable:
  $$x_{ijk} = \begin{cases} 
  1 & \text{if vehicle } k \in K \text{ travels directly from node } i \text{ to node } j \\ 
  0 & \text{otherwise} 
  \end{cases}$$

- **$y_{ik} \in \{0, 1\}$**: Binary customer service assignment variable:
  $$y_{ik} = \begin{cases} 
  1 & \text{if vehicle } k \in K \text{ serves customer/stop } i \in V' \\ 
  0 & \text{otherwise} 
  \end{cases}$$

### 2.2 Continuous Operational Variables
- **$s_{ik} \ge 0$**: Arrival and service start time of vehicle $k$ at node $i$.
- **$u_{ik} \ge 0$**: Cumulative cargo load carried by vehicle $k$ immediately after departing node $i$.

---

## 3. Objective Function

The primary objective is to minimize total system generalized transportation cost $Z$, encompassing distance-based energy consumption, time-dependent traffic delays, road hazard penalties, and constraint violation penalties:

$$\min Z = \sum_{k \in K} \sum_{i \in V} \sum_{j \in V, j \neq i} c_{ij}(t) \cdot x_{ijk} + \sum_{i \in V'} \mathcal{P}_{\text{TW}}(s_i) + \sum_{k \in K} \mathcal{P}_{\text{Cap}}(u_k) + \sum_{(i,j) \in E} \mathcal{P}_{\text{Hazard}}(i, j)$$

Where the time-dependent dynamic edge cost $c_{ij}(t)$ is defined as:

$$c_{ij}(t) = \text{base\_distance}_{ij} \times \theta(t) \times \gamma_{\text{hazard}}(i, j)$$

### 3.1 Dynamic Traffic Congestion Multiplier $\theta(t)$
Traffic congestion is modeled via a multi-modal Gaussian distribution simulating morning, midday, and evening peak rush hours:

$$\theta(t) = 1.0 + \sum_{p \in \text{Peaks}} \alpha_p \cdot \exp\left( -\frac{(t - \mu_p)^2}{2\sigma_p^2} \right)$$

- $\mu_p$: Peak hour center (e.g., $8.5\text{ h}$ for Morning Rush, $18.0\text{ h}$ for Evening Rush).
- $\sigma_p$: Spread/duration of the rush period ($1.0\text{ h} - 1.2\text{ h}$).
- $\alpha_p$: Congestion amplitude factor ($+70\% \text{ to } +80\%$ increase in travel time).

### 3.2 Road Hazard / Incident Multiplier $\gamma_{\text{hazard}}(i, j)$
Detected computer vision road hazards (potholes, accidents, flood zones) inject localized penalty multipliers:

$$\gamma_{\text{hazard}}(i, j) = 1.0 + \sum_{h \in \mathcal{H}} \frac{k_{\text{penalty}} \cdot \text{severity}_h}{\max(\text{dist}(h, \text{segment}(i, j)), \epsilon)}$$

---

## 4. Problem Constraints (Formal Specification)

The optimization is subject to the following strict operational constraints:

### 1. Customer Coverage Constraint (Each stop visited exactly once):
$$\sum_{k \in K} y_{ik} = 1, \quad \forall i \in V'$$

### 2. Vehicle Capacity Constraint (CVRP):
$$\sum_{i \in V'} \text{demand}_i \cdot y_{ik} \le Q_k, \quad \forall k \in K$$
*Where $Q_k$ is the maximum payload capacity of vehicle $k$, and $\text{demand}_i$ is the delivery quantity for stop $i$.*

### 3. Time Window Constraint (CVRPTW):
$$e_i \le s_{ik} \le l_i, \quad \forall i \in V', \forall k \in K$$
*Where $[e_i, l_i]$ is the designated delivery time window for stop $i$. Early arrivals incur waiting time, while late arrivals incur quadratic penalty $\mathcal{P}_{\text{TW}}$.*

### 4. Flow Conservation Constraint:
$$\sum_{j \in V, j \neq i} x_{ijk} = \sum_{j \in V, j \neq i} x_{jik} = y_{ik}, \quad \forall i \in V', \forall k \in K$$
*(Ensures that whenever vehicle $k$ enters node $i$, it must depart from node $i$ to another node).*

### 5. Sub-Tour Elimination Constraint:
$$\sum_{i \in S} \sum_{j \in S, j \neq i} x_{ijk} \le |S| - 1, \quad \forall S \subseteq V', |S| \ge 2, \forall k \in K$$
*(Guarantees no isolated closed disconnected loops exist disjoint from the central depot).*

### 6. Depot Start and End Constraint:
$$\sum_{j \in V'} x_{0jk} = \sum_{i \in V'} x_{i0k} = 1, \quad \forall k \in K \text{ (for vehicles used)}$$
*(Ensures every dispatched vehicle starts at depot $0$ and completes its route by returning to depot $0$).*

---

## 5. Quantum-Behaved Particle Swarm Optimization (QPSO) Formulation

Classical PSO particles rely on Newtonian position and velocity updates, which frequently trap swarms in high-dimensional local minima when optimizing complex transportation graphs under congestion.

QPSO replaces classical trajectories with **Quantum Mechanical State Wavefunctions** governed by the **Schrödinger Equation in a Delta Potential Well**:

### 5.1 Swarm State & Mean Best Position ($mBest$)
For a swarm of $M$ particles in $D$-dimensional Hilbert space, the **Mean Best Position** $mBest(t)$ aggregates the historical cognitive experiences across all particles:

$$mBest(t) = \frac{1}{M} \sum_{i=1}^{M} P_i(t) = \left( \frac{1}{M}\sum_{i=1}^M P_{i1}(t), \; \frac{1}{M}\sum_{i=1}^M P_{i2}(t), \; \dots, \; \frac{1}{M}\sum_{i=1}^M P_{iD}(t) \right)$$

### 5.2 Stochastic Local Attractor ($p_i$)
Each particle $i$ is attracted to a stochastically weighted quantum center between its personal best position $P_i(t)$ and the global swarm best position $G(t)$:

$$p_{id}(t) = \phi_d(t) \cdot P_{id}(t) + (1 - \phi_d(t)) \cdot G_d(t), \quad \phi_d(t) \sim \mathcal{U}(0, 1)$$

### 5.3 Quantum Wavefunction Collapse & Position Update
Solving the Schrödinger equation $|\psi(X)|^2 = \frac{1}{L}\exp\left(-\frac{2|X - p|}{L}\right)$ yields the quantum state collapse update rule using Monte Carlo inversion:

$$X_{id}(t+1) = p_{id}(t) \pm \beta(t) \cdot |mBest_d(t) - X_{id}(t)| \cdot \ln\left( \frac{1}{u_{id}(t)} \right), \quad u_{id}(t) \sim \mathcal{U}(0, 1)$$

Where:
- $\pm$: Chosen with equal probability ($50\%$ positive / $50\%$ negative tunneling direction).
- $\beta(t)$: **Contraction-Expansion (CE) Coefficient** dynamically decayed over iterations:
  $$\beta(t) = \beta_{\max} - \frac{t}{T_{\max}}(\beta_{\max} - \beta_{\min})$$
  *(Typically $\beta_{\max} = 1.20, \; \beta_{\min} = 0.50$ to facilitate broad quantum exploration early, and sharp convergence refinement late).*

### 5.4 Fitness Evaluation & Solution Decoding
Continuous quantum position vectors $X_i \in \mathbb{R}^D$ are decoded into discrete route permutations via **Random-Key Encoding (RKE)** followed by $k$-means multi-vehicle clustering and 2-Opt local refinement:

$$f(X) = Z \quad \text{(Evaluated directly on decoded permutation via constraint handler)}$$

---

## 6. Code Variable & Notation Mapping Table

| Mathematical Symbol | Code Implementation Variable | Module File | Description |
| :--- | :--- | :--- | :--- |
| $\mathcal{G} = (V, E, W)$ | `nx.DiGraph`, `nodes`, `edges` | `backend/app/core/graph_model.py` | NetworkX graph representation |
| $c_{ij}(t)$ | `dist_matrix[u][v]`, `effective_edge_time` | `backend/app/core/constraints.py` | Dynamic composite edge cost |
| $\theta(t)$ | `traffic_sim.get_congestion_factor(t)` | `backend/app/core/traffic_sim.py` | Gaussian peak-hour congestion multiplier |
| $\gamma_{\text{hazard}}(i,j)$ | `hazard_cost_matrix[u][v]` | `backend/app/services/cv_hazard_service.py` | CV road hazard penalty multiplier |
| $x_{ijk}, y_{ik}$ | `route_indices`, `perm` | `backend/app/algorithms/qpso.py` | Permutation & route assignment |
| $Q_k$ | `vehicle_capacity` | `backend/app/core/constraints.py` | Maximum vehicle capacity |
| $[e_i, l_i]$ | `node["window"] = (start_w, end_w)` | `backend/app/core/constraints.py` | Customer time window bounds |
| $mBest(t)$ | `mBest = np.mean(P, axis=0)` | `backend/app/algorithms/qpso.py` | Swarm mean best position vector |
| $p_{id}(t)$ | `p_attr = phi * P[i] + (1 - phi) * G` | `backend/app/algorithms/qpso.py` | Local attractor vector |
| $\beta(t)$ | `beta = beta_max - (it/max_iter)*(...)` | `backend/app/algorithms/qpso.py` | Contraction-expansion coefficient |
| $\ln(1/u)$ | `np.log(1.0 / u)` | `backend/app/algorithms/qpso.py` | Quantum delta-well jump magnitude |
