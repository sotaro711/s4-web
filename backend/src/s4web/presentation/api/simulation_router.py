"""シミュレーション API のルーター。"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from s4web.application.usecases.run_simulation import RunSimulationUseCase
from s4web.domain.ports.colorimetry_port import ColorimetryPort
from s4web.domain.ports.solver_port import SolverPort
from s4web.presentation.dependencies import get_colorimetry, get_solver
from s4web.presentation.schemas.simulation_dto import (
    SimulationRequest,
    SimulationResponse,
)

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
def simulate(
    request: SimulationRequest,
    solver: Annotated[SolverPort, Depends(get_solver)],
    colorimetry: Annotated[ColorimetryPort, Depends(get_colorimetry)],
) -> SimulationResponse:
    # Pydantic で拾えない不変条件（波長範囲の逆転など）は domain が ValueError を出す。
    try:
        condition = request.to_condition()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    outcome = RunSimulationUseCase(solver, colorimetry).execute(condition)
    return SimulationResponse.from_outcome(outcome)
