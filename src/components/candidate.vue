<template>
    <div class="candidate container">
        <h1>Проверка кандидатов</h1>
        <form @submit.prevent="newCandidate">
          <div class="input-group mb-3">
              <span class="input-group-text">ФИО</span>
              <input v-model="secondName" class="form-control" placeholder="Фамилия" />
              <input v-model="firstName" class="form-control" placeholder="Имя" />
              <input v-model="lastName" class="form-control" placeholder="Отчество" />
          </div>
          <div class="input-group mb-3">
              <span class="input-group-text">Дата рождения</span>
              <input v-model="DOB" class="form-control" placeholder="Дата рождения в формате: ДД.ММ.ГГГГ" />
          </div>

          <div class="input-group mb-3">
              <span class="input-group-text">Место рождения</span>
              <input v-model="placeBirth" class="form-control" placeholder="Место рождения" />
          </div>

          <div class="input-group mb-2">
              <span class="input-group-text">Адрес места жительства</span>
              <input v-model="placeLive" class="form-control" placeholder="Адрес места жительства" />
          </div>

          <button class="btn btn-primary mb-3 w-25" v-bind:hidden="idCandidateInEdit"  type="submit">Добавить</button>
          <button class="btn btn-info mb-3 w-25" v-bind:hidden="!idCandidateInEdit" @click="editCandidate()" type="button">Изменить</button>
        </form>

        <div v-if="candidates.length === 0" class="alert alert-danger" role="alert">
            <b>Данные не загружены!</b>
        </div>
        <table v-else class="table table-hover">
            <thead>
              <tr>
                <th scope="col" v-for="header in headersСandidats" :key="header.id">
                  {{header}}
                </th>
                <th scope="col" width="10px">
                  
                </th>
                <th scope="col" width="10px">
                  
                </th>
              </tr>
            </thead>
            
            <tbody>
              <tr  v-for="candidate in candidates" v-bind:class="{'table-danger': !candidate.valid }" :key="candidate.id">
                <td>{{candidate.firstName}}</td>
                <td>{{candidate.secondName}}</td>
                <td>{{candidate.lastName}}</td>
                <td>{{candidate.DOB}}</td>
                <td>{{candidate.placeBirth}}</td>
                <td>{{candidate.placeLive}}</td>
                <td><button type="button" class="btn btn-info" v-on:click="selectCandidateToEdit(candidate.id)">Изменить</button></td>
                <td><button type="button" class="btn btn-danger" v-on:click="deleteCandidatById(candidate.id)">Удалить</button></td>
              </tr>
            </tbody>
        </table>
        
        <button v-if="candidates.length !== 0" class="btn btn-primary mb-3 w-25" v-on:click="compareCandidate()" type="submit">Проверить</button>
    </div>
