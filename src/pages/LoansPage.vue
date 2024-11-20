<template>
  <q-page class="style">
///    کراد وام و اقساطش
   ////، ازکدوم صندوق وام به شخص پرداخت شه اعطای وام
   //سود و کارمزد رو هم باید حساب کنم.
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'loan',
          arrayKey: 'loans'
          }"
            :add_button="
              {
                  label: 'وام جدید',
                  icon: 'add'
              }"

          @on-add-button="loanInstance = { id:null,
              principal_amount: '',
              type: 'قرض الحسنه',
              issue_date: '',
              number_of_installments: 0,
              end_date: '',
              status: true,
              year: 1403,
              due_date: '',
              installments:[]};loanInfoDialog = true"
          @on-delete-loan="deleteloan"
          @on-edit-loan="loanInstance=$event;loanInstance=$event.loan;loanInfoDialog = true"
          :columns="columns">
              <template v-slot:row-issue_date="{ row }">
                <div class="h5">{{row.issue_date }}</div>
              </template>
              <template v-slot:row-due_date="{ row }">
                <div class="h5">{{row.due_date }}</div>
              </template>
              <template v-slot:row-end_date="{ row }">
                <div class="h5">{{row.end_date }}</div>
              </template>
            </CustomeTable>

      <q-dialog v-model="loanInfoDialog" :persistent="true">
        <card-panel ref="loanInfoDialogRef" :title="loanInstance.id == null ? 'افزودن وام جدید':'ویرایش اطلاعات وام'" size="50%"
         @on-submit="loanInstance.id == null ? addloan() : updateloan()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();loanInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="number" class="style" outlined dense
                  hint="مبلغ وام"
                  placeholder="مبلغ وام"
                   v-model="loanInstance.principal_amount"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense
                  hint="نوع وام"
                  placeholder="نوع وام"
                   v-model="loanInstance.type"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="number" class="style" outlined dense
                  hint="تعداد اقساط"
                  placeholder="تعداد اقساط"
                   v-model="loanInstance.number_of_installments"
                   @update:model-value="calculation"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input  class="style" outlined dense
                  hint="تاریخ صدور"
                  placeholder="تاریخ صدور"
                   v-model="loanInstance.issue_date"
                    fill-mask="#"
                   mask="####/##/##"
                    />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input class="style" outlined dense
                  hint="تاریخ شروع بازپرداخت"
                  placeholder="تاریخ شروع بازپرداخت"
                   fill-mask="#"
                   mask="####/##/##"
                   v-model="loanInstance.due_date"
                   @update:model-value="calculation"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input class="style" outlined dense
                  hint="تاریخ پایان"
                  placeholder="تاریخ پایان"
                   fill-mask="#"
                   mask="####/##/##"
                   v-model="loanInstance.end_date"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="number" class="style" outlined dense
                  hint="سال"
                  placeholder="سال"
                   v-model="loanInstance.year"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-toggle v-model="loanInstance.status" label="وضعیت"/>
                </div>
              </div>
              <div v-if="showInstallments" class="row items-center">
                <simple-table :init_rows="installmentTable.rows" :init_columns="installmentTable.columns" />
              </div>
          </template>
        </card-panel>
      </q-dialog>
  </q-page>
</template>

<script>
import { ref } from 'vue';

import CustomeTable from 'src/components/CustomeTable.vue';
import { api } from 'src/boot/axios';
import CardPanel from 'src/components/CardPanel.vue';
import { getJalaliDate } from 'src/helpers/dateOutputs';
import SimpleTable from 'src/components/SimpleTable.vue';
const columns = [
  {
    name: 'id',
    label: 'شماره وام',
    field: 'id',
    disable_search: true,
  },
  {
    name: 'type',
    label: 'نوع وام',
    field: 'type',
    disable_search: true,
  },
  {
    name: 'principal_amount',
    label: 'مبلغ وام',
    field: 'principal_amount',
    disable_search: true,
  },
  {
    name: 'number_of_installments',
    label: 'تعداد اقساط',
    field: 'number_of_installments',
    disable_search: true,
  },
  {
    name: 'issue_date',
    label: 'تاریخ صدور',
    field: 'issue_date',
    disable_search: true,
  },
  {
    name: 'due_date',
    label: 'تاریخ شروع بازپرداخت',
    field: 'due_date',
    disable_search: true,
  },
  {
    name: 'end_date',
    label: 'تاریخ پایان ',
    field: 'end_date',
    disable_search: true,
  },
  {
    name: 'actions',
    field: 'actions',
    disable_search: true,
    label: 'عملیات',
    tools: [
      {
        'q-btn': {
          menu: [
            {
              title: 'مشاهده/ویرایش',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-loan'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-loan'
            },
          ],
          color: 'primary',
          size: 'xs',
          icon: 'more_horiz',
          round: true,
          outline: true
        }

      }
    ]
  }
]
export default {

  setup () {
    const {year , month , day} = getJalaliDate()

    return {
      loanInstance: ref({
        id:null,
        principal_amount: '',
        type: 'قرض الحسنه',
        issue_date: null,
        number_of_installments: 0,
        end_date: null,
        status: true,
        year: year,
        due_date: null,
        installments:[]
      }),
      loanInfoDialog: ref(false),
      columns,
      showInstallments:ref(false)
    }
  },
  data(){
    return{
      installmentTable:{
        rows:[],
        columns:[
        {
            label: 'شماره قسط'
          },
          {
            label: 'مبلغ قسط'
          },
          {
            label: 'تاریخ سررسید قسط'
          }
        ]
      }
    }
    },
  methods:{
    onAfterLoaded(rows){
    },
    calculation(){
      if (this.loanInstance.number_of_installments !=0 && this.loanInstance.due_date != null){
        this.loanInstance.installments = []
        this.calculateInstallmentDates(this.loanInstance.due_date,this.loanInstance.number_of_installments)
      }
    },
    addloan(){
      this.loanInstance.installments.forEach(element=>{
        this.installmentTable.rows.push([
          {label:element.inst_number },
          { label:element.amount_due} ,
          {label:element.due_date}])
      })
      this.showInstallments = true

      // this.$refs.loanInfoDialogRef.submit({
      //   url: 'loan',
      //   value : this.loanInstance
      // })
    },
    async addInstallments(response, method='post'){
      if(method === 'post') this.loanInstance.loan_id = response.loan.id
      await api[method]('loan',{...this.loanInstance}).then(res=>{
        this.loanInfoDialog = false;
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
    },
    updateloan(){
      this.loanInstance.loan_name = this.loanInstance.full_name
      this.loanInstance.loan_id = this.loanInstance.id

      this.$refs.loanInfoDialogRef.submit({
        url: 'loan',
        value : this.loanInstance
      },'put')
    },
    async deleteloan(loan){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف وام اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('loan/delete',{id:loan.id}).then(res=>{
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
    calculateInstallmentDates(dueDate, numberOfInstallments, intervalDays=30) {
    const installmentDates = [];
    const startDate = new Date(dueDate); // Convert due date to a Date object
    const amount = this.loanInstance.principal_amount / this.loanInstance.number_of_installments

    for (let i = 0; i < numberOfInstallments; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i * intervalDays); // Increment by intervalDays
        installmentDates.push(nextDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD

    }
    installmentDates.forEach((inst,index)=>{
      this.loanInstance.installments.push({
          due_date:inst,
          amount_due:amount,
          inst_number:`قسط شماره ${index} `
        })
    })
    this.loanInstance.end_date = installmentDates[this.loanInstance.number_of_installments-1]
}
  },
  components:{
    CustomeTable,
    CardPanel,
    SimpleTable
  }
}
</script>
