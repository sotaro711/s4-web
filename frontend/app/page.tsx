"use client";

import dynamic from "next/dynamic";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  simulate,
  type EditableLayer,
  type LayerDTO,
  type SimulationRequest,
  type SimulationResponse,
} from "@/lib/api/client";

// 計算条件のスカラー部分（層・媒質を除く）。
type Settings = Omit<SimulationRequest, "layers">;

// 入射媒質・基板（半無限）の光学定数。
type Medium = { n: number; k: number };

const DEFAULT_SETTINGS: Settings = {
  wlMin: 400,
  wlMax: 800,
  wlPoints: 81,
  thetaDeg: 0,
  pol: "s",
  periodNm: 500,
  numOrders: 11,
};

// 既定の多層膜（films）。id は固定（SSR/ハイドレーションのズレ回避）。
const DEFAULT_FILMS: EditableLayer[] = [
  {
    id: "default-grating",
    name: "grating",
    thicknessNm: 150,
    n: 1.0,
    k: 0,
    grating: { n: 2.5, k: 0, fillFactor: 0.5 },
  },
];

// 入射媒質は空気に固定（光が入ってくる側。UI には出さない）。
const INCIDENT_AIR: Medium = { n: 1.0, k: 0 };
const DEFAULT_SUBSTRATE: Medium = { n: 1.5, k: 0 }; // ガラス

// Plotly はブラウザ専用なので SSR を無効化して読み込む。
const SpectrumChart = dynamic(() => import("@/components/SpectrumChart"), {
  ssr: false,
});
const StructureView = dynamic(() => import("@/components/StructureView"), {
  ssr: false,
});

// films・基板 から、API/描画用の層リスト（入射側→基板）を組み立てる。
// 入射側は空気に固定。
function buildLayers(films: EditableLayer[], substrate: Medium): LayerDTO[] {
  return [
    { name: "空気", thicknessNm: 0, n: INCIDENT_AIR.n, k: INCIDENT_AIR.k, grating: null },
    ...films.map((l) => ({
      name: l.name,
      thicknessNm: l.thicknessNm,
      n: l.n,
      k: l.k,
      grating: l.grating,
    })),
    { name: "基板", thicknessNm: 0, n: substrate.n, k: substrate.k, grating: null },
  ];
}

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [substrate, setSubstrate] = useState<Medium>(DEFAULT_SUBSTRATE);
  const [films, setFilms] = useState<EditableLayer[]>(DEFAULT_FILMS);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const patchSettings = (p: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...p }));

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: SimulationRequest = {
        ...settings,
        layers: buildLayers(films, substrate),
      };
      setResult(await simulate(body));
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
              <SettingsForm value={settings} onChange={patchSettings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">多層膜</CardTitle>
              <p className="text-xs text-neutral-400">
                上が入射側（空気）、下が基板。多層膜を上に積み上げます。
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <LayerEditor layers={films} onChange={setFilms} />
              <div className="border-t pt-3">
                <MediumRow label="基板" value={substrate} onChange={setSubstrate} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "計算中…" : "計算する"}
          </Button>
          {error && <p className="text-sm text-red-600">エラー: {error}</p>}
        </div>

        {/* 右：構造の断面図（常時）とスペクトル（計算後） */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">構造の断面図</CardTitle>
            </CardHeader>
            <CardContent>
              <StructureView
                layers={buildLayers(films, substrate)}
                periodNm={settings.periodNm}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">スペクトル</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <SpectrumChart result={result} />
              ) : (
                <p className="text-sm text-neutral-400">
                  「計算する」を押すと結果が表示されます。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function MediumRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Medium;
  onChange: (v: Medium) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] items-end gap-2">
      <span className="pb-2 text-sm font-semibold">{label}</span>
      <div className="grid gap-1">
        <Label className="text-xs text-neutral-500">屈折率 n</Label>
        <Input
          type="number"
          step={0.01}
          value={value.n}
          onChange={(e) => onChange({ ...value, n: Number(e.target.value) })}
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs text-neutral-500">消衰係数 k</Label>
        <Input
          type="number"
          step={0.01}
          value={value.k}
          onChange={(e) => onChange({ ...value, k: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
