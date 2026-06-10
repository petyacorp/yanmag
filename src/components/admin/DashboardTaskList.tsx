"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { 
  ClipboardList, Plus, Trash2, Loader2, 
  Circle, HelpCircle, PlayCircle, CheckCircle2,
  User
} from "lucide-react";
import { 
  createDashboardTask, 
  updateDashboardTaskStatus, 
  deleteDashboardTask 
} from "@/lib/actions/tasks";
import { getAdminUsers } from "@/lib/actions/users";
import type { DashboardTask, DashboardTaskStatus, Profile } from "@/lib/types";

interface DashboardTaskListProps {
  initialTasks: DashboardTask[];
}

export default function DashboardTaskList({ initialTasks }: DashboardTaskListProps) {
  const [tasks, setTasks] = useState<DashboardTask[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Autocomplete Mentions State
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAdminUsers();
        setAdminUsers(users);
      } catch (err) {
        console.error("Failed to load admin users for mentions:", err);
      }
    };
    loadUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewTaskTitle(val);

    const selectionStart = e.target.selectionStart || 0;
    const lastAtIdx = val.lastIndexOf('@', selectionStart - 1);

    if (lastAtIdx !== -1) {
      const textBetween = val.substring(lastAtIdx, selectionStart);
      if (!textBetween.includes(' ')) {
        const query = textBetween.slice(1).toLowerCase();
        setMentionIndex(lastAtIdx);
        
        const filtered = adminUsers.filter(user => {
          const emailPrefix = user.email.split('@')[0].toLowerCase();
          const fullName = (user.full_name || '').toLowerCase();
          return emailPrefix.includes(query) || fullName.includes(query);
        });
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestionIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (user: Profile) => {
    const emailPrefix = user.email.split('@')[0];
    const displayName = user.full_name || emailPrefix;
    const beforeMention = newTaskTitle.substring(0, mentionIndex);
    const selectionStart = inputRef.current?.selectionStart || 0;
    const afterMention = newTaskTitle.substring(selectionStart);

    const updatedTitle = `${beforeMention}@${displayName} ${afterMention}`;
    setNewTaskTitle(updatedTitle);
    setShowSuggestions(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const cursor = beforeMention.length + displayName.length + 2; // @ + space
        inputRef.current.setSelectionRange(cursor, cursor);
      }
    }, 10);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAdding(true);
      const createdTask = await createDashboardTask(newTaskTitle);
      setTasks((prev) => [...prev, createdTask]);
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStatus = (id: string, status: DashboardTaskStatus) => {
    setLoadingTaskId(id);
    startTransition(async () => {
      try {
        const updatedTask = await updateDashboardTaskStatus(id, status);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updatedTask : t))
        );
      } catch (error) {
        console.error("Error updating task status:", error);
      } finally {
        setLoadingTaskId(null);
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    setLoadingTaskId(id);
    startTransition(async () => {
      try {
        await deleteDashboardTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        setLoadingTaskId(null);
      }
    });
  };

  // Calculations for progress bar
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-yan-border)] mb-5">
        <h2 className="text-base font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[var(--color-yan-red)]" strokeWidth={1.5} />
          Tareas de Redacción y Seguimiento
        </h2>
        <span className="text-[10px] font-mono text-[var(--color-yan-stone)] uppercase tracking-widest bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] px-2 py-0.5 font-bold">
          Progreso: {completedTasks}/{totalTasks} ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="w-full bg-[var(--color-yan-border-light)] h-1 mb-6 relative overflow-hidden">
          <div 
            className="bg-[var(--color-yan-red)] h-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Add New Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-3 mb-6 relative">
        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-64 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] shadow-xl z-50 divide-y divide-[var(--color-yan-border-light)] max-h-48 overflow-y-auto">
            {suggestions.map((user, idx) => {
              const emailPrefix = user.email.split('@')[0];
              const isSelected = idx === activeSuggestionIndex;
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectSuggestion(user)}
                  className={`px-4 py-2 flex items-center gap-2.5 cursor-pointer text-[12px] transition-colors font-sans ${
                    isSelected 
                      ? 'bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]' 
                      : 'text-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-surface-elevated)]'
                  }`}
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name || emailPrefix} 
                      className="w-5 h-5 rounded-full object-cover border border-[var(--color-yan-border)]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center">
                      <User className="w-3 h-3 text-[var(--color-yan-stone)]" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{user.full_name || emailPrefix}</span>
                    <span className={`text-[9px] font-mono truncate ${isSelected ? 'text-[var(--color-yan-stone)]/65' : 'text-[var(--color-yan-stone)]'}`}>
                      {user.email}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={newTaskTitle}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Escribe una nueva tarea pendiente (ej: @Canispetyas revisar borrador)..."
          className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] px-4 py-2.5 text-[13px] text-[var(--color-yan-charcoal)] outline-none transition-colors font-sans placeholder:text-[var(--color-yan-stone)]"
          disabled={isAdding || isPending}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] text-[var(--color-yan-ivory)] px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest font-semibold transition-colors"
          disabled={isAdding || isPending || !newTaskTitle.trim()}
        >
          {isAdding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          Añadir
        </button>
      </form>

      {/* Task List */}
      <div className="divide-y divide-[var(--color-yan-border-light)] max-h-80 overflow-y-auto pr-1">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isLoading = loadingTaskId === task.id;
            return (
              <div 
                key={task.id} 
                className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity duration-300 ${
                  task.status === "completed" ? "opacity-75" : ""
                }`}
              >
                {/* Task Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                    ) : task.status === "in_progress" ? (
                      <PlayCircle className="w-4 h-4 text-amber-500 animate-pulse" strokeWidth={2} />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span 
                      className={`text-[13px] text-[var(--color-yan-charcoal)] break-words font-sans leading-relaxed ${
                        task.status === "completed" ? "line-through text-[var(--color-yan-stone)]" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.created_by && (
                      <span className="text-[9px] font-mono text-[var(--color-yan-stone)] mt-0.5 uppercase tracking-wider">
                        Ingresada por: {task.created_by}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switcher & Delete Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  <div className="flex bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] p-0.5 text-[10px] font-mono font-semibold">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "pending")}
                      disabled={isLoading}
                      className={`px-2 py-1 transition-colors uppercase ${
                        task.status === "pending"
                          ? "bg-[var(--color-yan-stone)] text-[var(--color-yan-ivory)]"
                          : "text-[var(--color-yan-stone)] hover:bg-[var(--color-yan-border-light)]"
                      }`}
                    >
                      Pendiente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "in_progress")}
                      disabled={isLoading}
                      className={`px-2 py-1 transition-colors uppercase ${
                        task.status === "in_progress"
                          ? "bg-amber-500 text-white"
                          : "text-[var(--color-yan-stone)] hover:bg-[var(--color-yan-border-light)]"
                      }`}
                    >
                      En trabajo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "completed")}
                      disabled={isLoading}
                      className={`px-2 py-1 transition-colors uppercase ${
                        task.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : "text-[var(--color-yan-stone)] hover:bg-[var(--color-yan-border-light)]"
                      }`}
                    >
                      Hecho
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isLoading}
                    className="p-1.5 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] border border-transparent hover:border-[var(--color-yan-border)] transition-all bg-[var(--color-yan-surface-elevated)]"
                    title="Eliminar tarea"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-xs">
            No hay tareas pendientes en la pizarra. ¡Añade una para comenzar!
          </div>
        )}
      </div>
    </div>
  );
}
