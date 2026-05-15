"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Pencil,
  Trash2,
  ChevronRight,
  LayoutGrid,
  List,
  CheckSquare,
  Calendar as CalendarIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban-board";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  projectId: string;
}

export default function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isAdmin = user.rol === "ADMIN";

  /**
   * QUERY: Obtener los detalles del proyecto actual
   */
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
  });

  /**
   * QUERY: Obtener todas las tareas filtradas por el proyecto actual
   */
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const response = await api.get(`/tasks?projectId=${projectId}`);
      return response.data;
    },
  });

  /**
   * MUTATION: Crear una nueva tarea vinculada al proyecto
   */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/tasks", { ...data, projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Tarea creada");
      setIsCreateOpen(false);
      resetForm();
    },
  });

  /**
   * MUTATION: Actualizar los datos de una tarea (incluyendo el estado vía Drag & Drop)
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.patch(`/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Tarea actualizada");
      setIsEditOpen(false);
    },
  });

  /**
   * MUTATION: Eliminar una tarea de forma permanente
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Tarea eliminada");
    },
  });

  /**
   * HELPER: Resetear el formulario de tareas a sus valores por defecto
   */
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    });
  };

  /**
   * HANDLER: Manejar el envío del formulario de creación
   */
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: No permitir fechas pasadas
    if (formData.dueDate) {
      const selectedDate = startOfDay(new Date(formData.dueDate));
      const today = startOfDay(new Date());
      if (selectedDate < today) {
        return toast.error("No puedes crear una tarea con una fecha vencida.");
      }
    }

    createMutation.mutate(formData);
  };

  /**
   * HANDLER: Manejar el envío del formulario de actualización
   */
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTask) updateMutation.mutate({ id: currentTask.id, data: formData });
  };

  /**
   * HANDLER: Preparar y abrir el modal de edición para una tarea específica
   */
  const openEdit = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE": return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Completada</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3 mr-1"/> En progreso</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Por hacer</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH": return <Badge variant="destructive">Alta</Badge>;
      case "MEDIUM": return <Badge className="bg-orange-500">Media</Badge>;
      default: return <Badge variant="outline">Baja</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Proyectos</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{project?.name || "Cargando..."}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tareas</h2>
          <p className="text-muted-foreground">Gestiona los pendientes del proyecto.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Tarea
          </Button>
        )}
      </div>

      <Tabs defaultValue="board" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Tablero
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Tareas del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : tasks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No hay tareas en este proyecto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell className="text-sm">
                          {task.dueDate ? (
                            <span className={cn(
                              "flex items-center gap-1",
                              task.status !== "DONE" && isPast(startOfDay(new Date(task.dueDate))) && "text-destructive font-semibold"
                            )}>
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(task.dueDate), "dd MMM, yyyy", { locale: es })}
                              {task.status !== "DONE" && isPast(startOfDay(new Date(task.dueDate))) && " (Vencida)"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Sin fecha</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(task)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(task.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard 
              tasks={tasks || []} 
              isAdmin={isAdmin}
              onTaskMove={(taskId, newStatus) => {
                updateMutation.mutate({ id: taskId, data: { status: newStatus } });
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL CREAR/EDITAR */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { if(!open) { setIsCreateOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({...formData, status: v})}
                  disabled={!isEditOpen} // Bloqueado al crear tarea nueva
                >
                  <SelectTrigger className={!isEditOpen ? "bg-muted" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">Por Hacer</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="DONE">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditOpen ? "Guardar Cambios" : "Crear Tarea"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

