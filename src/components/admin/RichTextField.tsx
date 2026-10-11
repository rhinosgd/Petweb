"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Type } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 富文本编辑框：默认套用预设格式（.prose-preset）；
 * 光标落到文本区时，工具条实时显示该处当前的文字格式
 * （加粗 / 斜体 / 字号），与前端预设保持一致。
 *
 * 说明：使用 document.execCommand（已弃用但浏览器均支持），
 * 仅用于本演示；生产可升级为 TipTap / ProseMirror。
 */
const SIZES = [
  { label: "Small", value: "3" },
  { label: "Body", value: "4" },
  { label: "Heading", value: "6" }
];

export function RichTextField({
  value,
  onChange,
  label,
  minHeight = 120
}: {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [size, setSize] = useState("4");

  // 初始化内容（仅首次，避免光标跳动）
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 读取「光标处」当前的格式，回填工具条 */
  function syncFormat() {
    try {
      setBold(document.queryCommandState("bold"));
      setItalic(document.queryCommandState("italic"));
      const block = document.queryCommandValue("formatBlock");
      if (block === "h1" || block === "h2") setSize("6");
      else setSize("4");
    } catch {
      /* 某些浏览器可能不支持，忽略 */
    }
  }

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    syncFormat();
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="border border-ink/15 bg-white">
      {/* 格式工具条 */}
      <div className="flex items-center gap-1 border-b border-ink/10 bg-[#FAFAF8] px-2 py-1.5">
        <ToolBtn active={bold} label="Bold" onClick={() => exec("bold")}>
          <Bold size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={italic} label="Italic" onClick={() => exec("italic")}>
          <Italic size={14} strokeWidth={2.2} />
        </ToolBtn>
        <span className="mx-1 h-4 w-px bg-ink/15" />
        <span className="flex items-center gap-1 text-ink/65">
          <Type size={13} strokeWidth={1.8} />
        </span>
        {SIZES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => exec("formatBlock", s.value === "6" ? "h2" : "p")}
            className={cn(
              "rounded px-2 py-1 text-[11px] uppercase tracking-wide transition-colors",
              size === s.value ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/5"
            )}
          >
            {s.label}
          </button>
        ))}
        {/* 光标处格式信息：方便识别大小、颜色等 */}
        <span className="ml-auto text-[10px] uppercase tracking-widest text-ink/60">
          {bold ? "Bold" : ""}{bold && italic ? " · " : ""}{italic ? "Italic" : ""}
          {!bold && !italic ? "Body" : ""}
        </span>
      </div>

      {label && <label className="label mb-0 px-3 pt-3">{label}</label>}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label || "Rich text"}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onKeyUp={syncFormat}
        onMouseUp={syncFormat}
        onFocus={syncFormat}
        className="prose-preset px-3 py-3 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}

function ToolBtn({
  active,
  label,
  onClick,
  children
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} // 保持选区
      onClick={onClick}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/5"
      )}
    >
      {children}
    </button>
  );
}
