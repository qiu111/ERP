import { reactive } from "vue";
import type { DialogType } from "@/type/BaseType";

export default function useDialog() {
    const dialog = reactive<DialogType>({
        title: '',
        visible: false,
        height: 500,
        width: 500
    })
    const openDialog = () => {
        dialog.visible = true;
    }
    
    const handleConfirm = () => {
        dialog.visible = false;
    }
    
    const handleClose = () => {
        dialog.visible = false;
    }
    return {
        dialog,
        openDialog,
        handleConfirm,
        handleClose
    }
}       