<template>
    <div class="riur container">
      
        <h1>РИУР</h1>
        <div v-if="noData" class="alert alert-danger" role="alert">
            <b>Нет записей!</b>
        </div>
        <table v-if="riurs !== null" class="table table-hover">
            <thead>
              <tr>
                <th scope="col" v-for="header in headersСandidats" :key="header.id">
                    {{header}}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="riur in riurs" :key="riur.id">
                <td>{{riur.firstName}}</td>
                <td>{{riur.secondName}}</td>
                <td>{{riur.lastName}}</td>
                <td>{{riur.DOB}}</td>
                <td>{{riur.placeBirth}}</td>
                <td>{{riur.placeLive}}</td>
              </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    name:'riur',
    components: {
    },
    props:{},
    data() {
        return{
          headersСandidats: ['Имя', 'Фамилия', 'Отчество', 'Дата рождения', 'Место рождения','Адрес места жительства'],
          riurs:[],
          noData: false
        }
    },
    computed: {},
    methods: {
        async getRiurs(){
            var riur = localStorage.getItem('riur');
            this.riurs = JSON.parse(riur);
            if(this.riurs === null){
                this.noData = true;
            }
            fetch('http://localhost:3000/candidates');
        }
    },
    mounted() {
      this.getRiurs();
    },
    //Изменение title в зависимости от страницы
    watch: {
        $route: {
            immediate: true,
            handler(to) {
                document.title = to.meta.title || 'РИУР';
            }
        },
    }
}
</script>