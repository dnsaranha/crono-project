
import { format } from "date-fns";

// Priority info helpers
export const getPriorityInfo = (priority: number) => {
  const options = [
    { value: 1, label: "Muito Baixa", color: "bg-gray-400" },
    { value: 2, label: "Baixa", color: "bg-blue-400" },
    { value: 3, label: "Média", color: "bg-green-400" },
    { value: 4, label: "Alta", color: "bg-yellow-400" },
    { value: 5, label: "Muito Alta", color: "bg-red-400" }
  ];
  
  return options.find(o => o.value === priority) || options[2];
};

// Status info helpers
export const getStatusInfo = (status: string) => {
  const options = [
    { value: "pending", label: "Pendente", color: "bg-gray-200 text-gray-800" },
    { value: "in_progress", label: "Em Progresso", color: "bg-blue-200 text-blue-800" },
    { value: "done", label: "Concluído", color: "bg-green-200 text-green-800" },
    { value: "converted", label: "Convertido", color: "bg-purple-200 text-purple-800" }
  ];
  
  return options.find(o => o.value === status) || options[0];
};

// Format date string
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy");
  } catch (e) {
    return dateString;
  }
};
