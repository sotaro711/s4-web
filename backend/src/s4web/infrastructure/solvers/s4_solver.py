"""S4 を用いた SolverPort の実装（infrastructure 層）。

S4 の C 拡張に依存する唯一の場所。domain / application はこのモジュールを知らない。
SimulationCondition を S4 の API 呼び出しに変換し、波長を掃引して R/T を得る。

単位: domain は nm。S4 は無次元（長さの単位を1つ選んで一貫すればよい）なので、
内部では μm に統一する（周期・厚さ・波長をすべて μm に換算）。
"""

import S4  # type: ignore[import-not-found]

from s4web.domain.entities.layer import Layer
from s4web.domain.entities.simulation import (
    Polarization,
    SimulationCondition,
    Spectrum,
)
from s4web.domain.ports.solver_port import SolverPort

_NM_PER_UM = 1000.0

# 波長と周期が一致する点（λ = period/m）では回折次数が grazing になり、
# RCWA の計算が特異化して NaN を返す（Rayleigh / Wood anomaly）。
# 波長を相対的に僅かにずらして特異点を避ける（物理的に無視できる量）。
_RAYLEIGH_EPS = 1e-7


class S4Solver(SolverPort):
    def solve(self, condition: SimulationCondition) -> Spectrum:
        sim = self._build(condition)

        top_name = _layer_name(0, condition.layers[0])
        bottom_name = _layer_name(len(condition.layers) - 1, condition.layers[-1])

        wls = condition.wavelengths_nm()
        reflectance: list[float] = []
        transmittance: list[float] = []
        for wl_nm in wls:
            wl_um = wl_nm / _NM_PER_UM * (1.0 + _RAYLEIGH_EPS)
            sim.SetFrequency(1.0 / wl_um)
            forw_top, back_top = sim.GetPowerFlux(S4_Layer=top_name)
            forw_bot, _ = sim.GetPowerFlux(S4_Layer=bottom_name)
            incident = forw_top.real
            if incident == 0.0:
                reflectance.append(0.0)
                transmittance.append(0.0)
                continue
            # 入射層の後退波 = 反射、基板層の前進波 = 透過。入射パワーで規格化。
            reflectance.append(-back_top.real / incident)
            transmittance.append(forw_bot.real / incident)

        return Spectrum(
            wavelengths_nm=tuple(wls),
            reflectance=tuple(reflectance),
            transmittance=tuple(transmittance),
        )

    def _build(self, condition: SimulationCondition):  # noqa: ANN202 (S4 の型は未公開)
        period_um = condition.period_nm / _NM_PER_UM
        sim = S4.New(
            Lattice=((period_um, 0.0), (0.0, 0.0)),  # 1D 格子（第2ベクトルは0）
            NumBasis=condition.num_orders,
        )

        # 材料を先に登録する（層が参照する前に存在している必要がある）。
        for i, layer in enumerate(condition.layers):
            sim.SetMaterial(Name=_bg_mat_name(i), Epsilon=layer.material.epsilon)
            if layer.grating is not None:
                sim.SetMaterial(
                    Name=_grating_mat_name(i),
                    Epsilon=layer.grating.material.epsilon,
                )

        # 層を入射側から順に追加する。
        for i, layer in enumerate(condition.layers):
            sim.AddLayer(
                Name=_layer_name(i, layer),
                Thickness=layer.thickness_nm / _NM_PER_UM,
                S4_Material=_bg_mat_name(i),
            )
            if layer.grating is not None:
                # 背景材料が1周期を満たし、幅 fill_factor*period のストライプを置く。
                half_um = layer.grating.fill_factor * period_um / 2.0
                sim.SetRegionRectangle(
                    S4_Layer=_layer_name(i, layer),
                    S4_Material=_grating_mat_name(i),
                    Center=(0.0, 0.0),
                    Angle=0.0,
                    Halfwidths=(half_um, 0.0),
                )

        # 平面波励起。s 偏光 → sAmplitude のみ、p 偏光 → pAmplitude のみ。
        if condition.polarization is Polarization.S:
            s_amp, p_amp = 1.0, 0.0
        else:
            s_amp, p_amp = 0.0, 1.0
        sim.SetExcitationPlanewave(
            IncidenceAngles=(condition.theta_deg, 0.0),  # (polar, azimuth) degrees
            sAmplitude=s_amp,
            pAmplitude=p_amp,
        )
        return sim


def _layer_name(index: int, layer: Layer) -> str:
    # 層名の一意性をインデックスで保証する（domain では層名の重複を許す）。
    return f"L{index}_{layer.name}"


def _bg_mat_name(index: int) -> str:
    return f"mat_L{index}_bg"


def _grating_mat_name(index: int) -> str:
    return f"mat_L{index}_grating"
