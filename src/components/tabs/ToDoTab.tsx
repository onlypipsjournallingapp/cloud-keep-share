
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Square, SquareCheck, Plus, Trash2 } from "lucide-react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const ToDoTab = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim() === "") return;
    setTodos([
      { id: Date.now(), text: input.trim(), completed: false },
      ...todos,
    ]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos => todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add Todo section */}
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

      {/* Todos list */}
      <div>
        {todos.length === 0 ? (
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
                  onClick={() => toggleTodo(todo.id)}
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
