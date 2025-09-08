import { supabase } from "../utils/supabase.js";
import { useEffect, useState, useRef } from "react";

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
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const ICONS = [
    "🔌",
    "💡",
    "🔥",
    "🌡️",
    "🔋",
    "🚿",
    "⚡️",
    "🧺",
    "🧹",
    "🥔",
    "🍽️",
    "🚗",
    "🛁",
    "🧊",
    "🖥️",
    "📺",
    "🕹️",
    "🛏️",
    "🧯",
    "🧴",
    "🧦",
    "🧤",
    "🧥",
    "🧽",
    "🧪",
    "🧬",
    "🧭",
    "🧰",
    "🧲",
    "🧳",
    "🧼",
    "🪣",
    "🪛",
    "🪜",
    "🪟",
    "🪠",
    "🪤",
    "🪥",
    "🪦",
    "🪧",
    "🪨",
    "🪩",
    "🪪",
    "🪫",
    "🪬",
    "🪮",
    "🪯",
    "🪰",
  ];

  const [iconPickerTaskId, setIconPickerTaskId] = useState(null);
  const iconPickerRef = useRef(null);

  // Stäng ikonväljaren vid klick utanför
  useEffect(() => {
    if (!iconPickerTaskId) return;
    const handleClickOutside = (event) => {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(event.target)
      ) {
        setIconPickerTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [iconPickerTaskId]);

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

  const handleRemoveTask = async (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    /* */
    if (user) {
      await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("userId", user.id);
    }
  };

  const handleAddTask = async () => {
    const newTask = {
      name: "Ny aktivitet",
      duration: 1,
      icon: "⚡️",
      userId: user ? user.id : null,
    };
    if (user) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select();
      if (!error && data && data[0]) {
        setTasks((prev) => [...prev, data[0]]);
      }
    } else {
      // Lägg till lokalt om ej inloggad
      setTasks((prev) => [...prev, { ...newTask, id: Date.now() }]);
    }
  };
  //  console.log("TaskPlan rendered user: ", user);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from("tasks").select("*");
      if (user) {
        query = query.eq("userId", user.id);
      }
      const { data, error } = await query.order("duration", {
        ascending: true,
      });
      if (error) setError(error.message);
      else setTasks(data);
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  const handleTitleClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.name);
  };

  const handleTitleChange = (e) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleBlur = async (task) => {
    setEditingTaskId(null);
    if (editingTitle.trim() && editingTitle !== task.name) {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, name: editingTitle } : t
        )
      );
      if (user) {
        await supabase
          .from("tasks")
          .update({ name: editingTitle })
          .eq("id", task.id)
          .eq("userId", user.id);
      }
    }
  };

  const handleIconClick = (task) => {
    setIconPickerTaskId(task.id);
  };

  const handleIconSelect = async (task, icon) => {
    setIconPickerTaskId(null);
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? { ...t, icon } : t))
    );
    if (user) {
      await supabase
        .from("tasks")
        .update({ icon })
        .eq("id", task.id)
        .eq("userId", user.id);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className="p-6 rounded-xl shadow-md border transition-all duration-300"
      style={{
        backgroundColor: colors._card,
        borderColor: colors._border,
      }}
    >
      <h2 className="text-xl font-bold mb-4" style={{ color: colors._primary }}>
        Planeringshjälp
      </h2>
      <p className="mb-4" style={{ color: colors._mutedText }}>
        Baserat på priserna, här är de bästa tiderna att köra dina mest
        energikrävande apparater. Du kan lägga till, redigera och ta bort
        uppgifter i din plan, det sparas om du är inloggad.
      </p>
      <div className="flex justify-center items-center p-6">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b" style={{ borderColor: colors._border }}>
              <th
                className="py-3 px-4 font-bold text-sm sm:text-base"
                style={{ color: colors._text }}
              >
                Aktivitet
              </th>
              <th
                className="py-3 px-4 font-bold text-sm sm:text-base"
                style={{ color: colors._text }}
              >
                varaktighet
              </th>
              <th
                className="py-3 text-right px-4 font-bold text-sm sm:text-base"
                style={{ color: colors._text }}
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
                  style={{ borderColor: colors._border }}
                  onMouseEnter={() => setHoveredRow(task.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    className="p-4 font-semibold text-sm sm:text-base relative"
                    style={{ color: colors._text }}
                  >
                    {/* Ikon och ikonväljare */}
                    <button
                      onClick={() => handleIconClick(task)}
                      className="mr-2"
                      style={{ fontSize: "1.5rem" }}
                      title="Välj ikon"
                    >
                      {task.icon}
                    </button>
                    {iconPickerTaskId === task.id && (
                      <div
                        ref={iconPickerRef}
                        className="absolute z-20 top-8 bg-white rounded-xl shadow-lg border p-2 flex flex-wrap gap-2"
                        style={{
                          //  left: "50%",
                          // transform: "translateX(-50%)",
                          backgroundColor: colors._card,
                          borderColor: colors.border,
                          maxWidth: "600px",
                          minWidth: "320px",
                        }}
                      >
                        {ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => handleIconSelect(task, icon)}
                            className="text-xl p-1 rounded hover:bg-gray-200"
                            style={{
                              backgroundColor: colors._background,
                              color: colors._text,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Titel */}
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        autoFocus
                        onChange={handleTitleChange}
                        onBlur={() => handleTitleBlur(task)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.target.blur();
                        }}
                        className="bg-transparent border-b border-gray-300 outline-none px-1"
                        style={{ color: colors.text, minWidth: "6rem" }}
                      />
                    ) : (
                      <button
                        onClick={() => handleTitleClick(task)}
                        title="Redigera titel"
                        className="cursor-pointer"
                      >
                        {task.name}
                      </button>
                    )}
                  </td>
                  <td className="p-4 pl-6 font-semibold relative">
                    <div
                      className="flex items-center text-center space-x-2 transition-all duration-200 ease-in-out"
                      style={{ color: colors._text }}
                    >
                      <span className="cursor-default text-center font-semibold text-sm sm:text-base">
                        {task.duration} timm{task.duration > 1 ? "ar" : "e"}
                      </span>
                      <div
                        className={`absolute left-26 flex flex-col space-y-1 transform transition-all duration-200 ${
                          isHovered
                            ? "translate-x-0 opacity-100"
                            : "translate-x-12 opacity-0"
                        }`}
                      >
                        <button
                          onClick={() => handleDurationChange(task.id, 1)}
                          className="border rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-transform"
                          style={{
                            color: colors._backgroundprimary,
                            backgroundColor: colors._card,
                            borderColor: colors._border,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-chevron-up"
                          >
                            <path d="m18 15-6-6-6 6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDurationChange(task.id, -1)}
                          className="border rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transform hover:scale-110 hover:bg-gray-200 active:scale-95 transition-transform"
                          style={{
                            color: colors._primary,
                            backgroundColor: colors._card,
                            borderColor: colors._border,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
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
                    className="p-4 text-right relative"
                    style={{ color: colors._positive }}
                  >
                    <div
                      className={`absolute -right-5 flex flex-col transform transition-all duration-200 ${
                        isHovered
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-12 opacity-0"
                      }`}
                    >
                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="border cursor-pointer rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-transform"
                        title="Ta bort aktivitet"
                        style={{
                          color: colors._negative,
                          backgroundColor: colors._card,
                          borderColor: colors._border,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          className="lucide lucide-x"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <span className=" font-bold text-sm sm:text-base">
                      {bestTime.hour === -1
                        ? "N/A"
                        : `${String(bestTime.hour).padStart(2, "0")}:00`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleAddTask}
          //className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-80"
          style={{
            backgroundColor: colors._primary,
            color: colors._card,
            border: `1px solid ${colors._border}`,
          }}
        >
          + Lägg till aktivitet
        </button>
      </div>
    </div>
  );
}
