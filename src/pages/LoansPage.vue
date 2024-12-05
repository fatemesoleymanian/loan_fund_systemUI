<template>
  <q-page class="style">
    //زمان اعطای وام چک کن ببینوام و قسط پرداخت نشده اگه داره اطلاع بده
    <div class="row q-pa-md text-center justify-between">
    <q-input label="شماره حساب" v-model="filter.id"/>
    <q-input label="نام حساب" v-model="filter.id"/>
    <q-input label="تاریخ وام" v-model="filter.member_name"/>
    <q-input label="نوع وام" v-model="filter.member_name"/>
    <q-input label="مبلغ وام" v-model="filter.member_name"/>
    <q-btn label="جستجو" @click="search" color="primary" size="sm"/>
   </div>
   <div class="row justify-center text-black h2">وام ها</div>
   <q-btn label="اعطای وام" color="primary" outline @click="grantLoan"/>
   <q-btn label="تعریف انواع وام" color="primary" outline @click="addLoan"/>
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'loan',
          arrayKey: 'loans'
          }"

              @on-add-button="loanInstance = {id:null,
            principal_amount: '',
            type: 'وام قرض الحسنه',
            issue_date: null,
            number_of_installments: 0,
            fee:4,
            end_date: null,
            status: true,
            year: year,
            due_date: null,
            installments:[],
            intervalDays:1};loanInfoDialog = true"
          @on-delete-loan="deleteloan"
          @on-edit-installments="onEditInstallments"
          @on-show-installments="getInstallments"
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
            مجموع مانده وام :
            مجموع مبلغ وام:

      <q-dialog v-model="loanInfoDialog" :persistent="true">
        <card-panel ref="loanInfoDialogRef" :title="loanInstance.id == null ? 'افزودن وام جدید':'ویرایش اطلاعات وام'" size="50%"
         @on-submit="loanInstance.id == null ? addloan() : updateloan()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();loanInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense
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
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="تعداد اقساط"
                  placeholder="تعداد اقساط"
                   v-model="loanInstance.number_of_installments"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="کارمزد" style="display: inline-block;max-width: 150px;"
                  placeholder="کارمزد"
                   v-model="loanInstance.fee"/>
                   <span class="q-px-sm">{{ Math.round((Number(loanInstance.principal_amount) * 4) / 100) }} ریال </span>
                </div>
                <div class="col-12 col-sm-6" >
                  <q-input type="number" min="0" class="style" outlined dense
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
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="سال"
                  placeholder="سال"
                   v-model="loanInstance.year"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-toggle v-model="loanInstance.status" label="وضعیت"/>
                  <q-btn label="قسط بندی " unelevated outline
              color="primary" class="style" style="margin-left: auto;"
               @click="calculation" />
                </div>
              </div>
              <div v-if="showInstallments" class="row items-center">
                <simple-table :init_rows="installmentTable.rows" :init_columns="installmentTable.columns" />
              </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="showAccsDialog">
        <card-panel ref="showAccsDialogRef" title="حساب ها " size="50%" :hide_actions="true">
          <template #body>
            <div class="row items-center">
              <simple-table v-if="accountsTable.rows.length>0" :init_rows="accountsTable.rows" :init_columns="accountsTable.columns" />
                <div v-else>حسابی پیدا نشد!</div>
              </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="appliedAccsDialog" :persistent="true">
        <card-panel ref="appliedAccsDialogRef" title="اعطای وام" size="50%"
         @on-submit="applyLoanToAccounts"
         :disableNotify="false"
        @on-success="appliedAccsDialog=false;">
          <template #body>
            <div class="row items-center">
                <div class="col-12">
                  <SelectionInput
                    :option-list="accounts"
                     multible
                     :value="this.accountsInstance.account_ids"
                    @on-update-model="updateAccounts"
                    label="حساب (ها)" />
                </div>
              </div>
              <div class="row items-center">
              <simple-table v-if="accountsTable.rows.length>0" :init_rows="accountsTable.rows" :init_columns="accountsTable.columns" />
                <div v-else>حسابی پیدا نشد!</div>
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
import SelectionInput from 'src/components/SelectionInput.vue';
import { accountsList } from 'src/helpers/statics';
const columns = [
  {
    name: 'id',
    label: 'شماره وام',
    field: 'id',
    disable_search: true,
  },
  {
    name: 'id',
    label: 'شماره حساب',
    field: 'id',
    disable_search: true,
  },
  {
    name: 'type',
    label: ' ناام',
    field: 'type',
    disable_search: true,
  },
  {
    name: 'principal_amount',
    label: 'تاریخ وام',
    field: 'principal_amount',
    disable_search: true,
  },
  {
    name: 'principal_amount',
    label: 'مانده وام',
    field: 'principal_amount',
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
    label: 'پرداخت شده',
    field: 'issue_date',
    disable_search: true,
  },
  {
    name: 'principal_amount',
    label: 'توضیحات',
    field: 'principal_amount',
    disable_search: true,
  },
  {
    name: 'principal_amount',
    label: 'مبلغ پرداخت شده',
    field: 'principal_amount',
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
              title: 'اقساط این وام',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-show-installments'
            },
            {
              title: 'ویرایش اقساط',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-edit-installments'
            },
            {
              title: 'حذف وام',
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
      filter:ref({

}),
searchQuery:ref(''),
      loanInstance: ref({
        id:null,
        principal_amount: '',
        type: 'وام قرض الحسنه',
        issue_date: null,
        number_of_installments: 0,
        fee:4,
        end_date: null,
        status: true,
        year: year,
        due_date: null,
        installments:[],
        intervalDays:1
      }),
      accountsInstance:ref({
        loan_id:null,
        account_ids:[],
        remained_amount:0,
        paid_amount:0
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
      }),
      appliedAccsDialog:ref(false),
      accounts:ref([]),
      accountsTable:ref({
        rows:[],
        columns:[
          {
            label: 'نام حساب'
          },
          {
            label: 'شماره حساب'
          },
          {
            label: 'موجودی حساب'
          },
          {
            label: 'وضعیت حساب'
          },
          {
            label: 'تاریخ عضویت حساب'
          }
        ]
      })
    }
  },
  data(){

    },
  methods:{
    search(){

    },
    onEditLoan(event){
      this.loanInstance=event
      this.loanInstance.status === '1' ? this.loanInstance.status=true : this.loanInstance.status=false
      this.doPartition(false)
      this.showInstallments = true
      this.loanInfoDialog = true
    },
    async onAfterLoaded(rows){
      this.accounts = await accountsList()
    },
    // calculation(){
    //   if (this.loanInstance.number_of_installments !=0 && this.loanInstance.due_date != null){
    //     this.showInstallments = false
    //     this.installmentTable.rows = []
    //     this.loanInstance.installments = []
    //     this.loanInstance.installments.length = 0
    //     this.calculateInstallmentDates(this.loanInstance.due_date,this.loanInstance.number_of_installments,this.loanInstance.intervalDays*30)
    //   }
    // },
    // doPartition(showingDate=true){
    //   this.installmentTable.rows = []
    //   this.loanInstance.installments.forEach(element=>{
    //     this.installmentTable.rows.push([
    //       {label:element.inst_number },
    //       { label:element.amount_due} ,
    //       {label: showingDate ? element.date : element.due_date}])
    //   })
    //   this.showInstallments = true
    // },
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
    // updateloan(){
    //   this.loanInstance.due_date = jalaliToGregorian(this.loanInstance.due_date.replaceAll('/','-'))
    //   this.loanInstance.end_date = jalaliToGregorian(this.loanInstance.end_date.replaceAll('/','-'))
    //   this.loanInstance.issue_date = jalaliToGregorian(this.loanInstance.issue_date.replaceAll('/','-'))
    //   this.$refs.loanInfoDialogRef.submit({
    //     url: 'loan',
    //     value : this.loanInstance
    //   },'put')
    //   // this.loanInstance.installments.length = 0

    // },
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
    onEditInstallments(){

    },
    getInstallments(){

    },
    grantLoan(){

    },
//     calculateInstallmentDates(dueDate, numberOfInstallments, intervalDays=30) {
//     const installmentDates = [];
//     const startDate = new Date(jalaliToGregorian(dueDate.replaceAll('/','-')))
//     const amount = Number(this.loanInstance.principal_amount) / Number(this.loanInstance.number_of_installments)

//     for (let i = 0; i < numberOfInstallments; i++) {
//         const nextDate = new Date(startDate);
//         nextDate.setDate(startDate.getDate() + i * intervalDays); // Increment by intervalDays
//         installmentDates.push({
//           miladi:nextDate.toISOString().split('T')[0],
//           shamsi:gregorianToJalali(nextDate.toISOString().split('T')[0]).replaceAll('-','/')
//           });

//     }
//     installmentDates.forEach((inst,index)=>{
//       this.loanInstance.installments.push({
//           due_date:inst.miladi,
//           date:inst.shamsi,
//           amount_due:Math.round(amount),
//           inst_number:`قسط شماره ${index+1} `
//         })
//     })
//     this.loanInstance.end_date = installmentDates[this.loanInstance.number_of_installments-1].shamsi
//     setTimeout(()=>{this.doPartition()},2000)
// },
//     async showAccounts(loan){
//       this.accountsInstance.loan_id = loan.id
//       this.loanInstance.principal_amount = loan.principal_amount
//       this.accountsTable.rows = []
//       await api.get(`loan/${loan.id}`).then(res=>{
//         res.data.loan.accounts.forEach(acc=>{
//           this.accountsInstance.account_ids.push({value:acc.id , label:acc.member_name + ' - '+acc.account_number,data:acc})
//           this.accountsTable.rows.push([
//           {label:acc.member_name },
//           {label:acc.account_number },
//           {label:acc.balance },
//           {label:acc.status },
//           {label:acc.created_at },
//           ])
//         })
//         this.appliedAccsDialog = true
//       }).catch(error=>{
//         alert(error.response.data.msg)
//       })
//     },
//     updateAccounts(account){
//       this.accountsInstance.account_ids = account
//       this.accountsTable.rows = []
//       this.accountsTable.rows.length = 0
//       setTimeout(() => {
//         this.accountsInstance.account_ids.forEach(acc=>{
//         this.accountsTable.rows.push([
//         {label:acc.data.member_name },
//           {label:acc.data.account_number },
//           {label:acc.data.balance },
//           {label:acc.data.status },
//           {label:acc.data.created_at },
//         ])
//       })
//       }, 1)
//     },
//     async applyLoanToAccounts(){
//       this.accountsInstance.remained_amount = this.loanInstance.principal_amount
//       this.$refs.appliedAccsDialogRef.submit({
//         url: 'loan_acc_details',
//         value : this.accountsInstance
//       })
//     }
  },
  components:{
    CustomeTable,
    CardPanel,
    SimpleTable,
    SelectionInput
  }
}
</script>
