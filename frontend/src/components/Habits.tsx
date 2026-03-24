import { useState, useEffect } from "react";

interface HabitLog {
  id: number;
  habitId: number;
  userId: number;
  date: string;
  value: string;
  createdAt: Date;
}

interface Habit {
  id: number;
  name: string;
  userId: number;
  createdAt: Date;
  logs: HabitLog[];
}

interface HabitResponse {
  habits: Habit[];
  completados: number;
  total: number;
  porcentagemCompletada: number;
}

export function Habits() {
  const [habitData, setHabitData] = useState<HabitResponse | null>(null);

  useEffect(() => {
    async function fetchHabits() {
      try {
        const tempToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc3MzA3NzQ0MSwiZXhwIjoxNzczNjgyMjQxfQ.5kg1yYnvyhmQ989W8ZpYqV7hy33KbrRjcPT2b2eVNHk";
        const today = new Date().toISOString().split("T")[0];

        const response = await fetch(
          `http://localhost:3333/habits/logs/?date=${today}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "Application/json",
              Authorization: `Bearer ${tempToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setHabitData(data);
        } else {
          console.error("Erro ao buscar hábitos:", response.status);
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    }

    fetchHabits();
  }, []);

  return (
    <div className="bg-neutral-200 border-2 border-neutral-800 rounded-3xl p-6 lg:col-span-1 shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-center">Hábitos</h2>

      <div className="border-2 border-neutral-800 rounded-3xl p-5">
        <div className="flex justify-between items-center mb-6">
          <button className="border-2 border-neutral-800 rounded px-3 py-1 text-sm font-medium hover:bg-neutral-300 transition">
            Hoje
          </button>
          <span className="text-sm font-bold text-blue-600">
            {habitData?.porcentagemCompletada ?? 0}%
          </span>
        </div>

        <div className="space-y-4">
          {habitData?.habits.map((habit) => (
            <div key={habit.id} className="flex justify-between items-center">
              <span className="text-sm font-medium">{habit.name}</span>
              <button
                className={
                  "w-5 h-5 border-2 border-neutral-800 rounded-sm flex items-center justify-center transition-colors " +
                  (habit.logs[0]?.value === "true" ? "bg-neutral-800" : "")
                }
              ></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
