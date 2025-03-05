
import { Spinner } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Carregando..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="animate-spin">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
