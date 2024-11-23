<template>
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
                label: 'پرداخت جریمه',
                emit: 'on-penalty-payment',
                icon: 'payments'
              },
              {
                label: 'پرداخت کارمزد',
                emit: 'on-fee-payment',
                icon: 'payments'
              },
            ]"

          @on-fee-payment="transactionInstance.type='پرداخت کارمزد';transactionInfoDialog=true;"
          @on-penalty-payment="transactionInstance.type='پرداخت جریمه'"
          @on-loan-payment="transactionInstance.type='پرداخت وام'"
          @on-installment-payment="transactionInstance.type='پرداخت قسط'"
          @on-monthlycharge-payment="transactionInstance.type='پرداخت ماهیانه';transactionInfoDialog=true;"
          @on-edit-transaction="transactionInstance=$event"
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
        <card-panel ref="transactionInfoDialogRef" title="افزودن تراکنش جدید" size="50%"
         @on-submit="addtransaction"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();transactionInfoDialog=false;">

          <template #body>
            <div class="row items-center">
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
                <div class="col-12 col-sm-6" v-if="accountInstance.monthlyCharges">
                  ماهیانه : {{ accountInstance.monthlyCharges.title }}
                  مبلغ : {{ accountInstance.monthlyCharges.amount }} ریال
                </div>
                <div class="col-12 col-sm-6" v-if="accountInstance.transactioNTable.rows.length>0">
                  تراکنش های اخیر
                  <SimpleTable :init_rows="accountInstance.transactioNTable.rows" :init_columns="accountInstance.transactioNTable.columns"/>
                </div>
                <div class="col-12 col-sm-6" v-if="accountInstance.transactioNTable.rows.length>0">
                  <q-input dense
                type="textarea" disable
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
  </q-page>
</template>

<script>
import { ref } from 'vue';
import CustomeTable from 'src/components/CustomeTable.vue';
import { api } from 'src/boot/axios';
import CardPanel from 'src/components/CardPanel.vue';
import SelectionInput from 'src/components/SelectionInput.vue';
import { accountsList, fundAccountList } from 'src/helpers/statics';
import { getJalaliDate } from 'src/helpers/dateOutputs';
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
              emit: 'on-edit-transaction'
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
    return {
      year,
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
        monthlyCharge:{},
        installment:{},
        account:{},
        fundAccount:{}
      }),
      accountInstance:ref({
        monthlyCharges:{},
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
        loan:{},
      }),

      transactionInfoDialog: ref(false),
      columns,
      accounts:ref([]),
      fundAccounts:ref([])
    }
  },
  data(){

    },
  methods:{
    async onAfterLoaded(rows){
      this.accounts = await accountsList()
      this.fundAccounts = await fundAccountList()
    },
    addtransaction(){
      console.log(this.transactionInstance)
      this.$refs.transactionInfoDialogRef.submit({
        url: 'transaction',
        value : this.transactionInstance
      })
    },
    updatetransaction(){
      this.$refs.transactionInfoDialogRef.submit({
        url: 'transaction',
        value : this.transactionInstance
      },'put')
    },
    async deletetransaction(transaction){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف تراکنش اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('transaction/delete',{id:transaction.id}).then(res=>{
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
    async getExtraInfo(){
      switch(this.transactionInstance.type){
        case 'پرداخت کارمزد':
          this.getLoan();
          break;
        case 'پرداخت جریمه':
          this.getLoan();
          break;
        case 'پرداخت وام':
          this.getLoan();
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
      alert(this.year)
      await api.get(`account/monthly_charge/${this.transactionInstance.account_id}`).then( async res=>{
        this.accountInstance.monthlyCharges = res.data.account.monthly_charges.find(item => item.year === this.year.toString())
        this.transactionInstance.amount = this.accountInstance.monthlyCharges.amount
        this.transactionInstance.monthly_charge_id = this.accountInstance.monthlyCharges.id
        await api.get(`transaction/acc/${this.transactionInstance.account_id}/chrg/${this.accountInstance.monthlyCharges.id}`).then(res=>{
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
            label:t.type.created_at
          },
        ])
       })
      })
      })
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SelectionInput
  }
}
</script>
