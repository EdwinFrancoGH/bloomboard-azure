import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 21;
const INCREMENT = 100 / TOTAL_STEPS; // ≈ 4.7619

export default function BloomBoard() {
  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bb_habits")) || [];
    } catch (e) {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("all");
  const [ideas] = useState([
    { id: 1, text: "5-min meditación antes del desayuno" },
    { id: 2, text: "Enviar 1 email de agradecimiento semanal" },
    { id: 3, text: "Leer 10 páginas cada noche" },
  ]);

  const [previewId, setPreviewId] = useState(null);
  const [floats, setFloats] = useState([]);

  useEffect(() => {
    localStorage.setItem("bb_habits", JSON.stringify(habits));
  }, [habits]);

  function createHabit() {
    if (!title.trim()) return;
    const newHabit = {
      id: Date.now(),
      title: title.trim(),
      desc: desc.trim(),
      createdAt: new Date().toISOString(),
      score: 0, // stored as number, can be decimal
      lastWatered: null,
      daysTracked: [],
    };
    setHabits((prev) => [newHabit, ...prev]);
    setTitle("");
    setDesc("");
  }

  function pushFloat(id, label = `+${Number(INCREMENT).toFixed(1)}`) {
    const key = Date.now() + Math.random();
    setFloats((s) => [...s, { id, key, label }]);
    setTimeout(() => {
      setFloats((s) => s.filter((f) => f.key !== key));
    }, 900);
  }

  function waterHabit(id) {
    setHabits((prev) => {
      const now = new Date().toISOString();
      return prev.map((h) => {
        if (h.id !== id) return h;
        const raw = (h.score || 0) + INCREMENT;
        const capped = Math.min(100, raw);
        // store with one decimal for cleanliness
        const rounded = Math.round(capped * 10) / 10;
        const newDaysTracked = [...(h.daysTracked || []), now];
        return {
          ...h,
          score: rounded,
          lastWatered: now,
          daysTracked: newDaysTracked,
        };
      });
    });

    pushFloat(id, `+${Number(INCREMENT).toFixed(1)}`);
  }

  function removeHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setPreviewId((prev) => (prev === id ? null : prev));
  }

  useEffect(() => {
    if (location.hash && location.hash.startsWith("#bb=")) {
      try {
        const encoded = location.hash.replace("#bb=", "");
        const decoded = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) setHabits(parsed);
      } catch (e) {}
    }
  }, []);

  const filtered = habits.filter((h) =>
    filter === "all" ? true : filter === "growing" ? (h.score || 0) < 100 : (h.score || 0) >= 100
  );

  const previewHabit = previewId ? habits.find((h) => h.id === previewId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-6 text-slate-800">
      <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">BloomBoard</h1>
            <p className="text-sm opacity-80">Convierte micro-hábitos en plantas que crecen. Planta, riega y observa su progreso.</p>
          </div>
          <div className="space-x-2">
            {/* Botones de exportar/copiar eliminados */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 bg-white/70 p-4 rounded-2xl shadow">
          <h2 className="font-semibold">Plantar nuevo hábito</h2>
          <label className="block mt-3 text-xs">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded mt-1 border" placeholder="Ej: 5-min estiramiento" />
          <label className="block mt-3 text-xs">Descripción (opcional)</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 rounded mt-1 border" rows={3} placeholder="Pequeña nota..." />
          <div className="mt-3 flex gap-2">
            <button onClick={createHabit} className="flex-1 p-2 rounded bg-emerald-500 text-white font-semibold">Plantar</button>
            <button onClick={() => { setTitle(""); setDesc(""); }} className="p-2 rounded bg-white border">Limpiar</button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium">Ideas rápidas</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {ideas.map((i) => (
                <li key={i.id} className="bg-slate-50 p-2 rounded">{i.text}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-xs opacity-75">
            <p>
              <strong>Mecánica:</strong> cada riego añade <strong>{Number(INCREMENT).toFixed(1)}%</strong>. Se necesitan <strong>{TOTAL_STEPS}</strong> riegos para alcanzar <strong>100%</strong>.
            </p>
          </div>

          <div className="mt-4">
            <button onClick={() => alert('Descarga de app móvil no configurada — reemplaza este handler con el enlace o lógica de descarga que desees.')} className="w-full p-2 rounded bg-indigo-600 text-white font-semibold">Descargar app móvil</button>
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FilterPill value={filter} onChange={setFilter} />
              <span className="text-sm opacity-80">{filtered.length} plantas</span>
            </div>
            <div className="text-sm opacity-70">Última sincronización local: {new Date().toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((h) => (
              <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={h.id} className="bg-white p-4 rounded-2xl shadow">
                <div className="flex items-start gap-3">
                  <div className="relative flex-none" style={{ width: 72 }}>
                    <PlantVisual progress={h.score} lastWatered={h.lastWatered} size={72} />

                    <AnimatePresence>
                      {floats.filter((f) => f.id === h.id).map((f) => (
                        <FloatPlus key={f.key} label={f.label} />
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold">{h.title}</h4>
                    <p className="text-xs opacity-70">{h.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => { waterHabit(h.id); }} className="px-3 py-1 rounded bg-sky-100">Regar</button>

                      <button onClick={() => removeHabit(h.id)} className="px-3 py-1 rounded bg-rose-100">Eliminar</button>
                      <button onClick={() => setPreviewId(h.id)} className="px-3 py-1 rounded bg-amber-100">Vista previa</button>
                      <span className="ml-auto text-xs opacity-60">{Number(h.score).toFixed(1)}% • {(h.daysTracked || []).length} acciones</span>
                    </div>
                  </div>
                </div>
                <ProgressBar value={h.score} />
              </motion.article>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full bg-white p-6 rounded-2xl text-center opacity-80">No hay plantas en esta vista — planta una en el panel izquierdo.</div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-sm opacity-80">
        <p>BloomBoard — Demo local. ¿Quieres que conecte a un backend o que genere un build para Netlify/Azure?</p>
      </footer>

      <PreviewModal
        habit={previewHabit}
        onClose={() => setPreviewId(null)}
        onWater={(id) => { waterHabit(id); }}
        floats={floats}
      />
    </div>
  );
}

function FilterPill({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="p-2 rounded border bg-white/90">
        <option value="all">Todas</option>
        <option value="growing">En crecimiento</option>
        <option value="bloomed">Florecidas</option>
      </select>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
    </div>
  );
}

function FloatPlus({ label = `+${Number(INCREMENT).toFixed(1)}` }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: -18, scale: 1.03 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ duration: 0.7 }}
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6"
      style={{ fontWeight: 700, color: "#0f766e", textShadow: "0 2px 6px rgba(15,118,110,0.12)" }}
    >
      <span className="bg-white/90 px-2 py-0.5 rounded-lg text-sm">{label}</span>
    </motion.div>
  );
}

function PlantVisual({ progress = 0, lastWatered = null, size = 60 }) {
  const wateredToday = (() => {
    try {
      if (!lastWatered) return false;
      const lw = new Date(lastWatered).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      return lw === today;
    } catch (e) {
      return false;
    }
  })();

  const stage = progress >= 100 ? 4 : progress >= 70 ? 3 : progress >= 40 ? 2 : progress >= 10 ? 1 : 0;
  const sway = { rotate: [-2, 2, -2] };
  const swayTransition = { duration: 3.6, repeat: Infinity, ease: "easeInOut" };
  const viewW = 84;
  const viewH = 96;

  return (
    <div className="flex items-center justify-center select-none" style={{ width: size, height: size * (viewH / viewW) }}>
      <motion.svg width={size} height={Math.round(size * (viewH / viewW))} viewBox={`0 0 ${viewW} ${viewH}`} initial="init" animate="anim" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0,52)">
          <motion.rect x="12" y="18" width="60" height="18" rx="4" fill="#6b4226" initial={{ y: 22 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} />
          <rect x="8" y="8" width="68" height="12" rx="3" fill="#52321f" opacity="0.08" />
        </g>

        {stage === 0 && (
          <motion.g transform="translate(42,52)" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140 }}>
            <ellipse cx="0" cy="-2" rx="6" ry="4" fill="#8b5e34" />
            <motion.circle cx="3" cy="-6" r="1.8" fill="#f7d9b3" animate={{ y: [-2, -6, -2] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </motion.g>
        )}

        {stage >= 1 && (
          <motion.g transform="translate(42,46)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <motion.rect x="-1.5" y="-26" width="3" height="26" rx="2" fill="#6b4226" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: "spring", stiffness: 120 }} />
            {stage >= 1 && (
              <motion.path d="M0 -14 C -10 -10, -14 -2, -6 2 C -2 6, 2 4, 6 2" fill="#4caf50" transform="translate(-6,0)" initial={{ scale: 0.6, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: -5 }} transition={{ type: "spring", stiffness: 90 }} style={{ transformOrigin: "12px 12px" }} />
            )}
            {stage >= 2 && (
              <motion.path d="M0 -14 C 10 -10, 14 -2, 6 2 C 2 6, -2 4, -6 2" fill="#43a047" transform="translate(6,0)" initial={{ scale: 0.6, opacity: 0, rotate: 15 }} animate={{ scale: 1, opacity: 1, rotate: 5 }} transition={{ type: "spring", stiffness: 90 }} style={{ transformOrigin: "12px 12px" }} />
            )}

            {stage >= 3 && (
              <>
                <motion.path d="M0 -28 C -14 -22, -18 -10, -8 -6 C -3 -4, 1 -6, 8 -6" fill="#2e7d32" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} />
                <motion.path d="M0 -28 C 14 -22, 18 -10, 8 -6 C 3 -4, -1 -6, -8 -6" fill="#2e7d32" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} />
              </>
            )}

            {stage >= 4 && (
              <motion.g transform="translate(0,-36)" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }}>
                <motion.circle cx="0" cy="0" r="4.2" fill="#ffca28" />
                <motion.path d="M0 -6 C -4 -2, -4 2, 0 6 C 4 2, 4 -2, 0 -6 Z" fill="#ff5252" />
              </motion.g>
            )}

            <motion.g animate={sway} transition={swayTransition} />
          </motion.g>
        )}

        {wateredToday && (
          <motion.g transform="translate(60,16)" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }}>
            <motion.path d="M4 0 C 8 6, 8 10, 4 14 C 0 10, 0 6, 4 0 Z" fill="#67c5ff" initial={{ scale: 0.6 }} animate={{ scale: [0.9, 1.05, 0.9] }} transition={{ duration: 1.2, repeat: Infinity }} opacity={0.95} />
          </motion.g>
        )}
      </motion.svg>
    </div>
  );
}

