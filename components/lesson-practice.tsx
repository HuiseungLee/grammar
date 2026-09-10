"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { LessonContent } from "@/lib/lesson-types";

export function LessonPractice({ practice }: { practice: LessonContent["practice"] }) {
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const selectedIndex = Number(selected);
  const correct = checked && selectedIndex === practice.answerIndex;

  function reset() {
    setSelected("");
    setChecked(false);
  }

  return (
    <div className="practice-card">
      <p className="practice-label">바로 확인</p>
      <h3>{practice.prompt}</h3>
      <RadioGroup value={selected} onValueChange={(value) => { setSelected(value); setChecked(false); }} aria-label="정답 선택">
        {practice.choices.map((choice, index) => (
          <label className="practice-option" key={`${choice}-${index}`}>
            <RadioGroupItem value={String(index)} />
            <span><b>{index + 1}</b>{choice}</span>
          </label>
        ))}
      </RadioGroup>
      <div className="practice-actions">
        <Button disabled={selected === ""} onClick={() => setChecked(true)}>정답 확인</Button>
        {checked && <Button variant="ghost" onClick={reset}><RotateCcw /> 다시 풀기</Button>}
      </div>
      {checked && (
        <div className={`practice-feedback ${correct ? "correct" : "incorrect"}`} role="status">
          {correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
          <div><strong>{correct ? "맞았어요. 판별 기준까지 기억해 두세요." : `정답은 ${practice.answerIndex + 1}번이에요.`}</strong><p>{practice.explanation}</p></div>
        </div>
      )}
    </div>
  );
}
