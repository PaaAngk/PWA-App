<template>
    <div class="main-wrapper">
        <header class="m-auto">
            <nav class="navigation navbar-expand-lg navbar-light bg-light justify-content-center">
                <ul class="nav nav-tabs ">
                    <li class="nav-item active">
                         <router-link to="/" class="nav-link" exact active-class="active">Проверка кандидатов</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/ruir" class="nav-link" exact active-class="active">РУИР</router-link>
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

        }
    },
    computed: {},
    methods: {},
    mounted() {
        
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
</style>