"use client";

import { useState } from "react";

import { LayerEditor } from "@/components/LayerEditor";
import { SettingsForm } from "@/components/SettingsForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  simulate,
  type SimulationRequest,
  type SimulationResponse,
} from "@/lib/api/client";

const DEFAULT_REQUEST: SimulationRequest = {
  wlMin: 400,
  wlMax: 800,
  wlPoints: 81,
  thetaDeg: 0,
  pol: "s",
  periodNm: 500,
  numOrders: 11,
  layers: [
    { name: "air", thicknessNm: 0, n: 1.0, k: 0 },
    {
      name: "grating",
      thicknessNm: 150,
      n: 1.0,
      k: 0,
      grating: { n: 2.5, k: 0, fillFactor: 0.5 },
    },
    { name: "glass", thicknessNm: 0, n: 1.5, k: 0 },
  ],
};

export default function Home() {
  const [req, setReq] = useState<SimulationRequest>(DEFAULT_REQUEST);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const patch = (p: Partial<SimulationRequest>) =>
    setReq((r) => ({ ...r, ...p }));

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await simulate(req));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6 font-sans">
      <h1 className="text-2xl font-bold">S4 RCWA Simulator 🪞</h1>
      <p className="mt-1 text-sm text-neutral-500">
        多層膜・1D グレーティング構造の反射 / 透過スペクトルを計算します。
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(420px,460px)_1fr]">
        {/* 左：入力 */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">計算条件</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsForm value={req} onChange={patch} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">層構成</CardTitle>
              <p className="text-xs text-neutral-400">
                先頭が入射側、末尾が基板。半無限媒質は厚さ 0。
              </p>
            </CardHeader>
            <CardContent>
              <LayerEditor
                layers={req.layers}
                onChange={(layers) => patch({ layers })}
              />
            </CardContent>
          </Card>

          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "計算中…" : "計算する"}
          </Button>
          {error && <p className="text-sm text-red-600">エラー: {error}</p>}
        </div>

        {/* 右：結果（グラフは次ステップ。今は JSON 表示） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">スペクトル</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="max-h-[70vh] overflow-auto rounded-md bg-neutral-100 p-4 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-neutral-400">
                「計算する」を押すと結果が表示されます。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
