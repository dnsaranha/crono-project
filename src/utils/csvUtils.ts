
import { WorkloadTask } from '@/types/workload';

export function exportTasksToCSV(tasks: WorkloadTask[]): void {
  const headers = [
    'ID',
    'Nome',
    'Projeto ID',
    'Projeto Nome',
    'Colaborador ID', 
    'Colaborador Nome',
    'Data Início',
    'Data Fim',
    'Horas por Dia',
    'Status',
    'Criado em',
    'Atualizado em'
  ];

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      task.id,
      `"${task.name}"`,
      task.project_id,
      `"${task.project_name}"`,
      task.assignee_id,
      `"${task.assignee_name}"`,
      task.start_date,
      task.end_date,
      task.hours_per_day,
      task.status,
      task.created_at,
      task.updated_at
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `workload-tasks-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToTasks(csvContent: string): Omit<WorkloadTask, 'id' | 'created_at' | 'updated_at'>[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(val => val.replace(/"/g, ''));
      
      return {
        name: values[1] || 'Tarefa Importada',
        project_id: values[2] || 'default',
        project_name: values[3] || 'Projeto Padrão',
        assignee_id: values[4] || 'default',
        assignee_name: values[5] || 'Colaborador Padrão',
        start_date: values[6] || new Date().toISOString().split('T')[0],
        end_date: values[7] || new Date().toISOString().split('T')[0],
        hours_per_day: parseInt(values[8]) || 8,
        status: (values[9] as 'pending' | 'in_progress' | 'completed') || 'pending'
      };
    });
}
