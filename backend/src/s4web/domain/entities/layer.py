"""層エンティティ。"""

from dataclasses import dataclass

from s4web.domain.entities.material import Material


@dataclass(frozen=True)
class Layer:
    """スタック中の 1 層。

    厚さは nm。最初（入射側）と最後（基板側）の層は半無限媒質を表すため、
    通常は厚さ 0 で指定する。
    """

    name: str
    thickness_nm: float
    material: Material

    def __post_init__(self) -> None:
        if not self.name:
            raise ValueError("layer name must not be empty")
        if self.thickness_nm < 0:
            raise ValueError(f"thickness_nm must be non-negative, got {self.thickness_nm}")
