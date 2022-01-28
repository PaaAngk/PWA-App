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
                        <router-link to="/riur" class="nav-link" exact active-class="active">РИУР</router-link>
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
            seenOffline: false,
            riurs: []
        }
    },
    computed: {
        
    },
    methods: {
        removeDuplicates(arr) {
            const result = [];
            const duplicatesIndices = [];
            arr.forEach((current, index) => {
                if (duplicatesIndices.includes(index)) return;
                result.push(current);
            
                for (let comparisonIndex = index + 1; comparisonIndex < arr.length; comparisonIndex++) {
                    const comparison = arr[comparisonIndex];
                    const currentKeys = Object.keys(current);
                    const comparisonKeys = Object.keys(comparison);
                    if (currentKeys.length !== comparisonKeys.length) continue;
                    const currentKeysString = currentKeys.sort().join("").toLowerCase();
                    const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();
                    if (currentKeysString !== comparisonKeysString) continue;
                    let valuesEqual = true;
                    for (let i = 0; i < currentKeys.length; i++) {
                        const key = currentKeys[i];
                        if ( current[key] !== comparison[key] ) {
                            valuesEqual = false;
                            break;
                        }
                    }
                    if (valuesEqual) duplicatesIndices.push(comparisonIndex);
                } 
            });  
            return result;
        }

    },
    mounted() {
        window.addEventListener('offline', () => {
            this.seenOffline = true;
        }); 
        window.addEventListener('online', () => {
            this.seenOffline = false;
        }); 

        const channel = new BroadcastChannel('sw-messages');
        channel.addEventListener('message', event => {         
            if(event.data.title === "updateRiur"){
                let riur = JSON.parse(localStorage.getItem('riur'));
                let riurCheck = event.data.body;
                if(riur === null){
                    riur = riurCheck;
                }
                else{
                    riur = riurCheck.concat(riur);
                }
                let riurs = this.removeDuplicates(riur);
                //console.log(riurs);
                localStorage.setItem('riur', JSON.stringify(riurs));
            }
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