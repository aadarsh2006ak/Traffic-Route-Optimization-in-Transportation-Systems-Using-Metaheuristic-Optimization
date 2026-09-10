# frontend/components/math_view.py
import streamlit as st

def render_math_view():
    """Renders the formal Mathematical Formulation and Quantum Mechanics equations."""
    st.markdown("### 📐 Formal Mathematical Formulation & Quantum Theory")
    st.caption("Mixed-Integer Linear Programming (MILP) & Quantum Delta-Well formulation for the Vehicle Routing Problem.")

    st.markdown("""
    #### 1. Graph-Based Network Modeling
    The transportation network is represented as a directed graph $G = (V, E)$, where:
    - $V = \{0, 1, \dots, N\}$ is the set of vertices ($0$ is the Central Depot/Warehouse, and $V' = V \setminus \{0\}$ are customer delivery locations).
    - $E = \{(i, j) \mid i, j \in V, i \neq j\}$ is the set of directed road segments.
    - $K = \{1, \dots, M\}$ is the fleet of homogeneous/heterogeneous vehicles.
    """)

    st.latex(r"""
    x_{ijk} = \begin{cases} 
    1 & \text{if vehicle } k \in K \text{ travels directly from node } i \text{ to node } j \\ 
    0 & \text{otherwise} 
    \end{cases}
    """)

    st.markdown("""
    #### 2. Multi-Objective Cost Function
    The objective is to minimize total routing distance, time-dependent traffic latency, delivery time-window violation penalties, and vehicle overload penalties:
    """)

    st.latex(r"""
    \min \mathcal{Z} = \sum_{k \in K} \sum_{i \in V} \sum_{j \in V, j \neq i} \Big( c_{\text{fuel}} \cdot d_{ij} + c_{\text{time}} \cdot t_{ij} \cdot \theta(t) \Big) x_{ijk} + \sum_{i \in V'} \mathcal{P}_{\text{TW}}(s_i) + \sum_{k \in K} \mathcal{P}_{\text{Cap}}(u_k)
    """)

    st.markdown("""
    Where:
    - $d_{ij}$: True road geodesic or OSRM distance between nodes $i$ and $j$.
    - $t_{ij}$: Free-flow travel duration.
    - $\theta(t)$: Dynamic time-of-day traffic congestion multiplier:
    """)

    st.latex(r"""
    \theta(t) = 1.0 + \sum_{p \in \text{Peaks}} \alpha_p \cdot \exp\left(-\frac{(t - \mu_p)^2}{2\sigma_p^2}\right)
    """)

    st.markdown("""
    - $\mathcal{P}_{\text{TW}}(s_i) = \lambda_{\text{late}} \max(0, s_i - l_i) + \lambda_{\text{early}} \max(0, e_i - s_i)$: Lateness penalty for window $[e_i, l_i]$.
    - $\mathcal{P}_{\text{Cap}}(u_k) = \lambda_{\text{cap}} \max(0, \sum_{i \in V'} q_i x_{ijk} - Q_k)$: Vehicle capacity violation penalty.
    """)

    st.markdown("---")

    st.markdown("""
    #### 3. Quantum-Behaved Particle Swarm Optimization (QPSO) Theory
    In classical PSO, particles follow deterministic Newtonian mechanics with velocity $V_i$. In **QPSO**, particles exist in a **quantum state governed by the Schrödinger Equation under a Delta Potential Well** centered at the local attractor $p_i$.
    """)

    st.markdown("**1. Mean Best Position ($mBest$):**")
    st.latex(r"""
    mBest(t) = \frac{1}{M} \sum_{i=1}^{M} P_i(t) = \left( \frac{1}{M}\sum_{i=1}^M P_{i1}, \dots, \frac{1}{M}\sum_{i=1}^M P_{iD} \right)
    """)

    st.markdown("**2. Local Attractor Point ($p_i$):**")
    st.latex(r"""
    p_{id}(t) = \phi_d(t) \cdot P_{id}(t) + (1 - \phi_d(t)) \cdot G_d(t), \quad \phi_d(t) \sim \mathcal{U}(0, 1)
    """)

    st.markdown("**3. Quantum Wavefunction Collapse Position Update:**")
    st.latex(r"""
    X_{id}(t+1) = p_{id}(t) \pm \beta(t) \cdot |mBest_d(t) - X_{id}(t)| \cdot \ln\left(\frac{1}{u_{id}(t)}\right), \quad u_{id}(t) \sim \mathcal{U}(0, 1)
    """)

    st.markdown("""
    - $\beta(t) = \beta_{\max} - \frac{t}{T_{\max}}(\beta_{\max} - \beta_{\min})$ is the **Contraction-Expansion Coefficient**.
    - Continuous positions $X_i \in \mathbb{R}^D$ are mapped to discrete permutations using **Random-Key Encoding (RKE)** followed by **2-Opt local search**.
    """)
