"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

type Props = {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
};

// 数値入力。編集中は文字列をローカル保持し、確定時（blur）に正規化する。
// これにより「先頭0が残る」「途中状態(1. や空欄)が弾かれる」問題を防ぐ。
export function NumberInput({ value, onChange, step, min, max, className }: Props) {
  const [text, setText] = useState(() => String(value));
  const [prevValue, setPrevValue] = useState(value);

  // 外部から数値が変わったとき（ペア挿入・リセット等）だけ表示を同期する。
  // 編集中の文字列が同じ数値を表すなら触らない（先頭0などを保持）。
  if (value !== prevValue) {
    setPrevValue(value);
    if (Number(text) !== value) setText(String(value));
  }

  return (
    <Input
      type="number"
      inputMode="decimal"
      value={text}
      step={step}
      min={min}
      max={max}
      className={className}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = Number(t);
        if (t.trim() !== "" && Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        const n = Number(text);
        // 空・不正なら元の値へ戻す。正常なら正規化（先頭0除去・"1." → "1"）。
        setText(text.trim() === "" || !Number.isFinite(n) ? String(value) : String(n));
      }}
    />
  );
}
