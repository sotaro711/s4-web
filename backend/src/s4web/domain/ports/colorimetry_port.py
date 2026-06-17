"""分光反射率 → 色 変換のポート（抽象）。

infrastructure 層のアダプタ（colour-science など）がこれを実装する。
domain はこの抽象にのみ依存し、colour-science の具体には依存しない。
"""

from abc import ABC, abstractmethod
from collections.abc import Sequence

from s4web.domain.entities.color import ColorResult


class ColorimetryPort(ABC):
    @abstractmethod
    def reflectance_to_srgb(
        self,
        wavelengths_nm: Sequence[float],
        reflectance: Sequence[float],
    ) -> ColorResult:
        """反射スペクトルを D65 光源下で観察した sRGB 色に変換する。"""
        raise NotImplementedError
