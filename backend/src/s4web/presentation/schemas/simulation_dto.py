"""API の入出力 DTO（Pydantic）と domain エンティティへの変換。

JSON は camelCase（TypeScript フロントの慣習）、Python 側は snake_case。
alias_generator でこのギャップを吸収する。
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from s4web.domain.entities.color import ColorResult
from s4web.domain.entities.layer import Layer
from s4web.domain.entities.material import Material
from s4web.domain.entities.simulation import (
    Polarization,
    SimulationCondition,
    SimulationOutcome,
)


class _CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class LayerDTO(_CamelModel):
    name: str
    thickness_nm: float
    n: float
    k: float = 0.0

    def to_entity(self) -> Layer:
        return Layer(
            name=self.name,
            thickness_nm=self.thickness_nm,
            material=Material(n=self.n, k=self.k),
        )


class SimulationRequest(_CamelModel):
    wl_min: float = Field(gt=0)
    wl_max: float = Field(gt=0)
    wl_points: int = Field(ge=1)
    theta_deg: float = 0.0
    pol: Polarization = Polarization.S
    layers: list[LayerDTO] = Field(min_length=2)

    def to_condition(self) -> SimulationCondition:
        return SimulationCondition(
            wl_min_nm=self.wl_min,
            wl_max_nm=self.wl_max,
            wl_points=self.wl_points,
            theta_deg=self.theta_deg,
            polarization=self.pol,
            layers=tuple(layer.to_entity() for layer in self.layers),
        )


class ColorDTO(BaseModel):
    r: int
    g: int
    b: int
    hex: str

    @classmethod
    def from_color(cls, c: ColorResult) -> ColorDTO:
        return cls(r=c.r, g=c.g, b=c.b, hex=c.hex)


class SimulationResponse(BaseModel):
    # フロントのグラフがそのまま使えるよう、キーは wavelengths / R / T。
    wavelengths: list[float]
    R: list[float]
    T: list[float]
    reflected_color: ColorDTO = Field(serialization_alias="reflectedColor")

    @classmethod
    def from_outcome(cls, outcome: SimulationOutcome) -> SimulationResponse:
        return cls(
            wavelengths=list(outcome.spectrum.wavelengths_nm),
            R=list(outcome.spectrum.reflectance),
            T=list(outcome.spectrum.transmittance),
            reflected_color=ColorDTO.from_color(outcome.reflected_color),
        )
