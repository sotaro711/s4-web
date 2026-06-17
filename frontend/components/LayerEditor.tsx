"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditableLayer, GratingDTO } from "@/lib/api/client";

const DEFAULT_GRATING: GratingDTO = { n: 2.0, k: 0, fillFactor: 0.5 };

// ペア挿入フォームの1層分（名前・厚さ・n・k）。
type PairLayer = { name: string; thicknessNm: number; n: number; k: number };

type Props = {
  layers: EditableLayer[];
  onChange: (layers: EditableLayer[]) => void;
};

function num(e: React.ChangeEvent<HTMLInputElement>): number {
  return Number(e.target.value);
}

export function LayerEditor({ layers, onChange }: Props) {
  // ペア挿入フォームのローカル状態。
  const [pairA, setPairA] = useState<PairLayer>({ name: "A", thicknessNm: 100, n: 2.5, k: 0 });
  const [pairB, setPairB] = useState<PairLayer>({ name: "B", thicknessNm: 100, n: 1.5, k: 0 });
  const [pairCount, setPairCount] = useState(5);

  const update = (i: number, patch: Partial<EditableLayer>) =>
    onChange(layers.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const updateGrating = (i: number, patch: Partial<GratingDTO>) => {
    const g = { ...(layers[i].grating ?? DEFAULT_GRATING), ...patch };
    update(i, { grating: g });
  };

  const toggleGrating = (i: number, on: boolean) =>
    update(i, { grating: on ? { ...DEFAULT_GRATING } : null });

  const addLayer = () => {
    // 基板の上に積み上げる：新しい層を入射側（先頭）の直下に挿入する。
    // → 最後に足した層ほど入射側に近く、番号は基板側から増える。
    const nextNumber = layers.length - 1; // 既存の中間層数 + 1
    const inserted: EditableLayer = {
      id: crypto.randomUUID(),
      name: `film${nextNumber}`,
      thicknessNm: 100,
      n: 1.5,
      k: 0,
      grating: null,
    };
    const next = [...layers];
    next.splice(1, 0, inserted);
    onChange(next);
  };

  const removeLayer = (i: number) => {
    if (layers.length <= 2) return; // 入射側 + 基板の最低2層は維持
    onChange(layers.filter((_, idx) => idx !== i));
  };

  const insertPairs = () => {
    const n = Math.max(1, Math.floor(pairCount));
    const block: EditableLayer[] = [];
    for (let p = 0; p < n; p++) {
      // [A, B] の順（A が入射側寄り）。入射側直下にまとめて積む。
      block.push({ id: crypto.randomUUID(), ...pairA, grating: null });
      block.push({ id: crypto.randomUUID(), ...pairB, grating: null });
    }
    const next = [...layers];
    next.splice(1, 0, ...block);
    onChange(next);
  };

  // 番号は基板側から数える（基板に接する膜が第1層、積み上げるほど大きい）。
  const roleOf = (i: number) =>
    i === 0
      ? "入射側"
      : i === layers.length - 1
        ? "基板"
        : `第${layers.length - 1 - i}層`;

  return (
    <div className="grid gap-3">
      {layers.map((layer, i) => (
        <div key={layer.id} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{roleOf(i)}</span>
            <button
              type="button"
              onClick={() => removeLayer(i)}
              disabled={layers.length <= 2}
              className="text-xs text-red-600 disabled:text-neutral-300"
            >
              削除
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="名前">
              <Input
                value={layer.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </Field>
            <Field label="厚さ (nm)">
              <Input
                type="number"
                value={layer.thicknessNm}
                onChange={(e) => update(i, { thicknessNm: num(e) })}
              />
            </Field>
            <Field label="屈折率 n">
              <Input
                type="number"
                step={0.01}
                value={layer.n}
                onChange={(e) => update(i, { n: num(e) })}
              />
            </Field>
            <Field label="消衰係数 k">
              <Input
                type="number"
                step={0.01}
                value={layer.k}
                onChange={(e) => update(i, { k: num(e) })}
              />
            </Field>
          </div>

          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={layer.grating != null}
              onChange={(e) => toggleGrating(i, e.target.checked)}
            />
            1D グレーティング
          </label>

          {layer.grating != null && (
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-md bg-neutral-50 p-2">
              <Field label="格子 n">
                <Input
                  type="number"
                  step={0.01}
                  value={layer.grating.n}
                  onChange={(e) => updateGrating(i, { n: num(e) })}
                />
              </Field>
              <Field label="格子 k">
                <Input
                  type="number"
                  step={0.01}
                  value={layer.grating.k}
                  onChange={(e) => updateGrating(i, { k: num(e) })}
                />
              </Field>
              <Field label="fill factor">
                <Input
                  type="number"
                  step={0.05}
                  min={0}
                  max={1}
                  value={layer.grating.fillFactor}
                  onChange={(e) => updateGrating(i, { fillFactor: num(e) })}
                />
              </Field>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addLayer}>
        + 層を追加
      </Button>

      {/* ペアをまとめて挿入（A,B を N 組、入射側直下に積み上げる） */}
      <div className="rounded-lg border border-dashed p-3">
        <p className="mb-2 text-sm font-semibold">ペアをまとめて挿入</p>
        <PairRow label="層 A（上）" value={pairA} onChange={setPairA} />
        <div className="mt-2">
          <PairRow label="層 B（下）" value={pairB} onChange={setPairB} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <div className="grid gap-1">
            <Label className="text-xs text-neutral-500">ペア数</Label>
            <Input
              type="number"
              min={1}
              value={pairCount}
              onChange={(e) => setPairCount(num(e))}
              className="w-24"
            />
          </div>
          <Button type="button" onClick={insertPairs}>
            ペアを挿入
          </Button>
        </div>
      </div>
    </div>
  );
}

function PairRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PairLayer;
  onChange: (v: PairLayer) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-end gap-2">
      <span className="pb-2 text-xs text-neutral-500">{label}</span>
      <Field label="名前">
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </Field>
      <Field label="厚さ (nm)">
        <Input
          type="number"
          value={value.thicknessNm}
          onChange={(e) => onChange({ ...value, thicknessNm: num(e) })}
        />
      </Field>
      <Field label="屈折率 n">
        <Input
          type="number"
          step={0.01}
          value={value.n}
          onChange={(e) => onChange({ ...value, n: num(e) })}
        />
      </Field>
      <Field label="消衰係数 k">
        <Input
          type="number"
          step={0.01}
          value={value.k}
          onChange={(e) => onChange({ ...value, k: num(e) })}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-neutral-500">{label}</Label>
      {children}
    </div>
  );
}
