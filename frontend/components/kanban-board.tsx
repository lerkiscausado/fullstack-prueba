"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Calendar,
  GripVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, isPast, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  projectId: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task["status"]) => void;
  isAdmin: boolean;
}

const COLUMNS = [
  { id: "TODO", title: "Por hacer", color: "bg-slate-100 dark:bg-slate-900/50" },
  { id: "IN_PROGRESS", title: "En progreso", color: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "DONE", title: "Finalizado", color: "bg-green-50 dark:bg-green-950/20" },
];

export function KanbanBoard({ tasks, onTaskMove, isAdmin }: KanbanBoardProps) {
  const onDragEnd = (result: DropResult) => {
    if (!isAdmin) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onTaskMove(draggableId, destination.droppableId as Task["status"]);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH": return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Alta</Badge>;
      case "MEDIUM": return <Badge className="bg-orange-500 text-[10px] px-1.5 py-0">Media</Badge>;
      default: return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Baja</Badge>;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
        {COLUMNS.map((column) => (
          <div key={column.id} className={cn("flex flex-col rounded-xl p-4 border border-border/50", column.color)}>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {column.id === "TODO" && <Clock className="w-4 h-4 text-slate-400" />}
                {column.id === "IN_PROGRESS" && <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                {column.id === "DONE" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {column.title}
                <span className="ml-2 bg-background/50 px-2 py-0.5 rounded-full text-[10px]">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </h3>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 space-y-3 transition-colors rounded-lg p-1",
                    snapshot.isDraggingOver && "bg-background/40"
                  )}
                >
                  {tasks
                    .filter((task) => task.status === column.id)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!isAdmin}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <Card className={cn(
                              "group border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
                              snapshot.isDragging ? "ring-2 ring-primary shadow-xl rotate-2" : "hover:-translate-y-1"
                            )}>
                              <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                                    {task.title}
                                  </h4>
                                  {isAdmin && <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />}
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-2">
                                    {getPriorityBadge(task.priority)}
                                  </div>
                                  {task.dueDate && (
                                    <div className={cn(
                                      "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
                                      task.status !== "DONE" && isPast(startOfDay(new Date(task.dueDate))) 
                                        ? "bg-destructive/10 text-destructive font-bold animate-pulse" 
                                        : "text-muted-foreground bg-muted/50"
                                    )}>
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(task.dueDate), "dd MMM", { locale: es })}
                                      {task.status !== "DONE" && isPast(startOfDay(new Date(task.dueDate))) && " (Vencida)"}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
