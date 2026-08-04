<template>
    <el-dialog
        v-model="props.visible"
        :title="props.title"
        :width="props.width + 'px'"
        :before-close="onClose"
        append-to-body
    >
        <div :style="{height: props.height + 'px'}">
            <slot name="content"></slot>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="danger" @click="onClose">取消</el-button>
                <el-button type="primary" @click="onConfirm">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
// 定义参数类型
interface DialogProps {
    title?: string,
    visible: boolean,
    height?: number,
    width?: number
}
//接受父组件传递的参数
const props = withDefaults(defineProps<DialogProps>(),{
    title: '提示',
    visible: false,
    height: 500,
    width: 500
})
// 注册事件
const emit = defineEmits(['onClose','onConfirm'])

//定义关闭对话框的方法
const onClose = () => {
    emit('onClose')
}
// 定义确认对话框的方法
const onConfirm = () => {
    emit('onConfirm')
}

</script>
<style scoped lang="scss">
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

</style>