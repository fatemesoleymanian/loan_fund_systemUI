<template>
  //سرچ و فیلتر
  <q-page class="style">
    <div class="row justify-center text-black h2">تراکنش ها</div>
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'transaction',
          arrayKey: 'transactions'
          }"
            :extra_buttons="[
              {
                label: 'پرداخت ماهیانه',
                emit: 'on-monthlycharge-payment',
                icon: 'payments'
              },
              {
                label: 'پرداخت قسط',
                emit: 'on-installment-payment',
                icon: 'payments'
              },
              {
                label: 'پرداخت وام',
                emit: 'on-loan-payment',
                icon: 'payments'
              },
              {
                label: 'پرداخت کارمزد',
                emit: 'on-fee-payment',
                icon: 'payments'
              }
              // {
              //   label: 'پرداخت جریمه',
              //   emit: 'on-penalty-payment',
              //   icon: 'payments'
              // },
            ]"
          @on-fee-payment="resetValues();transactionInstance.type='پرداخت کارمزد';transactionInstance.description='پرداخت کارمزد وام ';transactionInfoDialog=true;"
          @on-loan-payment="resetValues();transactionInstance.type='پرداخت وام';transactionInstance.description=`پرداخت `;transactionInfoDialog=true;"
          @on-installment-payment="resetValues();transactionInstance.type='پرداخت قسط';transactionInstance.description=`پرداخت قسط وام `;transactionInfoDialog=true;"
          @on-monthlycharge-payment="resetValues();transactionInstance.type='پرداخت ماهیانه';transactionInstance.description=`پرداخت ماهیانه ${monthName} `;transactionInfoDialog=true;"
          @on-view-transaction="transactionDetails=$event;viewTransactionDialog=true"
          :columns="columns">
          <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
              <template v-slot:row-account_number="{ row }">
                <div class="h5">{{row.account != null ? row.account.account_number : '' }}</div>
              </template>
              <template v-slot:row-member_name="{ row }">
                <div class="h5">{{ row.account != null ? row.account.member_name : '' }}</div>
              </template>
              <template v-slot:row-fund_account="{ row }">
                <div class="h5">{{row.fund_account != null ? row.fund_account.name : '' }}</div>
              </template>
          </CustomeTable>

      <q-dialog v-model="transactionInfoDialog" :persistent="true">
        <card-panel ref="transactionInfoDialogRef" :title="transactionInstance.type" size="50%"
         @on-submit="addtransaction"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();transactionInfoDialog=false;">

          <template #body>
            <div class="row items-center">
              <div class="col-12">
                موجودی حساب : {{ accountInstance.balance }} ریال
              </div>
                <div class="col-12 col-sm-6">
                <SelectionInput
                :option-list="accounts"
                label="انتخاب حساب"
                @on-update-model="transactionInstance.account_id=$event.value;getExtraInfo()"/>
                </div>
                <div class="col-12 col-sm-6">
                  <SelectionInput
                :option-list="fundAccounts"
                label="انتخاب صندوق"
                @on-update-model="transactionInstance.fund_account_id=$event.value"/>
                </div>
                <div class="col-12" v-if="accountInstance.monthlyCharges != null">
                  <div class="q-pa-md">
                    ماهیانه : {{ accountInstance.monthlyCharges.title }}<br>
                  مبلغ : {{ accountInstance.monthlyCharges.amount }} ریال
                  </div>
                </div>
                <div class="col-12 col-sm-6" v-if="accountInstance.loan != null">
                  <div class="q-pa-md">
                    وام : {{ accountInstance.loan.type }}<br>
                  مبلغ وام: {{ accountInstance.loan.principal_amount }} ریال<br>
                  تعداد اقساط : {{ accountInstance.loan.number_of_installments }}<br>
                  مبلغ قسط : {{ transactionInstance.amount }} ریال

                  </div>
                </div>
                <div class="col-12 col-sm-6" v-if="accountInstance.loan_details != null">
                  <div class="q-pa-md">
                  مانده وام: {{ accountInstance.loan_details.remained_amount }} ریال<br>
                  پرداخت شده : {{ accountInstance.loan_details.paid_amount }} ریال
                  </div>
                </div>
                <div v-if="no_loan_sentence">هیچ وامی به این حساب اعطا نشده!</div>
                <div class="col-12" v-if="accountInstance.installments.length>1">
                  اقساط وام :
                  <li v-for="(i,index) in accountInstance.installments" :key="i">
                    <q-icon v-if="accountInstance.transactioNTable.rows.length == index" name="file_download_done" color="positive"/>
                    <span :class="`${accountInstance.transactioNTable.rows.length == index ? 'text-italic text-bold ':''}${accountInstance.transactioNTable.rows.length > index ? ' text-strike':''}`">
                      {{ i.inst_number }} - تاریخ سررسید : {{ i.due_date }}
                    </span>
                  </li>
                </div>
                <div class="col-12 q-pa-sm row" v-if="accountInstance.unpaidLoan.length>0">
                  <div class="col-6 q-pa-sm" :style="`border: 1px solid ${this.transactionInstance.loan_id == loan.id ?'green;':'rgba(0, 0, 0, 0.12);'}`" v-for="loan in accountInstance.unpaidLoan" :key="loan"
                  @click="chooseUnpaidLoan(loan)" >
                    وام : {{ loan.type }}<br>
                  مبلغ وام: {{ loan.principal_amount }} ریال<br>
                    تاریخ صدور : {{ loan.issue_date }}
                  </div>
                </div>
                <div v-else class="col-12">وام پرداخت نشده ای وجود ندارد!</div>

                <div class="col-12 q-pa-sm q-pb-md" v-if="accountInstance.transactioNTable.rows.length>0">
                  {{ transactionInstance.type }} ها
                  <SimpleTable :init_rows="accountInstance.transactioNTable.rows" :init_columns="accountInstance.transactioNTable.columns"/>
                </div>

                <div v-if="accountInstance.fee != null">
                  <div class="q-pa-md">
                    وام : {{ accountInstance.quickLoan.type }}<br>
                  مبلغ وام: {{ accountInstance.quickLoan.principal_amount }} ریال<br>
                 کارمزد وام : {{ accountInstance.fee }} درصد -- {{ transactionInstance.amount }} ریال

                  </div>
                </div>
                <div v-else class="col-12">تراکنشی وجود ندارد!</div>

                <div class="col-12">
                  <q-input dense
                type="textarea"
                class="style"
                outlined
                placeholder="توضیح"
                hint="توضیح"
                v-model="transactionInstance.description"/>
                </div>
              </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="viewTransactionDialog" :persistent="false">
        <card-panel ref="viewTransactionDialoggRef" title="مشاهده تراکنش" size="50%"
         :hide_actions="true">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6 q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                   حساب : {{ transactionDetails.account.member_name }} - {{ transactionDetails.account.account_number }}
                </div>
                <div class="col-12 col-sm-6  q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                  مبلغ : {{ transactionDetails.amount }} ریال
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                  نوع تراکنش : {{ transactionDetails.type }}
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" v-if="transactionDetails.monthly_charge != null"
                 style="border: 1px solid rgba(0, 0, 0, 0.12);">
                   ماهیانه : {{ transactionDetails.monthly_charge.title }}
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" v-if="transactionDetails.installment != null"
                 style="border: 1px solid rgba(0, 0, 0, 0.12);">
                   قسط : {{ transactionDetails.installment.inst_number }}
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                  حساب صندوق : {{ transactionDetails.fund_account.name }}
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                   در تاریخ  : {{ transactionDetails.created_at }}
                </div>
                <div class="col-12 col-sm-6 q-pa-sm" style="border: 1px solid rgba(0, 0, 0, 0.12);">
                   توضیح  : {{ transactionDetails.description }}
                </div>

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
import SelectionInput from 'src/components/SelectionInput.vue';
import { accountsList, fundAccountList } from 'src/helpers/statics';
import { getJalaliDate, persianDateTime } from 'src/helpers/dateOutputs';
import SimpleTable from 'src/components/SimpleTable.vue';
const columns = [
  {
    name: 'account_number',
    label: 'شماره حساب',
    field: 'account_number',
    disable_search: true,
  },
  {
    name: 'member_name',
    label: 'نام حساب',
    field: 'member_name',
    disable_search: true,
  },
  {
    name: 'amount',
    label: 'مبلغ',
    field: 'amount',
    disable_search: true,
  },
  {
    name: 'type',
    label: 'نوع تراکنش',
    field: 'type',
    disable_search: true,
  },
  {
    name: 'fund_account',
    label: 'حساب صندوق',
    field: 'fund_account',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ انجام تراکنش ',
    field: 'created_at',
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
              title: 'جزئیات',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-view-transaction'
            }
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
    const monthName = persianDateTime().getMonthName()
    return {
      year,
      monthName,
      no_loan_sentence:ref(false),
      transactionInstance: ref({
        id: null,
        account_id:null,
        amount:0,
        description: '',
        type: null,
        delay_days:0,
        fund_account_id:null,
        monthly_charge_id:null,
        installment_id:null,
        loan_id:null,
        monthlyCharge:{},
        installment:{},
        account:{},
        fundAccount:{}
      }),
      accountInstance:ref({
        monthlyCharges:null,
        transactioNTable:{
        rows:[],
        columns:[
          {
             label: 'نوع تراکنش'
          },
          {
             label: 'مبلغ'
          },
          {
             label: 'حساب صندوق'
          },
          {
             label: 'تاریخ انجام تراکنش'
          },
        ]
      },
      quickLoan:null,
        loan:null,
        loan_details:null,
        balance:0,
        installments:[],
        unpaidLoan:[],
        fee:null
      }),
      transactionDetails:ref({}),
      transactionInfoDialog: ref(false),
      viewTransactionDialog:ref(false),
      columns,
      accounts:ref([]),
      fundAccounts:ref([])
    }
  },
  data(){

    },
  methods:{
    chooseUnpaidLoan(loan){
      this.transactionInstance.loan_id = loan.id
      this.transactionInstance.amount = loan.principal_amount
      this.transactionInstance.description = 'پرداخت '+loan.type + ` به مبلغ ${loan.principal_amount}`
    },
    resetValues(){
      this.no_loan_sentence = false
      this.transactionInstance = {
        id: null,
        account_id:null,
        amount:0,
        description: '',
        type: null,
        delay_days:0,
        fund_account_id:null,
        monthly_charge_id:null,
        installment_id:null,
        loan_id:null,
        monthlyCharge:{},
        installment:{},
        account:{},
        fundAccount:{}
      }
      this.accountInstance = {
        monthlyCharges:null,
        transactioNTable:{
        rows:[],
        columns:[
          {
             label: 'نوع تراکنش'
          },
          {
             label: 'مبلغ'
          },
          {
             label: 'حساب صندوق'
          },
          {
             label: 'تاریخ انجام تراکنش'
          },
        ]
      },
      loan_details:null,
      installments:[],
      unpaidLoan:[],
      fee:null,
      quickLoan:null,
      loan:null,
      balance:0
      }
    },
    async onAfterLoaded(rows){
      this.accounts = await accountsList()
      this.fundAccounts = await fundAccountList()
    },
    addtransaction(){
      this.$refs.transactionInfoDialogRef.submit({
        url: 'transaction',
        value : this.transactionInstance
      })
    },
    async getExtraInfo(){
      switch(this.transactionInstance.type){
        case 'پرداخت کارمزد':
          this.getFeeLoan();
          break;
        // case 'پرداخت جریمه':
        //   this.getLoan();
        //   break;
        case 'پرداخت وام':
          this.getUnpaidLoan();
          break;
        case 'پرداخت قسط':
          this.getLoan();
          break;
        case 'پرداخت ماهیانه':
          this.getMonthlyCharges();
          break;
      }
    },
    async getMonthlyCharges(){
      await api.get(`account/monthly_charge/${this.transactionInstance.account_id}`).then( async res=>{
        this.accountInstance.balance = res.data.account.balance
        this.accountInstance.monthlyCharges = res.data.account.monthly_charges.find(item => item.year === this.year.toString())
        this.transactionInstance.amount = this.accountInstance.monthlyCharges.amount
        this.transactionInstance.monthly_charge_id = this.accountInstance.monthlyCharges.id
        await api.get(`transaction/acc/${this.transactionInstance.account_id}/chrg/${this.accountInstance.monthlyCharges.id}`).then(res=>{
          this.accountInstance.transactioNTable.rows = []
          res.data.transactions.forEach(t=>{
        this.accountInstance.transactioNTable.rows.push([
          {
            label:t.type
          },
          {
            label:t.amount
          },
          {
            label:t.fund_account.name
          },
          {
            label:t.created_at
          },
        ])
       })
      })
      })
    },
    async getLoan(){
      await api.get(`account/loan/${this.transactionInstance.account_id}`).then( async res=>{
        this.accountInstance.balance = res.data.account.balance
        this.accountInstance.loan = res.data.account.loans.find(item => item.year === this.year.toString() && item.status)
        this.no_loan_sentence = this.accountInstance.loan == null
        this.accountInstance.loan_details = res.data.account.loan_details.find(item => item.loan_id == this.accountInstance.loan.id)
        this.transactionInstance.amount = this.no_loan_sentence ? 0 :Math.round(Number(this.accountInstance.loan.principal_amount) / Number(this.accountInstance.loan.number_of_installments))

        await api.get(`loan/with_inst/${this.accountInstance.loan.id}`).then(async ress=>{
          this.accountInstance.installments = ress.data.installments
          await api.get(`transaction/acc/${this.transactionInstance.account_id}/loan_inst/${this.accountInstance.loan.id}`).then(res=>{
          this.transactionInstance.description = `پرداخت قسط ${res.data.transactions.length+1} ${this.accountInstance.loan.type}`
          this.transactionInstance.installment_id = this.accountInstance.installments[res.data.transactions.length].id

          this.accountInstance.transactioNTable.rows = []
          res.data.transactions.forEach(t=>{
            this.accountInstance.transactioNTable.rows.push([
              {
                label:t.type
              },
              {
                label:t.amount
              },
              {
                label:t.fund_account.name
              },
              {
                label:t.created_at
              },
            ])
          })
      })
        })
      }).catch(error=>{
          alert(error.response.data.msg)
        })
    },
    async getUnpaidLoan(){
      this.accountInstance.unpaidLoan = []
      await api.get(`account/loan/${this.transactionInstance.account_id}`).then(res=>{
        this.accountInstance.balance = res.data.account.balance
        const loan_ids = res.data.account.loan_details.filter(item => item.paid_by_fund === '0')
        loan_ids.forEach(l=>{
          this.accountInstance.unpaidLoan.push(res.data.account.loans.find(item => item.id == l.loan_id))
        })
      })
    },
    async getFeeLoan(){
      await api.get(`account/loan/${this.transactionInstance.account_id}`).then(res=>{
        this.accountInstance.balance = res.data.account.balance
        const loan = res.data.account.loans.find(item => item.year === this.year.toString() && item.status)
        this.accountInstance.quickLoan = loan
        this.accountInstance.fee = loan.fee
        this.transactionInstance.amount = Math.round((Number(loan.principal_amount) * Number(loan.fee)) / 100)
        this.transactionInstance.description = `پرداخت کارمزد وام ${loan.type} - ${loan.fee} درصد `
      })
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SelectionInput,
    SimpleTable
  }
}
</script>
