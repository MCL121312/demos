interface Dialog {
  visible: boolean;
  title: string;
}

export const useDialog = (title?: string) => {
  const dialog = ref<Dialog>({
    visible: false,
    title: title || ""
  });

  function setTitle(title: string) {
    dialog.value.title = title;
  }

  function openDialog(title?: string) {
    dialog.value = {
      visible: true,
      title: title || dialog.value.title
    };
  }

  function closeDialog() {
    dialog.value = {
      visible: false,
      title: dialog.value.title
    };
  }

  return {
    dialog,

    setTitle,
    openDialog,
    closeDialog
  };
};
