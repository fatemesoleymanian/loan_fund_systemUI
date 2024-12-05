<template>
  <q-page class="style">
    <div class="row q-pa-md text-center justify-between">
    <q-input label="شماره حساب" v-model="filter.id"/>
    <q-input label="نام حساب" v-model="filter.id"/>
    <q-input label="تاریخ سررسید" v-model="filter.member_name"/>
    <q-input label="نوع وام" v-model="filter.member_name"/>
    <q-input label="نوع ماهانه " v-model="filter.member_name"/>
    <q-checkbox v-model="filter.is_open" label="پرداخت شده"/>
    <q-checkbox v-model="filter.is_open" label="پرداخت نشده"/>
    <q-checkbox v-model="filter.is_open" label="ماهیانه"/>
    <q-checkbox v-model="filter.is_open" label="قسط"/>

    <q-btn label="جستجو" @click="search" color="primary" size="sm"/>
   </div>
    <div class="row justify-center text-black h2">ماهیانه ها</div>

    <q-btn label="تنظیم ماهیانه" color="primary" outline @click="grantLoan"/>
   <q-btn label="تعریف ماهیانه" color="primary" outline @click="addLoan"/>
   <q-btn label="کارمزد" color="primary" outline @click="addLoan"/>
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'monthly_charge',
          arrayKey: 'monthly_charges'
          }"


          @on-add-button="monthlyChargeInstance={ id: null,amount: 0,year: year,title: ''};monthlyChargeInfoDialog = true"
          @on-delete-monthlyCharge="deletemonthlyCharge"
          @on-edit-monthlyCharge="monthlyChargeInstance=$event;monthlyChargeInfoDialog = true"
          @on-accounts-monthlyCharge="showAccounts"
          :columns="columns">
          <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
          </CustomeTable>

      <q-dialog v-model="monthlyChargeInfoDialog" :persistent="true">
        <card-panel ref="monthlyChargeInfoDialogRef" :title="monthlyChargeInstance.id == null ? 'افزودن ماهیانه جدید':'ویرایش اطلاعات ماهیانه'" size="50%"
         @on-submit="monthlyChargeInstance.id == null ? addmonthlyCharge() : updatemonthlyCharge()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();monthlyChargeInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="عنوان"
                  placeholder="عنوان"
                   v-model="monthlyChargeInstance.title"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="number"
                    min="0"
                    class="style"
                    outlined
                    placeholder="مبلغ"
                    hint="مبلغ"
                    v-model="monthlyChargeInstance.amount"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="number"
                    min="0"
                    class="style"
                    outlined
                    placeholder="سال"
                    hint="سال"
                    v-model="monthlyChargeInstance.year"/>
                </div>

              </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="monthlyChargeAccountsDialog" >
        <card-panel ref="monthlyChargeAccountsRef" title="حساب های ماهیانه" size="50%"
        :hide_actions="true">
          <template #body>
            <div class="row items-center">
              <simple-table :init_rows="accountsTable.rows" :init_columns="accountsTable.columns" />
                <!-- <div class="col-12 col-sm-6" v-for="acc in monthlyChargeInstance.accounts" :key="acc">
                {{ acc.member_name }}
                </div> -->
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
    name: 'title',
    label: 'شماره قسط',
    field: 'title',
    disable_search: true,
  },
  {
    name: 'amount',
    label: 'شماره حساب ',
    field: 'amount',
    disable_search: true,
  },
  {
    name: 'year',
    label: 'عنوان حساب',
    field: 'year',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'شماره وام',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'مبلغ',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'سررسید',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاخیر',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'نوع',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ پرداخت',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'نوع قسط و ماهیانه',
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
              title: 'پرداخت قسط /ماهیانه',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-monthlyCharge'
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
      monthlyChargeInstance: ref({
        id: null,
        amount: 0,
        title: null,
        year:year ,
        accounts:[]
      }),
      year,
      monthlyChargeInfoDialog: ref(false),
      monthlyChargeAccountsDialog: ref(false),
      columns,
    }
  },
  data(){
    return{
      accountsTable:{
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
      }
    }

    },
  methods:{
    onAfterLoaded(rows){
    },
    addmonthlyCharge(){
      this.$refs.monthlyChargeInfoDialogRef.submit({
        url: 'monthly_charge',
        value : this.monthlyChargeInstance
      })
    },
    updatemonthlyCharge(){
      this.$refs.monthlyChargeInfoDialogRef.submit({
        url: 'monthly_charge',
        value : this.monthlyChargeInstance
      },'put')
    },
    async deletemonthlyCharge(monthlyCharge){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف ماهیانه اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('monthly_charge/delete',{id:monthlyCharge.id}).then(res=>{
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
     showAccounts(charge){
      this.monthlyChargeInstance.accounts = charge.accounts
      charge.accounts.forEach(element => {

        this.accountsTable.rows.push([
          {label:element.member_name },
          { label:element.account_number} ,
          {label:element.balance},
          { label:element.status},
          {label:element.created_at}])
      });

      this.monthlyChargeAccountsDialog=true
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SimpleTable
  }
}
</script>
