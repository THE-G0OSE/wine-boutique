import type { FC } from "react";
import { Link, type LinkProps } from "react-router";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./model/classes";

interface IProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Ссылка внутри приложения, оформленная как кнопка */
const ButtonLink: FC<IProps> = ({ variant, size, className, ...props }) => {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
};

export default ButtonLink;
