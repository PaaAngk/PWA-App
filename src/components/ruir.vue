<template>
    <div class="ruir container">
      
        <h1>РУИР</h1>
        <div v-if="ruirs.length === 0" class="alert alert-danger" role="alert">
            <b>Данные не загружены!</b>
        </div>
        <table v-else class="table table-hover">
            <thead>
              <tr>
                <th scope="col" v-for="header in headersСandidats" :key="header.id">
                    {{header}}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="ruir in ruirs" :key="ruir.id">
                <td>{{ruir.firstName}}</td>
                <td>{{ruir.secondName}}</td>
                <td>{{ruir.lastName}}</td>
                <td>{{ruir.DOB}}</td>
                <td>{{ruir.placeBirth}}</td>
                <td>{{ruir.placeLive}}</td>
              </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    name:'ruir',
    components: {
    },
    props:{},
    data() {
        return{
          headersСandidats: ['Имя', 'Фамилия', 'Отчество', 'Дата рождения', 'Место рождения','Адрес места жительства'],
          ruirs:[]
        }
    },
    computed: {},
    methods: {
        //Получение данных из РУИР
        async getRuirs(){
            const response = await fetch('http://localhost:3000/ruirs');
            const data = await response.json();
            this.ruirs = data;
        }
    },
    mounted() {
      this.getRuirs();
    },
    //Изменение title в зависимости от страницы
    watch: {
        $route: {
            immediate: true,
            handler(to) {
                document.title = to.meta.title || 'РУИР';
            }
        },
    }
}
</script>