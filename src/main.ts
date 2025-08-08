import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { Buffer } from "buffer"
import App from './App.vue'

//@ts-expect-error Provide Buffer global for smart-arraybuffer
globalThis.Buffer = Buffer

createApp(App).mount('#app')
