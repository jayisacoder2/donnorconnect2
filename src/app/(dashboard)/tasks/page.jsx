'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Check, AlertCircle, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const priorityConfig = {
  LOW: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/50', dot: 'bg-slate-400' },
  MEDIUM: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', dot: 'bg-blue-400' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/50', dot: 'bg-orange-400' },
  URGENT: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/50', dot: 'bg-red-400' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTaskStatus(taskId, currentStatus) {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED'
      console.log('Toggling task status:', { taskId, currentStatus, newStatus })
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      console.log('Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('Task updated:', data)
        fetchTasks()
      } else {
        const error = await res.json()
        console.error('Failed to update task:', error)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  async function updateTaskPriority(taskId, priority) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true
    if (filter === 'ACTIVE') return task.status !== 'COMPLETED'
    if (filter === 'COMPLETED') return task.status === 'COMPLETED'
    return true
  })

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || !t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  })

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Tasks & Reminders
            </h1>
            <p className="text-gray-400 mt-3 text-lg">Stay on top of follow-ups and stewardship actions.</p>
          </div>
          <Link href="/tasks/new">
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{activeTasks.length}</div>
            <p className="text-xs text-slate-500 mt-1">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 bg-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{overdueTasks.length}</div>
            <p className="text-xs text-slate-500 mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 bg-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{completedTasks.length}</div>
            <p className="text-xs text-slate-500 mt-1">Done this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tasks</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilter('ALL')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'ACTIVE' ? 'default' : 'outline'}
                onClick={() => setFilter('ACTIVE')}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={filter === 'COMPLETED' ? 'default' : 'outline'}
                onClick={() => setFilter('COMPLETED')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found. Create your first task to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                const isCompleted = task.status === 'COMPLETED'
                const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM

                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                      isCompleted 
                        ? 'bg-slate-800/30 border-slate-700/50 opacity-60' 
                        : isOverdue 
                          ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Left: Priority indicator bar */}
                    <div className={`w-1 self-stretch rounded-full ${priority.dot} ${isCompleted ? 'opacity-30' : ''}`} />
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-500 hover:border-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
                    </button>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className={`font-medium text-base ${
                            isCompleted ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text} border ${priority.border}`}>
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className={`text-sm mb-2 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {task.donor && (
                          <Link
                            href={`/donors/${task.donor.id}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                              {task.donor.firstName?.[0]}{task.donor.lastName?.[0]}
                            </span>
                            {task.donor.firstName} {task.donor.lastName}
                          </Link>
                        )}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
                            <Clock className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignedUser && (
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] text-primary">
                              {task.assignedUser.firstName?.[0]}
                            </span>
                            {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}