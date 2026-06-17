"use client";

import { useState } from "react";

import { simulate, type SimulationRequest } from "@/lib/api/client";

// 疎通確認用の固定リクエスト（本格的な入力 UI は Step 6 で実装）。
const SAMPLE_REQUEST: SimulationRequest = {
  wlMin: 400,
  wlMax: 800,
  wlPoints: 5,
  thetaDeg: 0,
  pol: "s",
  periodNm: 500,
  numOrders: 1,
  layers: [
    { name: "air", thicknessNm: 0, n: 1.0, k: 0 },
    { name: "glass", thicknessNm: 0, n: 1.5, k: 0 },
  ],
};

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await simulate(SAMPLE_REQUEST);
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8 font-sans">
      <h1 className="text-2xl font-bold">S4 RCWA Simulator</h1>
      <p className="mt-1 text-sm text-neutral-500">
        フロント基盤の疎通確認（空気 / ガラスで R=0.04 が返れば成功）
      </p>

      <button
        onClick={run}
        disabled={loading}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {loading ? "計算中…" : "サンプル計算を実行"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600">エラー: {error}</p>
      )}
      {result && (
        <pre className="mt-4 overflow-auto rounded-md bg-neutral-100 p-4 text-xs">
          {result}
        </pre>
      )}
    </main>
  );
}
