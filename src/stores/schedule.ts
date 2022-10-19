import { defineStore } from 'pinia'

type ScheduleState = {
  schedule: Object,
}

export const useScheduleStore = defineStore({
  id: 'feedback',
  state: (): ScheduleState => ({
    schedule: {},
  }),
  getters: {},
  actions: {
    resetFeedback() {
      this.$reset()
    },
    update(e: any) {
      // this.schedule[e.target.name] = e.currentTarget.value

    },
  },
})
