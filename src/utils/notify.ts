import { Id, Slide, toast, TypeOptions } from "react-toastify";

export const notify = (
  message: string,
  type: TypeOptions,
  theme: string = "light"
) => {
  toast(message, {
    position: "bottom-right",
    // @ts-ignore
    theme: theme,
    autoClose: 5000,
    transition: Slide,
    hideProgressBar: false,
    pauseOnFocusLoss: false,
    type: type,
    className: "toast-message",
  });
};

export const notifyLoading = (message: string, theme: string = "light") => {
  return toast.loading(message, {
    position: "bottom-right",
    // @ts-ignore
    theme: theme,
    transition: Slide,
    className: "toast-message",
  });
};

export const notifyUpdate = (
  toastId: Id,
  message: string,
  type: TypeOptions
) => {
  toast.update(toastId, {
    render: message,
    type: type,
    autoClose: 5000,
    isLoading: false,
  });
};
