# Mathematical Formulation: Capacitated Vehicle Routing with Time Windows & Quantum-Behaved PSO

## 1. Transportation Network Graph Representation

The road transportation network is modeled as a directed weighted graph:
$$\mathcal{G} = (V, E, W)$$

Where:
- $V = \{0, 1, 2, \dots, n\}$ represents the vertex set:
  - $0$: Central Depot / Distribution Hub.
  - $V' = V \setminus \{0\} = \{1, 2, \dots, n\}$: Customer delivery destinations.
- $E = \{(i, j) \mid i, j \in V, i \neq j\}$: Set of directed road arcs between locations.
- $K = \{1, 2, \dots, m\}$: Set of available fleet dispatch vehicles.
- $W = \{ (d_{ij}, t_{ij}, \theta(t)) \mid (i,j) \in E \}$: Distance, base free-flow travel time, and time-dependent congestion multiplier.

---

## 2. Decision Variables

$$x_{ijk} = \begin{cases} 
1 & \text{if vehicle } k \in K \text{ travels directly along arc } (i, j) \in E \\ 
0 & \text{otherwise} 
\end{cases}$$

- $s_{ik} \ge 0$: Service start / arrival time of vehicle $k$ at node $i$.
- $u_{ik} \ge 0$: Cumulative load / demand serviced by vehicle $k$ after visiting node $i$.

---

## 3. Multi-Objective Optimization Problem

$$\min \mathcal{Z} = \sum_{k \in K} \sum_{i \in V} \sum_{j \in V, j \neq i} \Big( c_{\text{fuel}} \cdot d_{ij} + c_{\text{time}} \cdot t_{ij} \cdot \theta(s_{ik}) \Big) x_{ijk} + \sum_{i \in V'} \mathcal{P}_{\text{TW}}(s_i) + \sum_{k \in K} \mathcal{P}_{\text{Cap}}(u_k)$$

### Dynamic Congestion Multiplier $\theta(t)$
$$\theta(t) = 1.0 + \sum_{p \in \text{Peaks}} \alpha_p \cdot \exp\left(-\frac{(t - \mu_p)^2}{2\sigma_p^2}\right)$$

### Penalty Formulations
1. **Time Window Penalty**:
   $$\mathcal{P}_{\text{TW}}(s_i) = \lambda_{\text{late}} \cdot \max(0, s_i - l_i) + \lambda_{\text{early}} \cdot \max(0, e_i - s_i)$$
2. **Vehicle Capacity Penalty**:
   $$\mathcal{P}_{\text{Cap}}(u_k) = \lambda_{\text{cap}} \cdot \max\left(0, \sum_{i \in V'} q_i x_{ijk} - Q_k\right)$$

---

## 4. Problem Constraints

1. **Every Customer Visited Exactly Once**:
   $$\sum_{k \in K} \sum_{j \in V, j \neq i} x_{ijk} = 1, \quad \forall i \in V'$$

2. **Depot Flow Conservation**:
   $$\sum_{j \in V'} x_{0jk} = \sum_{i \in V'} x_{i0k} \leq 1, \quad \forall k \in K$$

3. **Sub-tour Elimination & Continuity**:
   $$\sum_{i \in V, i \neq j} x_{ijk} - \sum_{l \in V, l \neq j} x_{jlk} = 0, \quad \forall j \in V', \forall k \in K$$

4. **Vehicle Capacity Bounds**:
   $$u_{ik} + q_j - M(1 - x_{ijk}) \leq u_{jk}, \quad \forall (i, j) \in E, \forall k \in K$$
   $$q_i \leq u_{ik} \leq Q_k, \quad \forall i \in V', \forall k \in K$$

5. **Time Window Progression**:
   $$s_{ik} + \tau_{\text{service}, i} + t_{ij} \cdot \theta(s_{ik}) - M(1 - x_{ijk}) \leq s_{jk}, \quad \forall (i, j) \in E, \forall k \in K$$

---

## 5. Quantum-Behaved Particle Swarm Optimization (QPSO) Theory

QPSO treats each candidate tour in a continuous $D$-dimensional Hilbert space under a **Delta Potential Well** centered at the local attractor $p_i$:

1. **Mean Best Position ($mBest$)**:
   $$mBest(t) = \frac{1}{M} \sum_{i=1}^{M} P_i(t) = \left( \frac{1}{M}\sum_{i=1}^M P_{i1}(t), \dots, \frac{1}{M}\sum_{i=1}^M P_{iD}(t) \right)$$

2. **Local Attractor ($p_i$)**:
   $$p_{id}(t) = \phi_d(t) P_{id}(t) + (1 - \phi_d(t)) G_d(t), \quad \phi_d(t) \sim \mathcal{U}(0, 1)$$

3. **Wavefunction Collapse Position Update**:
   $$X_{id}(t+1) = p_{id}(t) \pm \beta(t) \cdot |mBest_d(t) - X_{id}(t)| \cdot \ln\left(\frac{1}{u_{id}(t)}\right), \quad u_{id}(t) \sim \mathcal{U}(0, 1)$$

4. **Contraction-Expansion Schedule**:
   $$\beta(t) = \beta_{\max} - \frac{t}{T_{\max}}(\beta_{\max} - \beta_{\min})$$
