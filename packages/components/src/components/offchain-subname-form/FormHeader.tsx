import { Text } from "@/components/atoms";

interface FormHeaderProps {
  isUpdateMode: boolean;
  label: string;
  parentName: string;
  showFullName: boolean;
}

export const FormHeader = ({ isUpdateMode, label, parentName, showFullName }: FormHeaderProps) => {
  const smallTitle = isUpdateMode ? "Update subname" : "Create subname";

  return (
    <div className="ns-text-center mb-3">
      <Text size="sm" color="grey" className="mb-1">
        {smallTitle}
      </Text>
      {showFullName && (
        <Text size="lg" weight="bold">
          {label}.{parentName}
        </Text>
      )}
    </div>
  );
};
