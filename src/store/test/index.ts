export const useTestStore = defineStore('testStore', {
    state: () => ({
        count: 0
    }),
    getters: {
        getCount: (state) => state.count
    },
    actions: {
        setCount(count: number) {
            this.count = count
        }
    }
})