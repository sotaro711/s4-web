"""RCWA ソルバーのポート（抽象）。

infrastructure 層のアダプタ（S4 など）がこれを実装する。
domain はこの抽象にのみ依存し、S4 の具体には一切依存しない。
"""

from abc import ABC, abstractmethod

from s4web.domain.entities.simulation import SimulationCondition, Spectrum


class SolverPort(ABC):
    @abstractmethod
    def solve(self, condition: SimulationCondition) -> Spectrum:
        """与えられた条件の反射率 / 透過率スペクトルを計算して返す。"""
        raise NotImplementedError
