import type { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { iconButtonClasses, type IconButtonSize, type IconButtonVariant } from "./model/classes";

interface IProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Обязательная подпись для скринридеров — у кнопки нет текста */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const IconButton: FC<IProps> = ({ label, variant, size, className, type = "button", children, ...props }) => {
  return (
    <button type={type} aria-label={label} className={iconButtonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
};

export default IconButton;
