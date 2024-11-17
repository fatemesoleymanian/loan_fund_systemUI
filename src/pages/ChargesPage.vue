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
          @on-accounts-monthlyCharge="monthlyChargeInstance.accounts = $event.accounts;monthlyChargeAccountsDialog=true;"
          :columns="columns"/>

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
                <div class="col-12 col-sm-6" v-for="acc in monthlyChargeInstance.accounts" :key="acc">
                {{ acc.member_name }}
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
import { getJalaliDate } from 'src/helpers/dateOutputs';
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
    // async showAccounts(){
    //   await api.get()
    // }
  },
  components:{
    CustomeTable,
    CardPanel
  }
}
</script>
