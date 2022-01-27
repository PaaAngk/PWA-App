<template>
    <div class="mobile-voter container-fluid">
        <h1>Мобильный избиратель</h1>
        <div v-if="noData" class="alert alert-danger" role="alert">
            <b>Данные не загружены!</b>
        </div>
        <table v-else class="table table-hover">
            <thead>
              <tr>
                <th scope="col" v-for="header in headersMV" :key="header.id">
                    {{header}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mobileVoter in mobileVoters" :key="mobileVoter.id">
                  <td v-for="voter in mobileVoter" :key="voter.id">{{voter}}</td>
              </tr>
            </tbody>
        </table> 
    </div>
    
</template>
<script>
export default {
    name:'mobile-voter',
    components: {
    },
    props:{},
    data() {
        return{
          headersMV: [],
          mobileVoters:[],
          noData: false
        }
    },
    computed: {},
    methods: {
        //Получение данных мобильный избератель 
        async getMV(){
          try{
            const response = await fetch('http://localhost:3000/mobileVoter')
            const data = await response.json();
            this.headersMV = Object.keys(data[0]);
            this.mobileVoters = data;
          }
          catch{
            this.noData = true
          }
        }
    },
    mounted() {
      this.getMV();

      const channel = new BroadcastChannel('sw-messages');
      channel.addEventListener('message', event => {         
          if(event.data.title === "MV"){
              this.getMV();
          }
      }); 

    },
    //Изменение title в зависимости от страницы
    watch: {
        $route: {
            immediate: true,
            handler(to) {
                document.title = to.meta.title || 'Мобильный избиратель';
            }
        },
    }
}

</script>
