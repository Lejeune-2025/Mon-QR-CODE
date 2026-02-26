import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import {
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  PaintBucket,
  Upload,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

type ElementType = "text" | "rect" | "circle" | "image" | "badge";

type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  z: number;
  name?: string;
  visible: boolean;
  locked: boolean;
};

type TextElement = BaseElement & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  weight: number;
  letterSpacing: number;
  lineHeight: number;
  shadow: boolean;
  stroke: boolean;
  bg: string | null;
};

type RectElement = BaseElement & {
  type: "rect";
  fill: string;
  radius: number;
  shadow: boolean;
  stroke: { color: string; width: number } | null;
  imageSrc?: string | null;
};

type CircleElement = BaseElement & {
  type: "circle";
  fill: string;
  shadow: boolean;
  stroke: { color: string; width: number } | null;
};

type ImageElement = BaseElement & {
  type: "image";
  src: string;
  radius: number;
  shadow: boolean;
  filters: { contrast: number; brightness: number; saturation: number };
};

type BadgeElement = BaseElement & {
  type: "badge";
  text: string;
  fill: string;
  color: string;
};

type AnyElement = TextElement | RectElement | CircleElement | ImageElement | BadgeElement;

type CanvasBg =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "image"; src: string };

type StudioState = {
  width: number;
  height: number;
  bg: CanvasBg;
  grid: boolean;
  zoom: number;
  elements: AnyElement[];
  selectedId: string | null;
};

