import { createRouter, createWebHistory } from 'vue-router'
import candidate from'../components/candidate.vue';
import ruir from'../components/ruir.vue';
import mobileVoter from'../components/mobile-voter.vue';


const routes = [
  {
    path: '/',
    component: candidate
},
{
    path: '/ruir',
    component: ruir
},
{
    path: '/mobile-voter',
    component: mobileVoter
}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
