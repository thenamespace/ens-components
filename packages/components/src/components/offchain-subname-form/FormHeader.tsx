import { Text } from "@/components/atoms";

interface FormHeaderProps {
  isUpdateMode: boolean;
  label: string;
  parentName: string;
  showFullName: boolean;
  title?: string;
  subtitle?: string;
}

export const FormHeader = ({ isUpdateMode, label, parentName, showFullName, title, subtitle }: FormHeaderProps) => {
  const defaultTitle = isUpdateMode ? "Update subname" : "Create subname";

  return (
    <div className="ns-text-center mb-3">
      <Text size="lg" weight="bold" className="mb-1">
        {title ?? defaultTitle}
      </Text>
      {showFullName && (
        <Text size="lg" weight="bold">
          {label}.{parentName}
        </Text>
      )}
      {subtitle && (
        <Text size="sm" color="grey" className="mt-1">
          {subtitle}
        </Text>
      )}
    </div>
  );
};