const initialState: StudioState = {
  width: 1280,
  height: 720,
  bg: { kind: "solid", color: "#0b1020" },
  grid: false,
  zoom: 0.75,
  elements: [],
  selectedId: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Studio() {
  const [state, setState] = useState<StudioState>(() => {
    try {
      const saved = localStorage.getItem("miniature-studio");
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialState;
  });
  const [undoStack, setUndoStack] = useState<StudioState[]>([]);
  const [redoStack, setRedoStack] = useState<StudioState[]>([]);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [guideV, setGuideV] = useState<number | null>(null);
  const [guideH, setGuideH] = useState<number | null>(null);
  const [resizing, setResizing] = useState<{ id: string; corner: "nw" | "ne" | "se" | "sw" } | null>(null);
  const beforeTransformRef = useRef<StudioState | null>(null);
  const rectImageInputRef = useRef<HTMLInputElement | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [modelType, setModelType] = useState<"youtube" | "linkedin">("youtube");

  // Autosave
  useEffect(() => {
    localStorage.setItem("miniature-studio", JSON.stringify(state));
  }, [state]);

  // History
  const snapshot = useCallback((next: StudioState) => {
    setUndoStack((s) => [...s, state]);
    setRedoStack([]);
    setState(next);
  }, [state]);

  const undo = useCallback(() => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, state]);
    setState(prev);
  }, [undoStack, state]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    const nxt = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, state]);
    setState(nxt);
  }, [redoStack, state]);

  // Helpers
  const selected = useMemo(
    () => state.elements.find((e) => e.id === state.selectedId) || null,
    [state.elements, state.selectedId]
  );

  const addText = (preset: "title" | "subtitle" | "free") => {
    const presets = {
      title: { text: "Titre accrocheur", size: 64, weight: 800 },
      subtitle: { text: "Sous-titre descriptif", size: 32, weight: 600 },
      free: { text: "Texte", size: 28, weight: 500 },
    };
    const p = presets[preset];
    const el: TextElement = {
      id: uid(),
      type: "text",
      x: 80,
      y: 80,
      width: 600,
      height: p.size + 20,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      name: preset === "title" ? "Titre" : preset === "subtitle" ? "Sous-titre" : "Texte",
      visible: true,
      locked: false,
      text: p.text,
      fontSize: p.size,
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#ffffff",
      weight: p.weight,
      letterSpacing: 0,
      lineHeight: 1.1,
      shadow: true,
      stroke: false,
      bg: null,
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addTextTemplate = (kind: "ytHook" | "liHook" | "cta") => {
    const library = {
      ytHook: "Vous n’allez pas croire ceci !\nTop 5 Astuces 2026",
      liHook: "Boostez votre visibilité LinkedIn\nGuide express",
      cta: "Téléchargez maintenant",
    };
    const size = kind === "cta" ? 36 : 56;
    const el: TextElement = {
      id: uid(),
      type: "text",
      x: 96,
      y: 96,
      width: 700,
      height: size + 24,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      text: library[kind],
      fontSize: size,
      fontFamily: "Inter, system-ui, sans-serif",
      color: kind === "cta" ? "#111827" : "#ffffff",
      weight: kind === "cta" ? 800 : 900,
      letterSpacing: kind === "cta" ? 0.5 : 0.2,
      lineHeight: 1.1,
      shadow: true,
      stroke: kind !== "cta",
      bg: kind === "cta" ? "rgba(253,224,71,0.9)" : null,
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addRect = () => {
    const el: RectElement = {
      id: uid(),
      type: "rect",
      x: 120,
      y: 140,
      width: 400,
      height: 220,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      name: "Rectangle",
      visible: true,
      locked: false,
      fill: "#1f2937",
      radius: 20,
      shadow: true,
      stroke: { color: "#ffffff", width: 0 },
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addCircle = () => {
    const el: CircleElement = {
      id: uid(),
      type: "circle",
      x: 220,
      y: 220,
      width: 180,
      height: 180,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      name: "Cercle",
      visible: true,
      locked: false,
      fill: "#9333ea",
      shadow: true,
      stroke: { color: "#ffffff", width: 0 },
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addBadge = () => {
    const el: BadgeElement = {
      id: uid(),
      type: "badge",
      x: 40,
      y: 40,
      width: 140,
      height: 50,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      name: "Badge",
      visible: true,
      locked: false,
      text: "NEW",
      fill: "#fde047",
      color: "#0b1020",
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addBadgePreset = (text: string, fill: string, color: string) => {
    const el: BadgeElement = {
      id: uid(),
      type: "badge",
      x: 40,
      y: 40,
      width: 160,
      height: 54,
      rotation: 0,
      opacity: 1,
      z: state.elements.length + 1,
      text,
      fill,
      color,
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const addSocialBadge = (platform: "yt" | "in") => {
    if (platform === "yt") {
      addBadgePreset("YOUTUBE", "#ef4444", "#ffffff");
    } else {
      addBadgePreset("LINKEDIN", "#0ea5e9", "#ffffff");
    }
  };

  const addOverlay = (color: string, opacity = 0.25) => {
    const el: RectElement = {
      id: uid(),
      type: "rect",
      x: 0,
      y: 0,
      width: state.width,
      height: state.height,
      rotation: 0,
      opacity,
      z: state.elements.length + 1,
      fill: color,
      radius: 0,
      shadow: false,
      stroke: { color: "#ffffff", width: 0 },
    };
    snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
  };

  const applyTemplate = (tpl: { width: number; height: number; bg: CanvasBg; elements: AnyElement[] }) => {
    snapshot({
      ...state,
      width: tpl.width,
      height: tpl.height,
      bg: tpl.bg,
      elements: tpl.elements.map((e, i) => ({ ...e, z: i + 1 })),
      selectedId: null,
    });
  };

  const ytGradients: Array<[string, string]> = [
    ["#0f172a", "#3b82f6"],
    ["#111827", "#ef4444"],
    ["#0b1020", "#f59e0b"],
    ["#1f2937", "#22c55e"],
    ["#0ea5e9", "#9333ea"],
    ["#7c3aed", "#f97316"],
    ["#0f766e", "#06b6d4"],
    ["#a21caf", "#f59e0b"],
    ["#0a0a0a", "#2563eb"],
    ["#111827", "#eab308"],
  ];

  const liGradients: Array<[string, string]> = [
    ["#0a66c2", "#0ea5e9"],
    ["#111827", "#0ea5e9"],
    ["#0b1020", "#38bdf8"],
    ["#0ea5e9", "#111827"],
    ["#0a66c2", "#111827"],
    ["#0ea5e9", "#22d3ee"],
    ["#0c4a6e", "#0ea5e9"],
    ["#111827", "#14b8a6"],
    ["#0ea5e9", "#eab308"],
    ["#0ea5e9", "#9333ea"],
  ];

  const makeYtTemplate = (i: number) => {
    const [from, to] = ytGradients[i % ytGradients.length];
    const width = 2560;
    const height = 1440;
    const title: TextElement = {
      id: uid(),
      type: "text",
      x: 200,
      y: 320,
      width: 1400,
      height: 120,
      rotation: 0,
      opacity: 1,
      z: 1,
      name: "Titre",
      visible: true,
      locked: false,
      text: "Titre accrocheur YouTube",
      fontSize: 96,
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#ffffff",
      weight: 900,
      letterSpacing: 0,
      lineHeight: 1.05,
      shadow: true,
      stroke: true,
      bg: null,
    };
    const subtitle: TextElement = {
      ...title,
      id: uid(),
      name: "Sous-titre",
      y: 480,
      text: "Sous-titre descriptif",
      fontSize: 48,
      weight: 700,
      stroke: false,
      lineHeight: 1.2,
    };
    const rectImg: RectElement = {
      id: uid(),
      type: "rect",
      x: i % 2 === 0 ? 1600 : 200,
      y: 260,
      width: 700,
      height: 500,
      rotation: 0,
      opacity: 1,
      z: 3,
      name: "Cadre image",
      visible: true,
      locked: false,
      fill: "#1f2937",
      radius: 28,
      shadow: true,
      stroke: { color: "#ffffff", width: 0 },
      imageSrc: null,
    };
    const badge: BadgeElement = {
      id: uid(),
      type: "badge",
      x: 200,
      y: 220,
      width: 180,
      height: 60,
      rotation: 0,
      opacity: 1,
      z: 4,
      name: "Badge",
      visible: true,
      locked: false,
      text: "NEW",
      fill: "#eab308",
      color: "#0b1020",
    };
    return {
      width,
      height,
      bg: { kind: "gradient", from, to, angle: 30 },
      elements: [title, subtitle, rectImg, badge],
    };
  };

  const makeLiTemplate = (i: number) => {
    const [from, to] = liGradients[i % liGradients.length];
    const width = 1584;
    const height = 396;
    const title: TextElement = {
      id: uid(),
      type: "text",
      x: 80,
      y: 110,
      width: 900,
      height: 90,
      rotation: 0,
      opacity: 1,
      z: 1,
      name: "Titre",
      visible: true,
      locked: false,
      text: "Titre LinkedIn percutant",
      fontSize: 64,
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#ffffff",
      weight: 900,
      letterSpacing: 0,
      lineHeight: 1.05,
      shadow: true,
      stroke: true,
      bg: null,
    };
    const rectImg: RectElement = {
      id: uid(),
      type: "rect",
      x: i % 2 === 0 ? 1080 : 80,
      y: 70,
      width: 400,
      height: 260,
      rotation: 0,
      opacity: 1,
      z: 2,
      name: "Cadre image",
      visible: true,
      locked: false,
      fill: "#1f2937",
      radius: 16,
      shadow: true,
      stroke: { color: "#ffffff", width: 0 },
      imageSrc: null,
    };
    const overlay: RectElement = {
      id: uid(),
      type: "rect",
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      opacity: 0.18,
      z: 0,
      name: "Overlay",
      visible: true,
      locked: true,
      fill: "#0b1020",
      radius: 0,
      shadow: false,
      stroke: { color: "#ffffff", width: 0 },
    };
    return {
      width,
      height,
      bg: { kind: "gradient", from, to, angle: 0 },
      elements: [overlay, title, rectImg],
    };
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const el: ImageElement = {
        id: uid(),
        type: "image",
        x: 160,
        y: 120,
        width: 480,
        height: 320,
        rotation: 0,
        opacity: 1,
        z: state.elements.length + 1,
        name: "Image",
        visible: true,
        locked: false,
        src: String(reader.result),
        radius: 12,
        shadow: true,
        filters: { contrast: 1, brightness: 1, saturation: 1 },
      };
      snapshot({ ...state, elements: [...state.elements, el], selectedId: el.id });
    };
    reader.readAsDataURL(file);
  };

  const setBgSolid = (color: string) => snapshot({ ...state, bg: { kind: "solid", color } });
  const setBgGradient = (from: string, to: string, angle: number) =>
    snapshot({ ...state, bg: { kind: "gradient", from, to, angle } });
  const setFormat = (w: number, h: number) =>
    snapshot({ ...state, width: w, height: h });

  const bringToFront = () => {
    if (!selected) return;
    const maxZ = Math.max(0, ...state.elements.map((e) => e.z));
    const updated = state.elements.map((e) =>
      e.id === selected.id ? { ...e, z: maxZ + 1 } : e
    );
    snapshot({ ...state, elements: updated });
  };

  const normalizeZ = (elements: AnyElement[]) => {
    const sorted = [...elements].sort((a, b) => a.z - b.z);
    return sorted.map((e, i) => ({ ...e, z: i + 1 }));
  };

  const moveLayer = (id: string, dir: "up" | "down" | "top" | "bottom") => {
    const ordered = [...state.elements].sort((a, b) => a.z - b.z);
    const idx = ordered.findIndex((e) => e.id === id);
    if (idx === -1) return;
    if (dir === "up" && idx < ordered.length - 1) {
      [ordered[idx], ordered[idx + 1]] = [ordered[idx + 1], ordered[idx]];
    } else if (dir === "down" && idx > 0) {
      [ordered[idx], ordered[idx - 1]] = [ordered[idx - 1], ordered[idx]];
    } else if (dir === "top") {
      const [it] = ordered.splice(idx, 1);
      ordered.push(it);
    } else if (dir === "bottom") {
      const [it] = ordered.splice(idx, 1);
      ordered.unshift(it);
    }
    const normalized = normalizeZ(ordered);
    snapshot({ ...state, elements: normalized });
  };

  const toggleVisibility = (id: string) => {
    snapshot({
      ...state,
      elements: state.elements.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)),
    });
  };

  const toggleLock = (id: string) => {
    snapshot({
      ...state,
      elements: state.elements.map((e) => (e.id === id ? { ...e, locked: !e.locked } : e)),
    });
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const dup = { ...selected, id: uid(), x: selected.x + 24, y: selected.y + 24, z: Math.max(...state.elements.map(e => e.z)) + 1, name: (selected.name ?? selected.type) + " (copie)" } as AnyElement;
    snapshot({ ...state, elements: [...state.elements, dup], selectedId: dup.id });
  };

  const duplicateById = (id: string) => {
    const el = state.elements.find(e => e.id === id);
    if (!el) return;
    const dup = { ...el, id: uid(), x: el.x + 24, y: el.y + 24, z: Math.max(...state.elements.map(e => e.z)) + 1, name: (el.name ?? el.type) + " (copie)" } as AnyElement;
    snapshot({ ...state, elements: [...state.elements, dup], selectedId: dup.id });
  };

  const deleteSelected = () => {
    if (!selected) return;
    snapshot({
      ...state,
      selectedId: null,
      elements: state.elements.filter((e) => e.id !== selected.id),
    });
  };

  const startDrag = (e: React.MouseEvent, el: AnyElement) => {
    if (el.locked) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const sx = el.x;
    const sy = el.y;
    beforeTransformRef.current = state;
    setState((s) => ({ ...s, selectedId: el.id }));
    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / state.zoom;
      const dy = (ev.clientY - startY) / state.zoom;
      const cx = state.width / 2;
      const cy = state.height / 2;
      const nx = sx + dx;
      const ny = sy + dy;
      const centerX = nx + el.width / 2;
      const centerY = ny + el.height / 2;
      const snap = 8;
      let fx = nx;
      let fy = ny;
      if (Math.abs(centerX - cx) < snap) {
        setGuideV(cx);
        fx = cx - el.width / 2;
      } else {
        setGuideV(null);
      }
      if (Math.abs(centerY - cy) < snap) {
        setGuideH(cy);
        fy = cy - el.height / 2;
      } else {
        setGuideH(null);
      }
      setState((s) => ({
        ...s,
        elements: s.elements.map((it) =>
          it.id === el.id ? { ...it, x: fx, y: fy } : it
        ),
      }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setGuideV(null);
      setGuideH(null);
      if (beforeTransformRef.current) {
        setUndoStack((s) => [...s, beforeTransformRef.current as StudioState]);
        setRedoStack([]);
        beforeTransformRef.current = null;
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startResize = (e: React.MouseEvent, el: AnyElement, corner: "nw" | "ne" | "se" | "sw") => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const sx = el.x;
    const sy = el.y;
    const sw = el.width;
    const sh = el.height;
    beforeTransformRef.current = state;
    setResizing({ id: el.id, corner });
    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / state.zoom;
      const dy = (ev.clientY - startY) / state.zoom;
      let nx = sx;
      let ny = sy;
      let nw = sw;
      let nh = sh;
      if (corner === "se") {
        nw = Math.max(20, sw + dx);
        nh = Math.max(20, sh + dy);
      } else if (corner === "ne") {
        nw = Math.max(20, sw + dx);
        nh = Math.max(20, sh - dy);
        ny = sy + dy;
      } else if (corner === "sw") {
        nw = Math.max(20, sw - dx);
        nh = Math.max(20, sh + dy);
        nx = sx + dx;
      } else if (corner === "nw") {
        nw = Math.max(20, sw - dx);
        nh = Math.max(20, sh - dy);
        nx = sx + dx;
        ny = sy + dy;
      }
      setState((s) => ({
        ...s,
        elements: s.elements.map((it) =>
          it.id === el.id ? { ...it, x: nx, y: ny, width: nw, height: nh } : it
        ),
      }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setResizing(null);
      if (beforeTransformRef.current) {
        setUndoStack((s) => [...s, beforeTransformRef.current as StudioState]);
        setRedoStack([]);
        beforeTransformRef.current = null;
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const exportImage = async (format: "png" | "jpeg" | "webp", quality = 0.92) => {
    setExporting(true);
    try {
      // Offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = state.width;
      canvas.height = state.height;
      const ctx = canvas.getContext("2d")!;

      // Background
      if (state.bg.kind === "solid") {
        ctx.fillStyle = state.bg.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (state.bg.kind === "gradient") {
        const angle = (state.bg.angle * Math.PI) / 180;
        const x0 = canvas.width / 2 + Math.cos(angle) * canvas.width;
        const y0 = canvas.height / 2 + Math.sin(angle) * canvas.height;
        const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
        const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, state.bg.from);
        grad.addColorStop(1, state.bg.to);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (state.bg.kind === "image") {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.src = state.bg.src;
        });
      }

      // Draw elements by z-order
      const elements = [...state.elements].sort((a, b) => a.z - b.z);
      for (const el of elements) {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));

        if (el.type === "rect") {
          const r = (el as RectElement).radius;
          const path = new Path2D();
          const x = el.x, y = el.y, w = el.width, h = el.height;
          const rr = Math.min(r, w / 2, h / 2);
          path.roundRect(x, y, w, h, rr);
          const rectEl = el as RectElement;
          if (rectEl.imageSrc) {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                ctx.save();
                ctx.clip(path);
                const scale = Math.max(w / img.width, h / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                const dx = x + (w - dw) / 2;
                const dy = y + (h - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
                ctx.restore();
                resolve();
              };
              img.src = rectEl.imageSrc!;
            });
          } else {
            ctx.fillStyle = rectEl.fill;
            ctx.fill(path);
          }
          const stroke = (el as RectElement).stroke;
          if (stroke && stroke.width > 0) {
            ctx.lineWidth = stroke.width;
            ctx.strokeStyle = stroke.color;
            ctx.stroke(path);
          }
        } else if (el.type === "circle") {
          const x = el.x + el.width / 2;
          const y = el.y + el.height / 2;
          const r = Math.min(el.width, el.height) / 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = (el as CircleElement).fill;
          ctx.fill();
          const stroke = (el as CircleElement).stroke;
          if (stroke && stroke.width > 0) {
            ctx.lineWidth = stroke.width;
            ctx.strokeStyle = stroke.color;
            ctx.stroke();
          }
        } else if (el.type === "badge") {
          const b = el as BadgeElement;
          const path = new Path2D();
          path.roundRect(el.x, el.y, el.width, el.height, 999);
          ctx.fillStyle = b.fill;
          ctx.fill(path);
          ctx.fillStyle = b.color;
          ctx.font = `700 ${Math.round(el.height * 0.5)}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.text, el.x + el.width / 2, el.y + el.height / 2);
        } else if (el.type === "text") {
          const t = el as TextElement;
          if (t.bg) {
            ctx.fillStyle = t.bg;
            ctx.fillRect(el.x, el.y, el.width, el.height);
          }
          if (t.shadow) {
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
          }
          ctx.fillStyle = t.color;
          ctx.font = `${t.weight} ${t.fontSize}px ${t.fontFamily}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          const lines = t.text.split("\n");
          let y = el.y;
          for (const line of lines) {
            if (t.stroke) {
              ctx.lineWidth = 4;
              ctx.strokeStyle = "rgba(0,0,0,0.85)";
              ctx.strokeText(line, el.x, y);
            }
            ctx.fillText(line, el.x, y);
            y += t.fontSize * t.lineHeight;
          }
        } else if (el.type === "image") {
          const im = el as ImageElement;
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              // Appliquer les filtres supportés par Canvas
              ctx.filter = `brightness(${im.filters.brightness}) contrast(${im.filters.contrast}) saturate(${im.filters.saturation})`;
              ctx.drawImage(img, el.x, el.y, el.width, el.height);
              ctx.filter = "none";
              resolve();
            };
            img.src = im.src;
          });
        }
        ctx.restore();
      }

      const mime =
        format === "png" ? "image/png" :
        format === "jpeg" ? "image/jpeg" : "image/webp";
      const dataUrl = canvas.toDataURL(mime, quality);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `miniature.${format === "jpeg" ? "jpg" : format}`;
      a.click();
      toast.success("Export terminé");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-6 px-4 space-y-4">
        <input
          ref={rectImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !state.selectedId) return;
            const reader = new FileReader();
            reader.onload = () => {
              setState((s) => ({
                ...s,
                elements: s.elements.map((el) =>
                  el.id === s.selectedId && el.type === "rect"
                    ? { ...(el as RectElement), imageSrc: String(reader.result) }
                    : el
                ),
              }));
              toast.success("Image appliquée au cadre");
            };
            reader.readAsDataURL(file);
            e.currentTarget.value = "";
          }}
        />
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" className="rounded-xl border-2">
              ← Retour
            </Button>
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold"><span className="text-yellow-700">Studio miniature Pro</span></h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Créez des miniatures YouTube & LinkedIn en toute simplicité
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-5">
          {/* Sidebar gauche */}
          <motion.aside
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="col-span-12 md:col-span-4 lg:col-span-3 p-4 rounded-2xl bg-card/70 backdrop-blur border shadow-md space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-auto"
          >
            <div>
              <div className="text-sm font-semibold">Modèles</div>
              <div className="flex items-center gap-2">
                <Button variant={modelType === "youtube" ? "secondary" : "outline"} className="w-full rounded-xl border-2" onClick={() => setModelType("youtube")}>
                  YouTube
                </Button>
                <Button variant={modelType === "linkedin" ? "secondary" : "outline"} className="w-full rounded-xl border-2" onClick={() => setModelType("linkedin")}>
                  LinkedIn
                </Button>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-2" onClick={() => setShowModels((v) => !v)}>
                {showModels ? "Masquer" : "Afficher"} les modèles
              </Button>
              {showModels && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-xl border bg-card/60 space-y-2">
                      <div className="text-xs font-semibold">
                        {modelType === "youtube" ? `YT Modèle ${i + 1}` : `IN Modèle ${i + 1}`}
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full rounded-xl border-2"
                        onClick={() =>
                          modelType === "youtube"
                            ? applyTemplate(makeYtTemplate(i))
                            : applyTemplate(makeLiTemplate(i))
                        }
                      >
                        Appliquer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold mb-2">Format (Bannières)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" className="rounded-xl border-2" onClick={() => setFormat(2560, 1440)}>
                      YouTube Banner
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>2560×1440 (zone sûre ≈ 1546×423)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" className="rounded-xl border-2" onClick={() => setFormat(1584, 396)}>
                      LinkedIn Banner
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>1584×396</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Upload</div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer hover:bg-muted/50 transition-all w-full">
                  <Upload className="h-4 w-4" />
                  <span>Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUpload(f);
                    }}
                  />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>Importer une image</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full rounded-xl border-2" onClick={() => toast.info("Suppression arrière-plan (simulation)")}>
                  <ImageIcon className="h-4 w-4 mr-2" /> AI BG Remove
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer l’arrière-plan (simulation)</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Texte</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addText("title")}><Type className="h-4 w-4 mr-2" />Titre</Button></TooltipTrigger><TooltipContent>Ajouter un titre</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addText("subtitle")}><Type className="h-4 w-4 mr-2" />Sous-titre</Button></TooltipTrigger><TooltipContent>Ajouter un sous-titre</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addText("free")}><Type className="h-4 w-4 mr-2" />Libre</Button></TooltipTrigger><TooltipContent>Ajouter un texte libre</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addBadge()}><BadgeCheck className="h-4 w-4 mr-2" />Badge</Button></TooltipTrigger><TooltipContent>Ajouter un badge</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addTextTemplate("ytHook")}><Type className="h-4 w-4 mr-2" />Titre YouTube</Button></TooltipTrigger><TooltipContent>Accroche YouTube prête</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addTextTemplate("liHook")}><Type className="h-4 w-4 mr-2" />Titre LinkedIn</Button></TooltipTrigger><TooltipContent>Accroche LinkedIn prête</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addTextTemplate("cta")}><Type className="h-4 w-4 mr-2" />CTA</Button></TooltipTrigger><TooltipContent>Bouton d’appel à l’action</TooltipContent></Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Éléments</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={addRect}><Square className="h-4 w-4 mr-2" />Rectangle</Button></TooltipTrigger><TooltipContent>Ajouter un rectangle</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={addCircle}><Circle className="h-4 w-4 mr-2" />Cercle</Button></TooltipTrigger><TooltipContent>Ajouter un cercle</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addBadgePreset("GRATUIT", "#22c55e", "#0b1020")}><BadgeCheck className="h-4 w-4 mr-2" />Badge “GRATUIT”</Button></TooltipTrigger><TooltipContent>Badge promotion</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addBadgePreset("2026", "#fde047", "#0b1020")}><BadgeCheck className="h-4 w-4 mr-2" />Badge “2026”</Button></TooltipTrigger><TooltipContent>Badge millésime</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addSocialBadge("yt")}><BadgeCheck className="h-4 w-4 mr-2" />YouTube</Button></TooltipTrigger><TooltipContent>Badge YouTube</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => addSocialBadge("in")}><BadgeCheck className="h-4 w-4 mr-2" />LinkedIn</Button></TooltipTrigger><TooltipContent>Badge LinkedIn</TooltipContent></Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Effets</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => setBgGradient("#1e3a8a", "#f59e0b", 45)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Gradient
                </Button></TooltipTrigger><TooltipContent>Appliquer un dégradé</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full rounded-xl border-2" onClick={() => setBgSolid("#0b1020")}>
                  <PaintBucket className="h-4 w-4 mr-2" /> Uni
                </Button></TooltipTrigger><TooltipContent>Appliquer une couleur unie</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addOverlay("#000000", 0.35)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Overlay sombre
                </Button></TooltipTrigger><TooltipContent>Ajoute un overlay pour lisibilité</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="secondary" className="w-full rounded-xl border-2" onClick={() => addOverlay("#0ea5e9", 0.22)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Overlay cyan
                </Button></TooltipTrigger><TooltipContent>Touche colorée</TooltipContent></Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">AI Assist (simulation)</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="rounded-xl border-2" onClick={() => {
                  addText("title");
                  toast.success("Titre accrocheur généré");
                }}>
                  <Sparkles className="h-4 w-4 mr-2" /> Générer Titre
                </Button>
                <Button variant="secondary" className="rounded-xl border-2" onClick={() => {
                  setBgGradient("#111827", "#0ea5e9", 30);
                  toast.success("Palette appliquée");
                }}>
                  <LayoutGrid className="h-4 w-4 mr-2" /> Palette
                </Button>
              </div>
            </div>
          </motion.aside>

          {/* Canvas central */}
          <div className="col-span-12 md:col-span-8 lg:col-span-6">
            <div className="mb-3 p-3 rounded-2xl bg-card/70 backdrop-blur border shadow-md flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" onClick={undo} disabled={!undoStack.length}>
                <Undo2 className="h-4 w-4 mr-2" /> Undo
                  </Button>
                </TooltipTrigger><TooltipContent>Annuler</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" onClick={redo} disabled={!redoStack.length}>
                <Redo2 className="h-4 w-4 mr-2" /> Redo
                  </Button>
                </TooltipTrigger><TooltipContent>Rétablir</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" onClick={() => setState(s => ({ ...s, grid: !s.grid }))}>
                <Grid3X3 className="h-4 w-4 mr-2" /> Grille {state.grid ? "On" : "Off"}
                  </Button>
                </TooltipTrigger><TooltipContent>Afficher la grille</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" onClick={() => setState(s => ({ ...s, zoom: clamp(s.zoom + 0.1, 0.5, 2) }))}>
                <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger><TooltipContent>Zoom +</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" onClick={() => setState(s => ({ ...s, zoom: clamp(s.zoom - 0.1, 0.5, 2) }))}>
                <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger><TooltipContent>Zoom −</TooltipContent></Tooltip>
              </motion.div>
              <div className="text-sm text-muted-foreground ml-2">Zoom: {(state.zoom * 100).toFixed(0)}%</div>
            </div>

            <div
              ref={containerRef}
              onClick={() => setState(s => ({ ...s, selectedId: null }))}
              className="relative w-full aspect-video rounded-2xl bg-muted/30 border shadow-md flex items-center justify-center overflow-auto"
              style={{ minHeight: 420 }}
            >
              <div
                className="relative shadow-inner"
                style={{
                  width: state.width * state.zoom,
                  height: state.height * state.zoom,
                  background:
                    state.bg.kind === "solid"
                      ? state.bg.color
                      : state.bg.kind === "gradient"
                      ? `linear-gradient(${state.bg.angle}deg, ${state.bg.from}, ${state.bg.to})`
                      : `#0b1020`,
                  backgroundImage:
                    state.bg.kind === "image" ? `url(${state.bg.src})` : undefined,
                  backgroundSize: "cover",
                }}
              >
                {guideV !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-yellow-400/80"
                    style={{ left: guideV * state.zoom }}
                  />
                )}
                {guideH !== null && (
                  <div
                    className="absolute left-0 right-0 h-px bg-yellow-400/80"
                    style={{ top: guideH * state.zoom }}
                  />
                )}
                {state.grid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      backgroundSize: `${40 * state.zoom}px ${40 * state.zoom}px`,
                      backgroundImage:
                        `linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)`,
                    }}
                  />
                )}

                {/* Elements */}
                {state.elements
                  .slice()
                  .sort((a, b) => a.z - b.z)
                  .map((el) => {
                    if (!el.visible) return null;
                    const sel = el.id === state.selectedId;
                    const style: React.CSSProperties = {
                      position: "absolute",
                      left: el.x * state.zoom,
                      top: el.y * state.zoom,
                      width: el.width * state.zoom,
                      height: el.height * state.zoom,
                      transform: `rotate(${el.rotation}deg)`,
                      opacity: el.opacity,
                      cursor: "grab",
                    };
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => startDrag(e, el)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setState((s) => ({ ...s, selectedId: el.id }));
                        }}
                        className={`group ${sel ? "ring-2 ring-yellow-500" : ""}`}
                        style={style}
                      >
                        {el.type === "rect" && (
                          <div
                            className="w-full h-full"
                            style={{
                              background: (el as RectElement).imageSrc
                                ? `${(el as RectElement).fill}`
                                : (el as RectElement).fill,
                              backgroundImage: (el as RectElement).imageSrc
                                ? `url(${(el as RectElement).imageSrc})`
                                : undefined,
                              backgroundSize: (el as RectElement).imageSrc ? "cover" : undefined,
                              backgroundPosition: (el as RectElement).imageSrc ? "center" : undefined,
                              borderRadius: (el as RectElement).radius * state.zoom,
                              boxShadow: (el as RectElement).shadow ? "0 8px 24px rgba(0,0,0,.35)" : undefined,
                              border: (el as RectElement).stroke?.width
                                ? `${(el as RectElement).stroke!.width * state.zoom}px solid ${(el as RectElement).stroke!.color}`
                                : undefined,
                            }}
                            onDoubleClick={() => {
                              setState((s) => ({ ...s, selectedId: el.id }));
                              rectImageInputRef.current?.click();
                            }}
                          />
                        )}
                        {el.type === "circle" && (
                          <div
                            className="w-full h-full"
                            style={{
                              background: (el as CircleElement).fill,
                              borderRadius: 9999,
                              boxShadow: (el as CircleElement).shadow ? "0 8px 24px rgba(0,0,0,.35)" : undefined,
                              border: (el as CircleElement).stroke?.width
                                ? `${(el as CircleElement).stroke!.width * state.zoom}px solid ${(el as CircleElement).stroke!.color}`
                                : undefined,
                            }}
                          />
                        )}
                        {el.type === "badge" && (
                          <div
                            className="w-full h-full flex items-center justify-center font-bold"
                            style={{
                              background: (el as BadgeElement).fill,
                              color: (el as BadgeElement).color,
                              borderRadius: 9999,
                            }}
                          >
                            {(el as BadgeElement).text}
                          </div>
                        )}
                        {el.type === "text" && (
                          <div
                            className="w-full h-full"
                            style={{
                              color: (el as TextElement).color,
                              fontSize: (el as TextElement).fontSize * state.zoom,
                              fontFamily: (el as TextElement).fontFamily,
                              fontWeight: (el as TextElement).weight,
                              lineHeight: (el as TextElement).lineHeight,
                              letterSpacing: (el as TextElement).letterSpacing,
                              textShadow: (el as TextElement).shadow ? "0 8px 24px rgba(0,0,0,.35)" : undefined,
                              background: (el as TextElement).bg || undefined,
                              padding: 8,
                            }}
                          >
                            {(el as TextElement).text}
                          </div>
                        )}
                        {el.type === "image" && (
                          <img
                            src={(el as ImageElement).src}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                              borderRadius: (el as ImageElement).radius * state.zoom,
                              boxShadow: (el as ImageElement).shadow ? "0 8px 24px rgba(0,0,0,.35)" : undefined,
                            }}
                          />
                        )}
                        {sel && !el.locked && (
                          <>
                            <div
                              onMouseDown={(e) => startResize(e, el, "nw")}
                              className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-sm bg-white border border-yellow-500 cursor-nw-resize"
                            />
                            <div
                              onMouseDown={(e) => startResize(e, el, "ne")}
                              className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-sm bg-white border border-yellow-500 cursor-ne-resize"
                            />
                            <div
                              onMouseDown={(e) => startResize(e, el, "sw")}
                              className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-sm bg-white border border-yellow-500 cursor-sw-resize"
                            />
                            <div
                              onMouseDown={(e) => startResize(e, el, "se")}
                              className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-sm bg-white border border-yellow-500 cursor-se-resize"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Export */}
            <div className="mt-4 p-3 rounded-2xl bg-card/70 backdrop-blur border shadow-md flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button disabled={exporting} className="rounded-xl border-2" onClick={() => exportImage("png")}>
                <Download className="h-4 w-4 mr-2" /> PNG
                  </Button>
                </TooltipTrigger><TooltipContent>Exporter en PNG</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="secondary" className="rounded-xl border-2" disabled={exporting} onClick={() => exportImage("jpeg", 0.9)}>
                <Download className="h-4 w-4 mr-2" /> JPG
                  </Button>
                </TooltipTrigger><TooltipContent>Exporter en JPG</TooltipContent></Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-2" disabled={exporting} onClick={() => exportImage("webp", 0.9)}>
                <Download className="h-4 w-4 mr-2" /> WebP
                  </Button>
                </TooltipTrigger><TooltipContent>Exporter en WebP</TooltipContent></Tooltip>
              </motion.div>
            </div>
          </div>

          {/* Sidebar droite */}
          <motion.aside
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="col-span-12 md:col-span-4 lg:col-span-3 p-4 rounded-2xl bg-card/70 backdrop-blur border shadow-md space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden"
          >
            <div className="space-y-2">
              <div className="text-sm font-semibold">Calques</div>
              <div className="space-y-2">
                {state.elements
                  .slice()
                  .sort((a, b) => b.z - a.z)
                  .map((e) => (
                    <div key={e.id} className={`flex items-center justify-between p-2 rounded-lg border ${state.selectedId === e.id ? "border-yellow-500 bg-accent/30" : "border-border"}`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <button
                          className="text-left text-sm font-medium truncate"
                          title={e.name ?? e.type}
                          onClick={() => setState((s) => ({ ...s, selectedId: e.id }))}
                          onDoubleClick={() => {
                            const newName = window.prompt("Renommer le calque", e.name ?? e.type);
                            if (newName !== null && newName.trim().length > 0) {
                              setState((s) => ({
                                ...s,
                                elements: s.elements.map((el) => (el.id === e.id ? { ...el, name: newName.trim() } : el)),
                              }));
                            }
                          }}
                        >
                          {(e.name ?? e.type).toUpperCase()}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => moveLayer(e.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => moveLayer(e.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => moveLayer(e.id, "top")}><ChevronsUp className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => moveLayer(e.id, "bottom")}><ChevronsDown className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className={`h-7 w-7 ${e.visible ? "" : "opacity-60"}`} onClick={() => toggleVisibility(e.id)}>
                          {e.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" className={`h-7 w-7 ${e.locked ? "opacity-60" : ""}`} onClick={() => toggleLock(e.id)}>
                          {e.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => duplicateById(e.id)}><Copy className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-xl border-2" disabled={!selected} onClick={duplicateSelected}>Dupliquer</Button>
                <Button variant="outline" className="rounded-xl border-2" disabled={!selected} onClick={deleteSelected}>Supprimer</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Propriétés</div>
              <Button variant="outline" size="icon" className="rounded-xl border-2 shrink-0 h-8 w-8" onClick={deleteSelected} disabled={!selected}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {!selected && (
              <div className="space-y-4">
                <div className="text-sm font-semibold">Fond</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={state.bg.kind === "solid" ? "secondary" : "outline"}
                    className="rounded-xl border-2"
                    onClick={() =>
                      snapshot({
                        ...state,
                        bg:
                          state.bg.kind === "solid"
                            ? state.bg
                            : { kind: "solid", color: "#0b1020" },
                      })
                    }
                  >
                    Uni
                  </Button>
                  <Button
                    variant={state.bg.kind === "gradient" ? "secondary" : "outline"}
                    className="rounded-xl border-2"
                    onClick={() =>
                      snapshot({
                        ...state,
                        bg:
                          state.bg.kind === "gradient"
                            ? state.bg
                            : { kind: "gradient", from: "#111827", to: "#0ea5e9", angle: 30 },
                      })
                    }
                  >
                    Dégradé
                  </Button>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer hover:bg-muted/50 transition-all">
                    <Upload className="h-4 w-4" />
                    <span>Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          snapshot({
                            ...state,
                            bg: { kind: "image", src: String(reader.result) },
                          });
                        };
                        reader.readAsDataURL(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                {state.bg.kind === "solid" && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <span className="text-xs">Couleur</span>
                    <input
                      type="color"
                      value={state.bg.color}
                      onChange={(e) =>
                        snapshot({ ...state, bg: { kind: "solid", color: e.target.value } })
                      }
                    />
                  </div>
                )}

                {state.bg.kind === "gradient" && (
                  <>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <span className="text-xs">Dégradé de</span>
                      <input
                        type="color"
                        value={state.bg.from}
                        onChange={(e) =>
                          snapshot({ ...state, bg: { ...state.bg, from: e.target.value } as any })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <span className="text-xs">à</span>
                      <input
                        type="color"
                        value={state.bg.to}
                        onChange={(e) =>
                          snapshot({ ...state, bg: { ...state.bg, to: e.target.value } as any })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <span className="text-xs">Angle</span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={state.bg.angle}
                        onChange={(e) =>
                          snapshot({ ...state, bg: { ...state.bg, angle: Number(e.target.value) } as any })
                        }
                      />
                    </div>
                  </>
                )}

                {state.bg.kind === "image" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-2"
                      onClick={() => {
                        snapshot({ ...state, bg: { kind: "solid", color: "#0b1020" } });
                      }}
                    >
                      Retirer l'image
                    </Button>
                    <span className="text-xs text-muted-foreground">Image appliquée comme fond</span>
                  </div>
                )}
              </div>
            )}

            {selected && selected.type === "text" && (
              <div className="space-y-3">
                <label className="text-xs">Texte</label>
                <textarea
                  className="w-full p-2 rounded-md border bg-background"
                  value={(selected as TextElement).text}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      elements: s.elements.map((el) =>
                        el.id === selected.id ? { ...(el as TextElement), text: e.target.value } : el
                      ),
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="color"
                    value={(selected as TextElement).color}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), color: e.target.value } : el
                        ),
                      }))
                    }
                  />
                  <input
                    type="range"
                    min={14}
                    max={120}
                    value={(selected as TextElement).fontSize}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), fontSize: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Interligne</span>
                  <input
                    type="range"
                    min={0.8}
                    max={2}
                    step={0.05}
                    value={(selected as TextElement).lineHeight}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), lineHeight: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Espacement</span>
                  <input
                    type="range"
                    min={-1}
                    max={2}
                    step={0.1}
                    value={(selected as TextElement).letterSpacing}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), letterSpacing: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), shadow: !(el as TextElement).shadow } : el
                        ),
                      }))
                    }
                  >
                    Ombre
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id
                            ? { ...(el as TextElement), bg: (el as TextElement).bg ? null : "rgba(0,0,0,0.35)" }
                            : el
                        ),
                      }))
                    }
                  >
                    Fond
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as TextElement), stroke: !(el as TextElement).stroke } : el
                        ),
                      }))
                    }
                  >
                    Contour
                  </Button>
                </div>
              </div>
            )}

            {selected && selected.type === "rect" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Couleur</span>
                  <input
                    type="color"
                    value={(selected as RectElement).fill}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as RectElement), fill: e.target.value } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Rayon</span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={(selected as RectElement).radius}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as RectElement), radius: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                    onClick={() => {
                      rectImageInputRef.current?.click();
                    }}
                  >
                    Remplir avec image
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as RectElement), imageSrc: null } : el
                        ),
                      }))
                    }
                  >
                    Retirer l'image
                  </Button>
                </div>
              </div>
            )}

            {selected && selected.type === "circle" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Couleur</span>
                  <input
                    type="color"
                    value={(selected as CircleElement).fill}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as CircleElement), fill: e.target.value } : el
                        ),
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {selected && selected.type === "image" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Arrondi</span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={(selected as ImageElement).radius}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...(el as ImageElement), radius: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Opacité</span>
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={selected.opacity}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...el, opacity: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Luminosité</span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={(selected as ImageElement).filters.brightness}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id
                            ? { ...(el as ImageElement), filters: { ...(el as ImageElement).filters, brightness: Number(e.target.value) } }
                            : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Contraste</span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={(selected as ImageElement).filters.contrast}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id
                            ? { ...(el as ImageElement), filters: { ...(el as ImageElement).filters, contrast: Number(e.target.value) } }
                            : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Saturation</span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={(selected as ImageElement).filters.saturation}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id
                            ? { ...(el as ImageElement), filters: { ...(el as ImageElement).filters, saturation: Number(e.target.value) } }
                            : el
                        ),
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {selected && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Rotation</span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selected.rotation}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        elements: s.elements.map((el) =>
                          el.id === selected.id ? { ...el, rotation: Number(e.target.value) } : el
                        ),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-xs">Profondeur</span>
                  <Button variant="outline" className="rounded-xl border-2" onClick={bringToFront}>Amener au premier plan</Button>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-2xl bg-accent/40 text-accent-foreground border">
              <div className="text-sm font-semibold mb-2">Premium</div>
              <p className="text-xs opacity-80">
                Galerie de templates, nombre de téléchargements gratuits: 3 restants.
                Le watermark est appliqué si non premium.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