</template>
<script>
export default {
    name:'candidate',
    components: {
        
    },
    props:{},
    data() {
        return{
            lastName:"",
            firstName:"",
            secondName:"",
            DOB:"",
            placeBirth:"",
            placeLive:"",
            headersСandidats: ['Имя', 'Фамилия', 'Отчество', 'Дата рождения', 'Место рождения','Адрес места жительства'],
            candidates: [],
            ruirs:[],
            idCandidateInEdit:null
        }
    },
    computed: {},
    methods: {
        //Получение кандидатов
        async getСandidats(){
            await fetch('http://localhost:3000/candidates')
            .then(async response => {
                const data = await response.json();
                
                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                else{
                    data.forEach(element => {
                        element.valid = 1;
                    });
                    this.candidates = data;
                    return data;
                }
            })
            .catch(error => {
                this.errorMessage = error;
                console.error('Error get candidate!', error);
            });   
        },

        //Получение кандидата по id
        async getСandidate(id){
            const response = await fetch(`http://localhost:3000/candidates/${id}`);
            const data = await response.json();
            return data;
        },

        //Получение данных из РУИР
        async getRuirs(){
            const response = await fetch('http://localhost:3000/ruirs');
            const data = await response.json();
            this.ruirs = data;
        },

        // Добавлние нового кандидата, проверка заполненности полей и отлов ошибок при выполнение запроса
        async newCandidate(){
            //Проверка заполнения формы
            if(this.lastName == '' || this.firstName== '' || this.secondName == '' || this.DOB == '' || this.placeBirth == '' || this.placeLive == ''){
                alert('Заполните все поля');
                return null;
            }

            //Провера даты, ввод только через точку
            let regexp =/ ^(?:(?:31(\||.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\||.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/||\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\||\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g ;
            let matchAll = this.DOB.match(regexp);       
            if(!matchAll){
                alert("Введите корректную дату");
                this.DOB == '';
                return null;
            }
            
            //Отправка данных на сервер
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secondName:this.secondName, firstName: this.firstName, lastName: this.lastName, DOB: this.DOB, placeBirth: this.placeBirth, placeLive: this.placeLive })
            };
            fetch('http://localhost:3000/candidates', requestOptions)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                else{
                    this.updateAfterFetch();
                }
            })
            .catch(error => {
                this.errorMessage = error;
                console.log("Данные сохранены для отправки при появлении сети");
                this.updateAfterFetch();
                //console.error('Error create a new candidate!', error);
            });

        },

        //Удаление кандидата и отлов ошибок при выполнение запроса
        async deleteCandidatById(id) {
            if (id){
                try {
                    await fetch(`http://localhost:3000/candidates/${id}`, { method: "delete" });
                    this.getСandidats();
                } catch (error) {
                    console.error('Error in delete candidate!', error);
                    this.deleteResult = error.message;
                }
            }
        },
    
        //Сравнение кондидатов. Копирование существующих списков, полученых по API. Итерация по списку кандидатов и сравнение с записями в БД РУИР
        compareCandidate(){
            this.getRuirs();
            let candidatesCopy = JSON.parse(JSON.stringify(this.candidates));
            let ruirsCopy = JSON.parse(JSON.stringify(this.ruirs));
            for (let indexCandidate = 0; indexCandidate < candidatesCopy.length; indexCandidate++) {
                delete candidatesCopy[indexCandidate].id;
                delete candidatesCopy[indexCandidate].valid;
                let resultCompare = false;
                for (let indexRuir = 0; indexRuir < ruirsCopy.length; indexRuir++) {
                    if(this.compareToObj(candidatesCopy[indexCandidate], ruirsCopy[indexRuir])){ 
                        resultCompare = true;
                        break; 
                    }
                }
                if(!resultCompare){
                    this.candidates[indexCandidate].valid = 0;
                }
            }
        },

        //Метод сравнение двух объектов по ключам
        compareToObj(object1, object2){
            const keys = Object.keys(object1);
            for (let key of keys) {
                if (object1[key] !== object2[key]) {
                    return false;
                }
            }
            return true;
        },

        //Выбор кандидата для редактирование и заполнение формы
        async selectCandidateToEdit(id){
            this.idCandidateInEdit = id;
            let candidate = await this.getСandidate(id)
            this.lastName = candidate.lastName;
            this.firstName = candidate.firstName; 
            this.secondName = candidate.secondName;
            this.DOB = candidate.DOB;
            this.placeBirth = candidate.placeBirth;
            this.placeLive = candidate.placeLive;
        },

        //Редактирование кандидата
        editCandidate(){
            if(this.lastName == '' || this.firstName== '' || this.secondName == '' || this.DOB == '' || this.placeBirth == '' || this.placeLive == ''){
                alert('Заполните все поля');
                return null;
            }

            //Провера даты, ввод только через точку
            let regexp =/ ^(?:(?:31(\||.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\||.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/||\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\||\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g ;
            let matchAll = this.DOB.match(regexp);       
            if(!matchAll){
                alert("Введите корректную дату");
                this.DOB == '';
                return null;
            }
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secondName:this.secondName, firstName: this.firstName, lastName: this.lastName, DOB: this.DOB, placeBirth: this.placeBirth, placeLive: this.placeLive })
            };
            fetch(`http://localhost:3000/candidates/${this.idCandidateInEdit}`, requestOptions)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    this.idCandidateInEdit = null;
                    return Promise.reject(error);
                }
                else{
                    this.idCandidateInEdit = null;
                    this.updateAfterFetch();
                }
            })
            .catch(error => {
                this.errorMessage = error;
                console.error('Error edit a candidate!', error);
            });
        },

        //Обновление данных и полей после отправки формы
        updateAfterFetch(){
            this.getСandidats();
            this.lastName = '' ;
            this.firstName = ''; 
            this.secondName = '';
            this.DOB = '';
            this.placeBirth = '';
            this.placeLive = '';   
        }
    },
    mounted() {
        this.getСandidats();
        this.getRuirs();
    },
    //Изменение title в зависимости от страницы
    watch: {
        $route: {
            immediate: true,
            handler(to) {
                document.title = to.meta.title || 'Проверка кандидатов';
            }
        },
    }

};
</script>