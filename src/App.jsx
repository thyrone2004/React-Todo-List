import { useEffect, useState } from "react"
import { NewTodoForm } from "./NewTodoForm"
import "./styles.css"
import { TodoList } from "./TodoList"
import { supabase } from "./supabase"

export default function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    getTodos()
  }, [])

  async function getTodos() {
    setLoading(true)
    setErrorMessage("")

    const { data, error } = await supabase
      .from("todolist")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    setTodos(data || [])
    setLoading(false)
  }

  async function addTodo(title) {
    const { data, error } = await supabase
      .from("todolist")
      .insert([{ title, completed: false }])
      .select()
      .single()

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setTodos(currentTodos => [...currentTodos, data])
  }

  async function toggleTodo(id, completed) {
    const { error } = await supabase
      .from("todolist")
      .update({ completed })
      .eq("id", id)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setTodos(currentTodos =>
      currentTodos.map(todo =>
        todo.id === id ? { ...todo, completed } : todo
      )
    )
  }

  async function deleteTodo(id) {
    const { error } = await supabase
      .from("todolist")
      .delete()
      .eq("id", id)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id))
  }

  return (
    <>
      <NewTodoForm onSubmit={addTodo} />
      <h1 className="header">Todo List</h1>

      {loading && <p>Loading todos...</p>}
      {errorMessage && <p>{errorMessage}</p>}

      {!loading && (
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
        />
      )}
    </>
  )
}