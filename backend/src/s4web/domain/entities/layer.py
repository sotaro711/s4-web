"""層・グレーティングエンティティ。"""

from dataclasses import dataclass

from s4web.domain.entities.material import Material


@dataclass(frozen=True)
class Grating:
    """層内の 1D バイナリグレーティング。

    層の背景材料が 1 周期を満たし、そのうち `fill_factor` の割合を
    `material` のストライプが占める。
    """

    material: Material
    fill_factor: float  # 周期に対する material の占有率、(0, 1]

    def __post_init__(self) -> None:
        if not (0.0 < self.fill_factor <= 1.0):
            raise ValueError(f"fill_factor must be in (0, 1], got {self.fill_factor}")


@dataclass(frozen=True)
class Layer:
    """スタック中の 1 層。

    厚さは nm。最初（入射側）と最後（基板側）の層は半無限媒質を表すため、
    通常は厚さ 0 で指定する。
    """

    name: str
    thickness_nm: float
    material: Material  # 背景材料
    grating: Grating | None = None

    def __post_init__(self) -> None:
        if not self.name:
            raise ValueError("layer name must not be empty")
        if self.thickness_nm < 0:
            raise ValueError(f"thickness_nm must be non-negative, got {self.thickness_nm}")

    @property
    def is_patterned(self) -> bool:
        return self.grating is not None
