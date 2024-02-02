import { Button } from "antd";
import { type FC } from "react";

type SaveAndClearButtonsProps = Partial<{
  isLoading: boolean;
  isClearDisabled: boolean;
  isSaveDisabled: boolean;
  className: string;
  onClear: () => void;
  onSave: () => void;
}>;

export const SaveAndClearButtons: FC<SaveAndClearButtonsProps> = ({
  isLoading,
  isClearDisabled,
  isSaveDisabled,
  className,
  onClear,
  onSave,
}) => (
  <div className={className + " flex justify-between max-sm:flex-wrap gap-3"}>
    <Button
      tabIndex={0}
      size="large"
      type="default"
      loading={isLoading}
      disabled={isClearDisabled}
      className="custom-primary-button bg-accent w-full sm:w-40"
      onClick={onClear}
    >
      Clear Form
    </Button>
    <Button
      tabIndex={0}
      size="large"
      type="default"
      htmlType="submit"
      loading={isLoading}
      disabled={isSaveDisabled}
      className="custom-primary-button w-full sm:w-40"
      onClick={onSave}
    >
      Save
    </Button>
  </div>
);
