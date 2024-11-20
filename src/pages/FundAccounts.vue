<template>
  <q-page class="style">
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'fund_account',
          arrayKey: 'fund_accounts'
          }"
            :add_button="
              {
                  label: 'حساب صندوق جدید',
                  icon: 'add'
              }"

          @on-add-button="accountInstance={ id: null,balance: 0,account_number: null,name: '',type: 'قرض الحسنه'};balance_change=0;fundAccountInfoDialog = true"
          @on-delete-fundAccount="deletefundAccount"
          @on-edit-fundAccount="accountInstance=$event;fundAccountInfoDialog = true"
          :columns="columns">
          <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
          </CustomeTable>

      <q-dialog v-model="fundAccountInfoDialog" :persistent="true">
        <card-panel ref="fundAccountInfoDialogRef" :title="accountInstance.id == null ? 'افزودن حساب صندوق جدید':'ویرایش اطلاعات حساب صندوق'" size="50%"
         @on-submit="accountInstance.id == null ? addfundAccount() : updatefundAccount()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();fundAccountInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام حساب"
                  placeholder="نام حساب"
                   v-model="accountInstance.name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="text"
                    class="style"
                    outlined
                    placeholder="شماره حساب"
                    hint="شماره حساب"
                    v-model="accountInstance.account_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  موجودی : {{ accountInstance.balance }}
                  <q-input dense
                    type="number"
                    class="style"
                    outlined
                    placeholder="واریز "
                    hint="واریز "
                    v-model="balance_change"/>
                    <q-btn label="واریز" color="primary"
                     @click="accountInstance.balance = parseInt(accountInstance.balance) + parseInt(balance_change)"/>
                </div>
                <div class="col-12 col-sm-6" style="margin-top: -20px;">
                  <SelectionInput dense
                    :option-list="accountTypes"
                    @on-update-model="accountInstance.type=$event.label"
                    :value="accountInstance.type"
                    label="نوع حساب" />
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
import { fundAccTypeList } from 'src/helpers/statics';
import SelectionInput from 'src/components/SelectionInput.vue';
const columns = [
// {
//   name: 'select',
//   field: 'select',
//   label: 'انتخاب',
//   disable_search: true
// },
  {
    name: 'account_number',
    label: 'شماره حساب',
    field: 'account_number',
    disable_search: true,
  },
  {
    name: 'name',
    label: 'نام',
    field: 'name',
    disable_search: true,
  },
  {
    name: 'balance',
    label: 'موجودی',
    field: 'balance',
    disable_search: true,
  },
  {
    name: 'type',
    label: 'نوع حساب',
    field: 'type',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ افتتاح حساب ',
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
              emit: 'on-edit-fundAccount'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-fundAccount'
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
    return {
      accountInstance: ref({
        id: null,
        balance: 0,
        account_number: null,
        name: '',
        type: 'قرض الحسنه'
      }),
      fundAccountInfoDialog: ref(false),
      columns,
      balance_change:ref(0),
      accountTypes:ref([])
    }
  },
  data(){

    },
  methods:{
    onAfterLoaded(rows){
      this.accountTypes = fundAccTypeList
    },
    addfundAccount(){
      this.$refs.fundAccountInfoDialogRef.submit({
        url: 'fund_account',
        value : this.accountInstance
      })
    },
    updatefundAccount(){
      this.$refs.fundAccountInfoDialogRef.submit({
        url: 'fund_account',
        value : this.accountInstance
      },'put')
    },
    async deletefundAccount(fundAccount){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف حساب صندوق اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('fund_account/delete',{id:fundAccount.id}).then(res=>{
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
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
