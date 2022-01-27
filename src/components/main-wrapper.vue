<template>
    <div class="main-wrapper">
        <div v-if="seenOffline" class="alert alert-warning" role="alert">
            <b>Отсутствует сетевое соединение. Все изменения будут синхронизированы после восстановления соединения.</b>
        </div>
        <header class="m-auto">
            <nav class="navigation navbar-expand-lg navbar-light bg-light justify-content-center">
                <ul class="nav nav-tabs ">
                    <li class="nav-item active">
                         <router-link to="/" class="nav-link" exact active-class="active">Проверка кандидатов</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/ruir" class="nav-link" exact active-class="active">РИУР</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/mobile-voter" class="nav-link" exact active-class="active">Мобильный избиратель</router-link>
                    </li>
                </ul>
            </nav>
        </header>
        
        <main class="p-2">
            
            <keep-alive>
                <router-view>
                </router-view>
            </keep-alive>
        </main>
    </div>
</template>
<script>

export default {
    name:'main-wrapper',
    components: {
    },
    props:{},
    data() {
        return{
            seenOffline: false
        }
    },
    computed: {
        
    },
    methods: {
        
    },
    mounted() {
        window.addEventListener('offline', () => {
            this.seenOffline = true;
        }); 
        window.addEventListener('online', () => {
            this.seenOffline = false;
        }); 
    }
}
</script>
<style scoped>
.navigation{
    position: relative;
    display: flex;
    align-items: center;
    padding-top: 0.5rem;
}
.alert {
    margin-bottom: 0;
}
</style>