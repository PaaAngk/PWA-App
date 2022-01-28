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

        <div v-if="noData" class="alert alert-danger" role="alert">
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
                <td><button type="button" class="btn btn-primary" v-on:click="checkInRiur(candidate.id)">Проверить</button></td>
                <td><button type="button" class="btn btn-info" v-on:click="selectCandidateToEdit(candidate.id)">Изменить</button></td>
                <td><button type="button" class="btn btn-danger" v-on:click="deleteCandidatById(candidate.id)">Удалить</button></td>
              </tr>
            </tbody>
        </table>
        
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
            riurs:[],
            idCandidateInEdit:null,
            noData: false
        }
    },
    computed: {},
    methods: {
        //Получение кандидатов
        async getСandidats(){
            await fetch('http://localhost:3000/candidates')
            .then( async response => {
                const data = await response.json();
                
                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                else{
                    
                    if(data.length < 1){
                        this.noData = true;
                    }

                    data.forEach(element => {
                        element.valid = 1;
                    });

                    if(data.length > this.candidates.length){
                        this.candidates = data;
                    }
                    return data;
                }
            })
            .catch(error => {
                this.errorMessage = error;
                if(this.candidates.length < 1){
                    this.noData = false;
                }
                console.error('Error get candidate!', error);
            });
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

            //Изменение на клиенте
            const ids = this.candidates.map(object => {
                return object.id;
            });
            const id = Math.max(...ids)+1;
            this.candidates.push({ secondName:this.secondName, firstName: this.firstName, lastName: this.lastName, DOB: this.DOB, placeBirth: this.placeBirth, placeLive: this.placeLive ,valid : 1, id: id})

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
                this.updateAfterFetch();
                console.error('Error create a new candidate!', error);
            });
        },

        //Удаление кандидата и отлов ошибок при выполнение запроса
        async deleteCandidatById(id) {
            if (id){
                this.candidates = this.candidates.filter(x => {
                    return x.id != id;
                })
                try {
                    await fetch(`http://localhost:3000/candidates/${id}`, { method: "delete" });
                    fetch('http://localhost:3000/candidates');
                } catch (error) {
                    console.error('Error in delete candidate!', error);
                    this.deleteResult = error.message;
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

        //Проверка кандидата сначала по сохранненой РИУР, затем на сервере 
        checkInRiur(id){
            let candidatesCopy = {...this.candidates[this.candidates.findIndex((obj => obj.id == id))]};
            delete candidatesCopy.id;
            delete candidatesCopy.valid;
            let riur = JSON.parse(localStorage.getItem('riur'));
            let notFindInRiur = true;
            
            if(riur !== null){
                for (let indexRiur = 0; indexRiur < riur.length; indexRiur++) {
                    if(this.compareToObj(candidatesCopy, riur[indexRiur])){ 
                        notFindInRiur = false;
                        break;
                    }
                }
            }

            if(notFindInRiur){
                fetch(`http://localhost:3000/riurs?secondName=${candidatesCopy.secondName}&firstName=${candidatesCopy.firstName}&lastName=${candidatesCopy.lastName}&DOB=${candidatesCopy.DOB}&placeBirth=${candidatesCopy.placeBirth}`)
                .then(async response => {
                    let data = await response.json();
                    if (data.length !== 0) {
                        const channel = new BroadcastChannel('sw-messages');
                        channel.postMessage({title: 'updateRiur', body: data});
                    }
                    else{
                        this.candidates[this.candidates.findIndex((obj => obj.id == id))].valid = 0;
                    }
                });
            }
        },

        //Выбор кандидата для редактирование и заполнение формы
        async selectCandidateToEdit(id){
            this.idCandidateInEdit = id;
            let candidate = this.candidates[this.candidates.findIndex((obj => obj.id == id))];
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

            //Изменение на клиенте
            let objIndex = this.candidates.findIndex((obj => obj.id == this.idCandidateInEdit));
            this.candidates[objIndex].lastName = this.lastName ;
            this.candidates[objIndex].firstName = this.firstName; 
            this.candidates[objIndex].secondName = this.secondName;
            this.candidates[objIndex].DOB = this.DOB;
            this.candidates[objIndex].placeBirth = this.placeBirth;
            this.candidates[objIndex].placeLive = this.placeLive;
            this.candidates[objIndex].valid = 1;

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