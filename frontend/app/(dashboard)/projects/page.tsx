"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FolderPlus, 
  Calendar,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  // Obtener usuario del localStorage para verificar permisos
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isAdmin = user.rol === "ADMIN";

  /**
   * QUERY: Obtener todos los proyectos del sistema
   */
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data;
    },
  });

  /**
   * MUTATION: Crear un nuevo proyecto
   */
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return api.post("/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto creado exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear el proyecto");
    },
  });

  /**
   * MUTATION: Actualizar un proyecto existente
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.patch(`/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto actualizado");
      setIsEditOpen(false);
      setCurrentProject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar");
    },
  });

  /**
   * MUTATION: Eliminar un proyecto permanentemente
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto eliminado");
      setIsDeleteOpen(false);
      setCurrentProject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar");
    },
  });

  /**
   * HANDLER: Manejar el envío del formulario de creación
   */
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Nombre obligatorio");
    createMutation.mutate(formData);
  };

  /**
   * HANDLER: Manejar el envío del formulario de actualización
   */
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    updateMutation.mutate({ id: currentProject.id, data: formData });
  };

  /**
   * HANDLER: Abrir el modal de edición con los datos del proyecto
   */
  const openEdit = (project: Project) => {
    setCurrentProject(project);
    setFormData({ name: project.name, description: project.description || "" });
    setIsEditOpen(true);
  };

  /**
   * HANDLER: Abrir el modal de confirmación de eliminación
   */
  const openDelete = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">Administra y organiza tus espacios de trabajo.</p>
        </div>

        {isAdmin && (
          <Button className="gap-2" onClick={() => {
            setFormData({ name: "", description: "" });
            setIsCreateOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Lista de Proyectos
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar proyecto..." className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableHead className="w-[300px]">Nombre</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Tareas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : projects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
                      <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                        <FolderPlus className="h-10 w-10 opacity-40" />
                      </div>
                      <p className="text-lg font-medium text-foreground">No hay proyectos</p>
                      {isAdmin && (
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear mi primer proyecto
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                projects?.map((project) => (
                  <TableRow key={project.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium">
                      <Link href={`/projects/${project.id}/tasks`} className="hover:underline">
                        <p>{project.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{project.description}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/projects/${project.id}/tasks`}>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                          {project._count?.tasks || 0} tareas
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/tasks`} className="cursor-pointer">
                              Ver tareas
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEdit(project)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={() => openDelete(project)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG CREAR */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDITAR */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG ELIMINAR */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> ¿Eliminar proyecto?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Esta acción no se puede deshacer. Se eliminarán permanentemente el proyecto 
            <strong> {currentProject?.name}</strong> y todas sus tareas asociadas.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(currentProject!.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
