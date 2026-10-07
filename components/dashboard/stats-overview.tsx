"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStat, WeeklyProgressPoint } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export function StatsOverview({
  stats,
  weeklyProgress,
}: {
  stats: DashboardStat[];
  weeklyProgress: WeeklyProgressPoint[];
}) {
  return (
    <section className="mb-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border bg-surface shadow-sm">
                <CardContent className="p-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                  <div className="mt-3 h-8 w-16 animate-pulse rounded bg-surface-muted" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="border-border bg-surface shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted">{stat.meta}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card className="border-border bg-surface shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Learning momentum</h3>
            <span className="text-xs text-muted">Last 6 days</span>
          </div>
          {weeklyProgress.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No activity data yet. Momentum appears after you study.
            </p>
          ) : (
            <div className="h-42">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)" }}
                    contentStyle={{
                      borderRadius: 10,
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="var(--primary)"
                    strokeWidth={2.2}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
