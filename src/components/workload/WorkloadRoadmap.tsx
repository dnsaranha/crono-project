import React, { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Tarefa simplificada para o Roadmap (baseada em workload_tasks)
type RoadmapTask = {
  id: string;
  name: string;
  startDate: string;
  duration: number; // em dias
  category: string;
  status: "pending" | "in_progress" | "completed" | string;
};

// Roadmap agrupado por categoria com dados do banco
export function WorkloadRoadmap() {
  const { toast } = useToast();
  const [scale, setScale] = useState<"month" | "quarter">("month");
  const [current, setCurrent] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("workload_tasks")
          .select("id, name, start_date, end_date, status, category")
          .order("start_date", { ascending: true });
        if (error) throw error;

        const mapped: RoadmapTask[] = (data ?? []).map((t: any) => {
          const start = new Date(t.start_date);
          const end = new Date(t.end_date);
          const dur = Math.max(1, differenceInCalendarDays(end, start) + 1);
          return {
            id: t.id,
            name: t.name,
            startDate: t.start_date,
            duration: dur,
            category: t.category || "Sem Categoria",
            status: t.status || "pending",
          };
        });
        setTasks(mapped);
      } catch (err: any) {
        console.error("Erro ao carregar roadmap:", err);
        toast({ title: "Erro ao carregar Roadmap", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadRoadmapData();
  }, [toast]);

  const categories = useMemo(() => {
    const setCat = new Set<string>();
    tasks.forEach((t) => setCat.add(t.category || "Sem Categoria"));
    return ["all", ...Array.from(setCat)];
  }, [tasks]);

  const statuses = ["all", "pending", "in_progress", "completed"];

  const periods = useMemo(() => {
    const units: { date: Date; label: string }[] = [];
    const start = new Date(current);
    start.setMonth(start.getMonth() - (scale === "quarter" ? 3 : 2));
    const steps = scale === "quarter" ? 6 : 6; // 6 colunas
    for (let i = 0; i < steps; i++) {
      const d = addMonths(start, scale === "quarter" ? i * 3 : i);
      const label =
        scale === "quarter"
          ? `T${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
          : format(d, "MMM yyyy", { locale: ptBR });
      units.push({ date: d, label });
    }
    return units;
  }, [current, scale]);

  const cellWidth = scale === "quarter" ? 180 : 140;

  const grouped = useMemo(() => {
    const map = new Map<string, RoadmapTask[]>();
    tasks.forEach((t) => {
      const cat = t.category || "Sem Categoria";
      if (categoryFilter !== "all" && cat !== categoryFilter) return;
      if (statusFilter !== "all" && t.status && t.status !== statusFilter) return;
      if (!map.has(cat)) map.set(cat, []);
      (map.get(cat) as RoadmapTask[]).push(t);
    });
    return Array.from(map.entries());
  }, [tasks, categoryFilter, statusFilter]);

  const getStyle = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    let index = periods.findIndex((p) => {
      if (scale === "quarter") {
        const end = addMonths(p.date, 3);
        return start >= p.date && start < end;
      }
      const end = addMonths(p.date, 1);
      return start >= p.date && start < end;
    });
    if (index < 0) index = 0;
    const left = index * cellWidth;
    const months = Math.max(1, Math.ceil(duration / (scale === "quarter" ? 90 : 30)));
    const width = months * cellWidth;
    return { left, width };
  };

  const navigate = (dir: "prev" | "next") => {
    setCurrent((prev) => addMonths(prev, dir === "next" ? (scale === "quarter" ? 3 : 1) : scale === "quarter" ? -3 : -1));
  };

  return (
    <section className="border rounded-lg overflow-hidden bg-card">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("prev")} className="touch-manipulation">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{format(current, "MMMM yyyy", { locale: ptBR })}</div>
          <Button variant="outline" size="sm" onClick={() => navigate("next")} className="touch-manipulation">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={scale} onValueChange={(v: any) => setScale(v)}>
            <SelectTrigger className="w-36 touch-manipulation">
              <SelectValue placeholder="Escala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 touch-manipulation">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "Todas as categorias" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 touch-manipulation">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "Todos os status" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="overflow-auto">
        {/* Cabeçalho dos períodos */}
        <div className="flex">
          <div className="w-56 p-3 border-r bg-muted/20 font-medium">Categoria</div>
          <div className="flex">
            {periods.map((p, i) => (
              <div
                key={i}
                className="border-r p-2 text-xs text-center bg-muted/10"
                style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Estado vazio / carregando */}
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando roadmap…</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma tarefa de workload encontrada.</div>
        ) : null}

        {/* Linhas por categoria */}
        {grouped.map(([cat, catTasks]) => (
          <div key={cat} className="flex border-t">
            <div className="w-56 p-3 border-r bg-card">
              <div className="font-medium text-sm truncate" title={cat}>
                {cat}
              </div>
              <div className="text-xs text-muted-foreground">{(catTasks as RoadmapTask[]).length} item(ns)</div>
            </div>
            <div className="flex-1 relative" style={{ height: "64px" }}>
              {/* Grid */}
              <div className="flex h-full">
                {periods.map((_, i) => (
                  <div key={i} className="border-r h-full" style={{ width: `${cellWidth}px` }} />
                ))}
              </div>
              {/* Barras */}
              {(catTasks as RoadmapTask[]).map((t) => {
                const { left, width } = getStyle(t.startDate, t.duration);
                const endDate = new Date(new Date(t.startDate).getTime() + (t.duration - 1) * 86400000);
                return (
                  <div
                    key={t.id}
                    className="absolute top-2 h-8 bg-primary/80 hover:bg-primary rounded px-2 cursor-pointer flex items-center text-xs text-primary-foreground font-medium truncate transition-colors touch-manipulation"
                    style={{ left: `${left}px`, width: `${Math.max(width, cellWidth * 0.5)}px` }}
                    title={`${t.name} • ${format(new Date(t.startDate), "dd/MM/yyyy")} → ${format(endDate, "dd/MM/yyyy")}`}
                  >
                    {t.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
