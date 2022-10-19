import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import App from '~/App.vue'
import * as apolloProvider from '~/requests/apollo.provider'
import { createPinia } from 'pinia'
import 'virtual:svg-icons-register'
import moment from 'moment'

// const app = createApp(App)
// app.config.globalProperties.$filters = {
//
// }
// app.use(createPinia()).use(apolloProvider.provider).use(createHead())
// app.mount('#app')

const app = createApp(App).use(createPinia().use(apolloProvider.provider)).use(moment).use(createHead())

app.mount('#app')
