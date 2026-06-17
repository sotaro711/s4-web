"""FastAPI アプリの OpenAPI スキーマをリポジトリ直下の openapi.json に出力する。

フロントの型生成（openapi-typescript）の入力になる「API 契約の源泉」。
S4 を import しないため S4 未導入環境でも実行可能。

実行: uv run python scripts/export_openapi.py
"""

import json
from pathlib import Path

from s4web.presentation.app import create_app

OUT = Path(__file__).resolve().parents[2] / "openapi.json"


def main() -> None:
    app = create_app()
    schema = app.openapi()
    OUT.write_text(json.dumps(schema, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
