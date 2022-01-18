<template>
    <div class="mobile-voter ">
        <h1>Мобильный избиратель</h1>
        <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col" v-for="header in headersMV" :key="header.id">
                    {{header}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="mobileVoters.length === 0">
                <td>No data</td>
              </tr>
              <tr v-else v-for="mobileVoter in mobileVoters" :key="mobileVoter.id">
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
          mobileVoters:[]
        }
    },
    computed: {},
    methods: {
        //Получение данных мобильный избератель 
        async getMV(){
          const response = await fetch('http://localhost:3000/mobileVoter')
          const data = await response.json();
          this.headersMV = Object.keys(data[0]);
          this.mobileVoters = data;
          
        }
    },
    mounted() {
      this.getMV();
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