import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'./tests',fullyParallel:false,workers:1,use:{baseURL:'http://127.0.0.1:4189/Review-Room/',browserName:'chromium',viewport:{width:1440,height:1000},trace:'retain-on-failure'},webServer:{command:'npm run preview',url:'http://127.0.0.1:4189/Review-Room/',reuseExistingServer:false,timeout:30000},reporter:'list'})
