import { createRouter, createWebHistory } from 'vue-router'
import candidate from'../components/candidate.vue';
import riur from'../components/riur.vue';
import mobileVoter from'../components/mobile-voter.vue';


const routes = [
  {
    path: '/',
    component: candidate
},
{
    path: '/riur',
    component: riur
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
