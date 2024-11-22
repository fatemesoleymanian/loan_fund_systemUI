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

          @on-fee-payment="transactionInstance.type='پرداخت کارمزد'"
          @on-penalty-payment="transactionInstance.type='پرداخت جریمه'"
          @on-loan-payment="transactionInstance.type='پرداخت وام'"
          @on-installment-payment="transactionInstance.type='پرداخت قسط'"
          @on-monthlycharge-payment="transactionInstance.type='پرداخت ماهیانه'"
          @on-edit-transaction="transactionInstance=$event"
          :columns="columns">
          <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
          </CustomeTable>

      <q-dialog v-model="transactionInfoDialog" :persistent="true">
        <card-panel ref="transactionInfoDialogRef" :title="transactionInstance.id == null ? 'افزودن تراکنش جدید':'ویرایش اطلاعات تراکنش'" size="50%"
         @on-submit="transactionInstance.id == null ? addtransaction() : updatetransaction()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();transactionInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام تراکنش"
                  placeholder="نام تراکنش"
                   v-model="transactionInstance.name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="text"
                    class="style"
                    outlined
                    placeholder="شماره تراکنش"
                    hint="شماره تراکنش"
                    v-model="transactionInstance.transaction_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  موجودی : {{ transactionInstance.balance }}
                  <q-input dense
                    type="number"
                    class="style"
                    outlined
                    placeholder="واریز "
                    hint="واریز "
                    v-model="balance_change"/>
                    <q-btn label="واریز" color="primary"
                     @click="transactionInstance.balance = parseInt(transactionInstance.balance) + parseInt(balance_change)"/>
                </div>
                <div class="col-12 col-sm-6" style="margin-top: -20px;">
                  <SelectionInput dense
                    :option-list="transactionTypes"
                    @on-update-model="transactionInstance.type=$event.label"
                    :value="transactionInstance.type"
                    label="نوع تراکنش" />
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
import { AccTypeList } from 'src/helpers/statics';
import SelectionInput from 'src/components/SelectionInput.vue';
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
              title: 'مشاهده/ویرایش',
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
    return {
      transactionInstance: ref({
        id: null,
        account_id:null,
        amount:0,
        description: '',
        type: null,
        delay_days:0,
        fund_account_id:null,
        monthly_charge_id:null,
        installment_id:null
      }),
      transactionInfoDialog: ref(false),
      columns,
      balance_change:ref(0),
      transactionTypes:ref([])
    }
  },
  data(){

    },
  methods:{
    onAfterLoaded(rows){
      this.transactionTypes = AccTypeList
    },
    addtransaction(){
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
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SelectionInput
  }
}
</script>
