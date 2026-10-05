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
    <div className="ns-form-header">
      <Text size="xl" weight="bold">
        {title ?? defaultTitle}
      </Text>
      {showFullName && (
        <Text size="lg" weight="bold">
          {label}.{parentName}
        </Text>
      )}
      {subtitle && (
        <Text size="sm" color="grey">
          {subtitle}
        </Text>
      )}
    </div>
  );
};
