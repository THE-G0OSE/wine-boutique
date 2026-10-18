import type { ButtonHTMLAttributes, FC } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./model/classes";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: FC<IProps> = ({ variant, size, className, type = "button", ...props }) => {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
};

export default Button;
