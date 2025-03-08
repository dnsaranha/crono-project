
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadCloud, UploadCloud } from "lucide-react";
import * as XLSX from 'xlsx';
import { TaskType } from "@/components/Task";
import { supabase } from "@/integrations/supabase/client";

interface ExcelExportImportProps {
  projectId: string;
  tasks: TaskType[];
  onTasksImported: (tasks: TaskType[]) => void;
}

export function ExcelExportImport({ projectId, tasks, onTasksImported }: ExcelExportImportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  // Function to export tasks to Excel
  function handleExport() {
    try {
      if (tasks.length === 0) {
        toast({
          title: "Nenhuma tarefa para exportar",
          description: "Adicione algumas tarefas antes de exportar.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Exportando tarefas:", tasks);
      
      // Prepare data for export
      const exportData = tasks.map(task => ({
        ID: task.id,
        Nome: task.name,
        "Data de Início": task.startDate,
        "Duração (dias)": task.duration,
        "Progresso (%)": task.progress,
        "ID do Pai": task.parentId || "",
        "É Grupo": task.isGroup ? "Sim" : "Não",
        "Dependências": task.dependencies?.join(", ") || ""
      }));

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const columnWidths = [
        { wch: 10 }, // ID
        { wch: 30 }, // Nome
        { wch: 15 }, // Data de Início
        { wch: 15 }, // Duração
        { wch: 15 }, // Progresso
        { wch: 15 }, // ID do Pai
        { wch: 10 }, // É Grupo
        { wch: 30 }, // Dependências
      ];
      worksheet["!cols"] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas");
      
      // Generate file and trigger download
      XLSX.writeFile(workbook, `Projeto_${projectId}_Tarefas.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  // Function to handle file selection for import
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryString = evt.target?.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        
        // Get first sheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Map imported data to task format
        const importedTasks: TaskType[] = data.map((row: any) => ({
          id: row.ID || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: row.Nome || "Nova Tarefa",
          startDate: row["Data de Início"] || new Date().toISOString().split('T')[0],
          duration: row["Duração (dias)"] || 7,
          progress: row["Progresso (%)"] || 0,
          parentId: row["ID do Pai"] || undefined,
          isGroup: row["É Grupo"] === "Sim",
          dependencies: row["Dependências"] ? row["Dependências"].split(", ").filter(Boolean) : []
        }));
        
        // Update the tasks
        onTasksImported(importedTasks);
        
        toast({
          title: "Importação concluída",
          description: `${importedTasks.length} tarefas foram importadas com sucesso.`,
        });
        
        setIsImportDialogOpen(false);
      } catch (error: any) {
        toast({
          title: "Erro na importação",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    
    reader.readAsBinaryString(file);
  }

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        className="flex items-center"
      >
        <DownloadCloud className="h-4 w-4 mr-2" />
        Exportar para Excel
      </Button>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Importar do Excel
          </Button>
        </DialogTrigger>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Tarefas do Excel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="excel-file">Selecione o arquivo Excel</Label>
              <Input 
                id="excel-file" 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>O arquivo Excel deve conter colunas com os seguintes cabeçalhos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ID</li>
                <li>Nome</li>
                <li>Data de Início</li>
                <li>Duração (dias)</li>
                <li>Progresso (%)</li>
                <li>ID do Pai</li>
                <li>É Grupo</li>
                <li>Dependências</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
