<template>
  <q-page class="style">
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'monthly_charge',
          arrayKey: 'monthly_charges'
          }"
            :add_button="
              {
                  label: 'ماهیانه جدید',
                  icon: 'add'
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
                    class="style"
                    outlined
                    placeholder="مبلغ"
                    hint="مبلغ"
                    v-model="monthlyChargeInstance.amount"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="number"
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
      <q-dialog v-model="monthlyChargeAccountsDialog" :persistent="true">
        <card-panel ref="monthlyChargeAccountsRef" title="حساب های ماهیانه" size="50%"
         @on-submit="monthlyChargeInstance.id == null ? addmonthlyCharge() : updatemonthlyCharge()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();monthlyChargeInfoDialog=false;">

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
// {
//   name: 'select',
//   field: 'select',
//   label: 'انتخاب',
//   disable_search: true
// },
  {
    name: 'title',
    label: 'عنوان',
    field: 'title',
    disable_search: true,
  },
  {
    name: 'amount',
    label: 'مبلغ',
    field: 'amount',
    disable_search: true,
  },
  {
    name: 'year',
    label: 'سال',
    field: 'year',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ ایجاد',
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
              title: 'مشاهده/ویرایش',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-monthlyCharge'
            },
            {
              title: ' حساب ها',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-accounts-monthlyCharge'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-monthlyCharge'
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
