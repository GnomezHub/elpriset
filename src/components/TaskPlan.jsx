import { supabase } from "../utils/supabase.js";
import { useEffect, useState } from "react";

export default function TaskPlan({
  d_data,
  findBestTime,
  colors,
  tasks,
  setTasks,
  user,
}) {
  //const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredRow, setHoveredRow] = useState(null);

  const handleDurationChange = async (taskId, change) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, duration: Math.max(1, task.duration + change) }
          : task
      )
    );

    if (user) {
      const task = tasks.find((t) => t.id === taskId);
      const newDuration = Math.max(1, task.duration + change);
      await supabase
        .from("tasks")
        .update({ duration: newDuration })
        .eq("id", taskId)
        .eq("userId", user.id);
    }
  };

  //  console.log("TaskPlan rendered user: ", user);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        //.is("userId", user ? user.id : null)
        .order("duration", { ascending: false });
      if (error) setError(error.message);
      else setTasks(data);
      setLoading(false);
      //   console.log("Fetched tasks:", data);
    };
    fetchTasks();
  }, [user]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex justify-center items-center p-6 overflow-x-auto overflow-y-hidden">
      <table className="w-full text-left table-auto">
        <thead>
          <tr className="border-b" style={{ borderColor: colors.border }}>
            <th
              className="py-3 px-4 font-bold text-sm sm:text-base"
              style={{ color: colors.text }}
            >
              Aktivitet
            </th>
            <th
              className="py-3 px-4 font-bold text-sm sm:text-base"
              style={{ color: colors.text }}
            >
              varaktighet
            </th>
            <th
              className="py-3 text-right px-4 font-bold text-sm sm:text-base"
              style={{ color: colors.text }}
            >
              Bästa starttid
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const bestTime = findBestTime(d_data, task.duration);

            const isHovered = hoveredRow === task.id;
            return (
              <tr
                key={task.id}
                className="border-b transition-colors duration-200"
                style={{ borderColor: colors.border }}
                onMouseEnter={() => setHoveredRow(task.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td
                  className=" py-3 px-4 font-semibold text-sm sm:text-base"
                  style={{ color: colors.text }}
                >
                  <button onClick={() => console.log("task click ", task.id)}>
                    {task.icon} {task.name}
                  </button>
                </td>
                <td className="py-3 px-4 font-semibold relative">
                  <div
                    className="flex items-center space-x-2 transition-all duration-200 ease-in-out"
                    style={{ color: colors.text }}
                  >
                    <span className="font-semibold text-sm sm:text-base">
                      {task.duration} timm{task.duration > 1 ? "ar" : "e"}
                    </span>
                    <div
                      className={`absolute right-4 flex flex-col space-y-1 transform transition-all duration-200 ${
                        isHovered
                          ? "translate-x-0 opacity-100"
                          : "translate-x-12 opacity-0"
                      }`}
                    >
                      <button
                        onClick={() => handleDurationChange(task.id, 1)}
                        className="bg-white text-gray-800 border border-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transform hover:scale-110 hover:bg-gray-200 active:scale-95 transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDurationChange(task.id, -1)}
                        className="bg-white text-gray-800 border border-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transform hover:scale-110 hover:bg-gray-200 active:scale-95 transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-down"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
                <td
                  className="py-3 px-4 text-right font-bold text-sm sm:text-base"
                  style={{ color: colors.positive }}
                >
                  {bestTime.hour === -1
                    ? "N/A"
                    : `${String(bestTime.hour).padStart(2, "0")}:00`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
