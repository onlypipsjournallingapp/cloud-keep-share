
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Square, SquareCheck, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const ToDoTab = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!user || input.trim() === "") return;

    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([{ text: input.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setTodos([data, ...todos]);
      setInput("");
      toast.success("Todo added successfully");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo");
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      setTodos(todos =>
        todos.map(todo =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTodos(todos => todos.filter(todo => todo.id !== id));
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  if (!user) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>Please log in to manage your todos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") addTodo();
          }}
          className="flex-1"
        />
        <Button onClick={addTodo} disabled={!input.trim()} variant="default">
          <Plus />
        </Button>
      </div>

      <div>
        {isLoading ? (
          <div className="text-center text-muted-foreground p-8">
            <p>Loading...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            <p className="mb-2">No to-dos yet</p>
            <p className="text-sm">Start by adding your first task above!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-muted rounded px-3 py-2"
              >
                <button
                  type="button"
                  aria-label="Toggle complete"
                  className="mr-3"
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  tabIndex={0}
                >
                  {todo.completed ? (
                    <SquareCheck className="text-primary-foreground bg-primary rounded" />
                  ) : (
                    <Square className="text-muted-foreground" />
                  )}
                </button>
                <span
                  className={`flex-1 text-left ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ToDoTab;
