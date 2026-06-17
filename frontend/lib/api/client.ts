import createClient from "openapi-fetch";

import type { components, paths } from "./schema";

// openapi-fetch クライアント。/api/* は next.config.ts の rewrites で
// FastAPI バックエンド (:8000) にプロキシされる。
export const apiClient = createClient<paths>({ baseUrl: "/" });

// 生成スキーマから使いやすい別名を切り出す（フロント側はこれを使う）。
export type SimulationRequest = components["schemas"]["SimulationRequest"];
export type SimulationResponse = components["schemas"]["SimulationResponse"];
export type LayerDTO = components["schemas"]["LayerDTO"];
export type GratingDTO = components["schemas"]["GratingDTO"];
export type Polarization = components["schemas"]["Polarization"];

/** シミュレーションを実行する。失敗時は detail を含む Error を投げる。 */
export async function simulate(
  body: SimulationRequest,
): Promise<SimulationResponse> {
  const { data, error } = await apiClient.POST("/api/simulate", { body });
  if (error) {
    const detail =
      typeof error === "object" && error !== null && "detail" in error
        ? JSON.stringify((error as { detail: unknown }).detail)
        : String(error);
    throw new Error(detail);
  }
  return data;
}
