"""FastAPI アプリケーションの組み立て。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from s4web.presentation.api.simulation_router import router as simulation_router


def create_app() -> FastAPI:
    app = FastAPI(title="S4 RCWA Simulator API", version="0.1.0")

    # 開発時の保険。本番は Next.js の rewrites でプロキシし CORS 不要にする想定。
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(simulation_router, prefix="/api")

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
