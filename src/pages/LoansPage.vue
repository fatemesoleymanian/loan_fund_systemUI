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
   <q-btn label="تعریف انواع وام" color="primary" outline @click="initLoan"/>
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'loan_account',
          arrayKey: 'loans',
          summation: 'amounts'
          }"
            @summation-after-loaded="loanSummation = $event"
              @on-delete-loan="deleteloan"
              @on-edit-installments="onEditInstallments"
              @on-show-installments="getInstallments"
              :columns="columns">
              <template v-slot:row-created_at="{ row }">
                <div class="h4-5">{{row.created_at }}</div>
              </template>
              <template v-slot:row-granted_at="{ row }">
                <div>{{row.amount - row.paid_amount }}</div>
              </template>
            </CustomeTable>
            <div class="q-px-md q-py-sm font-demi-bold row">
              <div class="col-6">
              مجموع مانده وام : {{ loanSummation[1] }}
            </div>
            <div class="col-6">
              مجموع مبلغ وام: {{ loanSummation[0] }}
              </div>
          </div>

      <q-dialog v-model="loanInfoDialog" :persistent="true">
        <card-panel ref="loanInfoDialogRef" :title="loanInstance.id == null ? 'تعریف وام جدید':'ویرایش اطلاعات وام'" size="50%"
         @on-submit="addLoan"
         :disableNotify="false"
        @on-success="loanInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                  <div class="col-12">
                  <q-input type="text" class="style" outlined dense
                  hint="عنوان"
                  placeholder="عنوان"
                   v-model="loanInstance.title"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="تعداد اقساط"
                  placeholder="تعداد اقساط"
                   v-model="loanInstance.number_of_installments"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="درصد کارمزد"
                  placeholder="درصد کارمزد"
                   v-model="loanInstance.fee_percent"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="فاصله اقساط"
                  placeholder="فاصله اقساط"
                   v-model="loanInstance.installment_interval"
                   suffix="روز"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="کارمزد ثابت"
                  placeholder="کارمزد ثابت"
                   v-model="loanInstance.static_fee"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="سقف وام"
                  placeholder="سقف وام"
                   v-model="loanInstance.max_amount"/>
                </div>
                <div class="col-6">
                  <q-input type="number" min="0" class="style" outlined dense
                  hint="حداقل وام"
                  placeholder="حداقل وام"
                   v-model="loanInstance.min_amount"/>
                </div>
              </div>
              <div class="row">
                <div class="col-12 col-sm-6">
                  <q-checkbox label="وام ضروری"  v-model="loanInstance.emergency"/>
                  <q-checkbox label="وام بلاعوض"  v-model="loanInstance.no_need_to_pay"/>
                </div>
              </div>
          </template>
        </card-panel>
        <!-- <q-input class="style" outlined dense
                  hint="تاریخ پایان"
                  placeholder="تاریخ پایان"
                   fill-mask="#" disable
                   mask="####/##/##"
                   v-model="loanInstance.end_date"/> -->
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
    name: 'account_id',
    label: 'شماره حساب',
    field: 'account_id',
    disable_search: true,
  },
  {
    name: 'account_name',
    label: ' نام',
    field: 'account_name',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ وام',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'granted_at',
    label: 'مانده وام',
    field: 'granted_at',
    disable_search: true,
  },
  {
    name: 'amount',
    label: 'مبلغ وام',
    field: 'amount',
    disable_search: true,
  },
  {
    name: 'number_of_installments',
    label: 'تعداد اقساط',
    field: 'number_of_installments',
    disable_search: true,
  },
  {
    name: 'no_of_paid_inst',
    label: 'پرداخت شده',
    field: 'no_of_paid_inst',
    disable_search: true,
  },
  {
    name: 'description',
    label: 'توضیحات',
    field: 'description',
    disable_search: true,
  },
  {
    name: 'paid_amount',
    label: 'مبلغ پرداخت شده',
    field: 'paid_amount',
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
        loanSummation:ref([]),
        filter:ref({}),
        searchQuery:ref(''),
        loanInstance: ref({
        id:null,
        title:'',
        static_fee:0,
        fee_percent:4,
        number_of_installments:5,
        installment_interval:30,
        max_amount:0,
        min_amount:0,
        emergency:false,
        no_need_to_pay:false
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
      accounts:ref([])
    }
  },
  data(){

    },
  methods:{
    search(){

    },
    async onAfterLoaded(rows){
      this.accounts = await accountsList()
    },
    initLoan(){
      this.loanInstance = {
        id:null,
        title:'',
        static_fee:0,
        fee_percent:4,
        number_of_installments:5,
        installment_interval:30,
        max_amount:0,
        min_amount:0,
        emergency:false,
        no_need_to_pay:false
      }
      this.loanInfoDialog = true
    },
    addLoan(){
      alert('f')
      this.$refs.loanInfoDialogRef.submit({
        url: 'loan',
        value : this.loanInstance
      })
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SimpleTable,
    SelectionInput
  }
}
</script>
