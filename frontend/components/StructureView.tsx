"use client";

import type { Annotations, Shape } from "plotly.js";

import Plot from "@/components/Plot";
import type { LayerDTO } from "@/lib/api/client";

// 構造の2次元断面図（横軸=位置, 縦軸=高さ）。入力の層データだけから描く（API 不要）。

const PALETTE = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
];

export default function StructureView({
  layers,
  periodNm,
}: {
  layers: LayerDTO[];
  periodNm: number;
}) {
  // 材料名 → 色 のマップ（背景材料とグレーティング材料の両方を集める）。
  const materials = new Set<string>();
  for (const l of layers) {
    materials.add(l.name);
    if (l.grating) materials.add(`${l.name}:grating`);
  }
  const colorOf = new Map<string, string>();
  [...materials].forEach((m, i) => colorOf.set(m, PALETTE[i % PALETTE.length]));

  // 表示用の各層の高さ。半無限層（厚さ0）には名目高さを与える。
  const finiteSum = layers.reduce((s, l) => s + (l.thicknessNm > 0 ? l.thicknessNm : 0), 0);
  const nominal = Math.max(finiteSum * 0.25, 60);
  const dispH = (l: LayerDTO) => (l.thicknessNm > 0 ? l.thicknessNm : nominal);

  const total = layers.reduce((s, l) => s + dispH(l), 0);

  const shapes: Partial<Shape>[] = [];
  const annotations: Partial<Annotations>[] = [];

  let top = total; // 先頭（入射側）を一番上に描く
  for (const layer of layers) {
    const h = dispH(layer);
    const y0 = top - h;
    const y1 = top;
    const bg = colorOf.get(layer.name) ?? "#cccccc";

    if (layer.grating) {
      const w = Math.min(Math.max(layer.grating.fillFactor, 0), 1) * periodNm;
      const gc = colorOf.get(`${layer.name}:grating`) ?? "#888888";
      // グレーティング材料のストライプ（幅 = fillFactor*period）
      shapes.push(rect(0, y0, w, y1, gc));
      // 背景材料（残り）
      shapes.push(rect(w, y0, periodNm, y1, bg));
    } else {
      shapes.push(rect(0, y0, periodNm, y1, bg));
    }

    annotations.push({
      x: periodNm / 2,
      y: (y0 + y1) / 2,
      text: `${layer.name}${layer.thicknessNm > 0 ? ` (${layer.thicknessNm}nm)` : ""}`,
      showarrow: false,
      font: { color: "#ffffff", size: 11 },
    });

    top = y0;
  }

  return (
    <Plot
      data={[]}
      layout={{
        autosize: true,
        height: 320,
        margin: { l: 48, r: 16, t: 8, b: 40 },
        xaxis: { title: { text: "位置 (nm)" }, range: [0, periodNm], zeroline: false },
        yaxis: { title: { text: "高さ (nm)" }, range: [0, total], zeroline: false },
        shapes,
        annotations,
        plot_bgcolor: "#ffffff",
      }}
      useResizeHandler
      style={{ width: "100%" }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}

function rect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
): Partial<Shape> {
  return {
    type: "rect",
    x0,
    y0,
    x1,
    y1,
    fillcolor: color,
    line: { color: "#333333", width: 1 },
  };
}
