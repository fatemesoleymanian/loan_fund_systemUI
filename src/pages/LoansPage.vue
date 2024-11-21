<template>
  <q-page class="style">
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

              @on-add-button="loanInstance = {id:null,
            principal_amount: '',
            type: 'وام قرض الحسنه',
            issue_date: null,
            number_of_installments: 0,
            end_date: null,
            status: true,
            year: year,
            due_date: null,
            installments:[],
            intervalDays:1};loanInfoDialog = true"
          @on-delete-loan="deleteloan"
          @on-edit-loan="onEditLoan"
          :columns="columns">
              <template v-slot:row-issue_date="{ row }">
                <div class="h4-5">{{row.issue_date }}</div>
              </template>
              <template v-slot:row-due_date="{ row }">
                <div class="h4-5">{{row.due_date }}</div>
              </template>
              <template v-slot:row-end_date="{ row }">
                <div class="h4-5">{{row.end_date }}</div>
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
                   v-model="loanInstance.number_of_installments"/>
                </div>
                <div class="col-12 col-sm-6" >
                  <q-input type="number" class="style" outlined dense
                  hint="فاصله اقساط"
                  placeholder="فاصله اقساط"
                   v-model="loanInstance.intervalDays"
                   suffix="ماه"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input  class="style" outlined dense
                  hint="تاریخ صدور"
                  placeholder="تاریخ صدور"
                   v-model="loanInstance.issue_date"
                    fill-mask="#"
                   mask="####/##/##"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input class="style" outlined dense
                  hint="تاریخ شروع بازپرداخت"
                  placeholder="تاریخ شروع بازپرداخت"
                   fill-mask="#"
                   mask="####/##/##"
                   v-model="loanInstance.due_date"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input class="style" outlined dense
                  hint="تاریخ پایان"
                  placeholder="تاریخ پایان"
                   fill-mask="#" disable
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
                <div class="col-12 col-sm-6">
                <q-btn label="قسط بندی " unelevated
              color="primary" class="col-6 style col-sm-3" style="max-width: 200px;"
               @click="calculation" />
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
import { getJalaliDate, gregorianToJalali, jalaliToGregorian } from 'src/helpers/dateOutputs';
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
              title: 'اعطای وام',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-apply-to-account'
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
        type: 'وام قرض الحسنه',
        issue_date: null,
        number_of_installments: 0,
        end_date: null,
        status: true,
        year: year,
        due_date: null,
        installments:[],
        intervalDays:1
      }),
      year,
      loanInfoDialog: ref(false),
      columns,
      showInstallments:ref(false),
      installmentTable:ref({
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
      })
    }
  },
  data(){
    },
  methods:{
    onEditLoan(event){
      this.loanInstance=event
      this.loanInstance.status === '1' ? this.loanInstance.status=true : this.loanInstance.status=false
      this.doPartition(false)
      this.showInstallments = true
      this.loanInfoDialog = true
    },
    onAfterLoaded(rows){
    },
    calculation(){
      if (this.loanInstance.number_of_installments !=0 && this.loanInstance.due_date != null){
        this.showInstallments = false
        this.installmentTable.rows = []
        this.loanInstance.installments = []
        this.loanInstance.installments.length = 0
        this.calculateInstallmentDates(this.loanInstance.due_date,this.loanInstance.number_of_installments,this.loanInstance.intervalDays*30)
      }
    },
    doPartition(showingDate=true){
      this.installmentTable.rows = []
      this.loanInstance.installments.forEach(element=>{
        this.installmentTable.rows.push([
          {label:element.inst_number },
          { label:element.amount_due} ,
          {label: showingDate ? element.date : element.due_date}])
      })
      this.showInstallments = true
    },
    addloan(){
      this.loanInstance.due_date = jalaliToGregorian(this.loanInstance.due_date.replaceAll('/','-'))
      this.loanInstance.end_date = jalaliToGregorian(this.loanInstance.end_date.replaceAll('/','-'))
      this.loanInstance.issue_date = jalaliToGregorian(this.loanInstance.issue_date.replaceAll('/','-'))
      this.$refs.loanInfoDialogRef.submit({
        url: 'loan',
        value : this.loanInstance
      })
      this.loanInstance.installments.length = 0
    },
    updateloan(){
      this.loanInstance.due_date = jalaliToGregorian(this.loanInstance.due_date.replaceAll('/','-'))
      this.loanInstance.end_date = jalaliToGregorian(this.loanInstance.end_date.replaceAll('/','-'))
      this.loanInstance.issue_date = jalaliToGregorian(this.loanInstance.issue_date.replaceAll('/','-'))
      // console.log(this.loanInstance)
      this.$refs.loanInfoDialogRef.submit({
        url: 'loan',
        value : this.loanInstance
      },'put')
      // this.loanInstance.installments.length = 0

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
    const startDate = new Date(jalaliToGregorian(dueDate.replaceAll('/','-')))
    const amount = Number(this.loanInstance.principal_amount) / Number(this.loanInstance.number_of_installments)

    for (let i = 0; i < numberOfInstallments; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i * intervalDays); // Increment by intervalDays
        installmentDates.push({
          miladi:nextDate.toISOString().split('T')[0],
          shamsi:gregorianToJalali(nextDate.toISOString().split('T')[0]).replaceAll('-','/')
          });

    }
    installmentDates.forEach((inst,index)=>{
      this.loanInstance.installments.push({
          due_date:inst.miladi,
          date:inst.shamsi,
          amount_due:Math.round(amount),
          inst_number:`قسط شماره ${index+1} `
        })
    })
    this.loanInstance.end_date = installmentDates[this.loanInstance.number_of_installments-1].shamsi
    setTimeout(()=>{this.doPartition()},2000)
}
  },
  components:{
    CustomeTable,
    CardPanel,
    SimpleTable
  }
}
</script>
