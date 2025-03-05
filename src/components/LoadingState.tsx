
interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Carregando..." }: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center py-8">
      {message}
    </div>
  );
};

export default LoadingState;
