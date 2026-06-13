"""シミュレーション実行ユースケース。"""

from s4web.domain.entities.simulation import SimulationCondition, Spectrum
from s4web.domain.ports.solver_port import SolverPort


class RunSimulationUseCase:
    """注入されたソルバーを通して RCWA シミュレーションを実行する。"""

    def __init__(self, solver: SolverPort) -> None:
        self._solver = solver

    def execute(self, condition: SimulationCondition) -> Spectrum:
        spectrum = self._solver.solve(condition)
        if len(spectrum.wavelengths_nm) != condition.wl_points:
            raise RuntimeError(
                "solver returned a spectrum whose length "
                f"({len(spectrum.wavelengths_nm)}) does not match the "
                f"requested wl_points ({condition.wl_points})"
            )
        return spectrum
