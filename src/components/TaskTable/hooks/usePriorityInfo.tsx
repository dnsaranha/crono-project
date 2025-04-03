
export function usePriorityInfo() {
  // Get priority color and label
  const getPriorityInfo = (priority?: number) => {
    const priorityLevel = priority || 3;
    const options = [
      { value: 1, label: "Muito Baixa", color: "bg-gray-400", textColor: "text-gray-400" },
      { value: 2, label: "Baixa", color: "bg-blue-400", textColor: "text-blue-400" },
      { value: 3, label: "Média", color: "bg-green-400", textColor: "text-green-400" },
      { value: 4, label: "Alta", color: "bg-yellow-400", textColor: "text-yellow-400" },
      { value: 5, label: "Muito Alta", color: "bg-red-400", textColor: "text-red-400" }
    ];
    
    return options.find(o => o.value === priorityLevel) || options[2];
  };

  return { getPriorityInfo };
}