function PreviewModal({ habit, onClose, onWater, floats }) {
  const [pulsing, setPulsing] = useState(false);

  if (!habit) return null;

  function handleWater() {
    setPulsing(true);
    onWater(habit.id);
    setTimeout(() => setPulsing(false), 450);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 140 }} className="relative z-10 max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-6">
          <div className="flex-none relative" style={{ width: 220 }}>
            <PlantVisual progress={habit.score} lastWatered={habit.lastWatered} size={220} />

            <AnimatePresence>
              {floats.filter((f) => f.id === habit.id).map((f) => (
                <FloatPlus key={f.key} label={f.label} />
              ))}
            </AnimatePresence>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{habit.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{habit.desc || '— sin descripción —'}</p>

            <div className="mt-4 flex gap-3 items-center">
              <motion.button onClick={handleWater} className="px-4 py-2 rounded bg-emerald-500 text-white font-semibold shadow-md" animate={pulsing ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: 0.45 }} whileTap={{ scale: 0.96 }}>
                Regar
              </motion.button>

              <button onClick={onClose} className="px-4 py-2 rounded bg-white border">Cerrar</button>
              <div className="ml-auto text-sm opacity-70">{Number(habit.score).toFixed(1)}% • {(habit.daysTracked || []).length} acciones</div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              <div>Creado: {new Date(habit.createdAt).toLocaleString()}</div>
              <div>Último riego: {habit.lastWatered ? new Date(habit.lastWatered).toLocaleString() : 'Nunca'}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
