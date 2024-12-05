<template>
  <q-page class="style">
    //ماهیانه حساب موند<br>
    //قبل بستن حساب باید تسویه کنه تسویه هم ینی ماهیانه پرداخت نشده یا قسط پرداخت نشده نداشته باشه اگه داره پرداخت کنه اگه نه صفر کنه موجودیشو و بشه تسویه

   <div class="row q-pa-md text-center justify-between">
    <q-input label="شماره حساب" v-model="filter.id"/>
    <q-input label="نام حساب" v-model="filter.member_name"/>
    <q-option-group
      v-model="filter.status"
      :options="accountStatus"
      color="primary"
      class="h4"
      inline size="md" keep-color
    />
    <q-checkbox v-model="filter.is_open" label="نمایش حساب های بسته شده"/>
    <q-btn label="جستجو" @click="search" color="primary" size="sm"/>
   </div>
    <div class="row justify-center text-black h2">حساب ها</div>

      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: `account${searchQuery}`,
          arrayKey: 'accounts'
          }"
              :add_button="
              {
                  label: 'افتتاح حساب ',
                  icon: 'add'
              }"
          @on-add-button="resetInstance();accountInfoDialog = true"
          @on-delete-account="deleteaccount"
          @on-edit-account="fillInstance($event);accountInfoDialog = true"
          :columns="columns"
          @on-deposit="transactionInstance.account_id=$event.id;transactionInstance.balance=$event.balance;transactionInstance.description='واریز حساب';createDepositDialog=true"
          @on-closure="transactionInstance.account_id=$event.id;transactionInstance.balance=$event.balance;transactionInstance.description='بستن حساب';transactionInstance.amount=$event.balance;closureDialog=true"
          @on-withdraw="transactionInstance.account_id=$event.id;transactionInstance.balance=$event.balance;transactionInstance.description='برداشت از حساب';createWithdrawDialog=true"
          @on-installments="showInstallments" @on-settelment="checkForSettlement">
          <!-- <template v-slot:row-select="{ row }">
                <q-checkbox class="style" v-model="row.select" @click="saveDeselected(row)"/>
              </template> -->

              <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
              <template v-slot:row-is_open="{ row }">
                <div class="h4">{{row.is_open === '1' ? 'باز':' بسته شده' }}</div>
              </template>
              <template v-slot:row-stock_units="{ row }">
                <div v-if="row.stock_units > 0">
                  {{row.stock_units }} سهم
                </div>
                <div v-else>
                  ندارد
                </div>
              </template>
            </CustomeTable>

      <q-dialog v-model="accountInfoDialog" :persistent="true">
        <card-panel ref="accountInfoDialogRef" :title="accountInstance.id == null ? 'افتتاح حساب ':'ویرایش اطلاعات حساب'"
         size="85%"
         @on-submit="accountInstance.id == null ? addaccount() : updateaccount()"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();accountInfoDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات عضو</div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام و نام خانوادگی"
                  placeholder="نام و نام خانوادگی"
                   v-model="accountInstance.full_name" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="text"
                class="style"
                outlined
                placeholder="شماره تلفن همراه"
                hint="شماره تلفن همراه"
                v-model="accountInstance.mobile_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="شماره تلفن ثابت"
                  placeholder="شماره تلفن ثابت"
                   v-model="accountInstance.telephone_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="text"
                class="style"
                outlined
                placeholder="نام پدر"
                hint="نام پدر"
                v-model="accountInstance.father_name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="فکس"
                  placeholder="فکس"
                   v-model="accountInstance.fax"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="textarea"
                class="style"
                outlined
                placeholder="آدرس"
                hint="آدرس"
                v-model="accountInstance.address"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-checkbox v-model="accountInstance.have_sms" label="پیامک دارد"/>
                  </div>
                </div>
                <q-separator inset />

                <div class="row items-center">
                  <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات حساب</div>

                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense hint="نوع عضویت"
                  placeholder="نوع عضویت"
                   v-model="accountInstance.stock_units"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense  v-if="accountInstance.id == null"
                    type="number"
                    min="0"
                    class="style"
                    outlined
                    placeholder="موجودی"
                    hint="موجودی"
                    v-model="accountInstance.balance"/>
                    <div v-else>موجودی : {{ accountInstance.balance }}</div>
                </div>

                <div class="col-12 col-sm-6 row" v-if="accountInstance.id != null">
                  <div class="h5-6">وضعیت حساب : {{ accountInstance.status }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="textarea"
                    class="style"
                    outlined
                    placeholder="توضیحات"
                    hint="توضیحات"
                    v-model="accountInstance.description"/>
                </div>
            </div>
          </template>
        </card-panel>
      </q-dialog>

      <q-dialog v-model="createDepositDialog" :persistent="true">
        <card-panel ref="createDepositDialogRef"
        title="واریز" size="50%"
         @on-submit="createDeposit"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();createDepositDialog=false;">
          <template #body>
            <div class="row items-center">
              <div class="col-12 text-center font-bold">
                موجودی : {{ transactionInstance.balance }}
              </div>
                <div class="col-12 ">
                  <q-input type="number" min="0" class="style" outlined dense hint="مبلغ"
                  placeholder="مبلغ"
                   v-model="transactionInstance.amount"/>
                </div>
                <div class="col-12 ">
                  <q-input type="textarea" class="style" outlined dense hint="توضیح"
                  placeholder="توضیح"
                   v-model="transactionInstance.description"/>
                </div>
            </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="createWithdrawDialog" :persistent="true">
        <card-panel ref="createWithdrawDialogRef"
        title="برداشت" size="50%"
         @on-submit="createWithdraw"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();createWithdrawDialog=false;">
          <template #body>
            <div class="row items-center">
              <div class="col-12 text-center font-bold">
                موجودی : {{ transactionInstance.balance }}
              </div>
                <div class="col-12 ">
                  <q-input type="number" min="0" class="style" outlined dense hint="مبلغ"
                  placeholder="مبلغ"
                   v-model="transactionInstance.amount"/>
                </div>
                <div class="col-12 ">
                  <q-input type="textarea" class="style" outlined dense hint="توضیح"
                  placeholder="توضیح"
                   v-model="transactionInstance.description"/>
                </div>
            </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="closureDialog" :persistent="true">
        <card-panel ref="closureDialogRef"
        title="بستن حساب" size="50%"
         @on-submit="closure"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();closureDialog=false;">
          <template #body>
            <div class="row items-center">
              <div class="col-12 text-center font-bold">
                موجودی : {{ transactionInstance.balance }}
              </div>
                <div class="col-12 ">
                  <q-input type="number" disable min="0" class="style" outlined dense hint="مبلغ"
                  placeholder="مبلغ"
                   v-model="transactionInstance.amount"/>
                </div>
                <div class="col-12 ">
                  <q-input type="textarea" class="style" outlined dense hint="توضیح"
                  placeholder="توضیح"
                   v-model="transactionInstance.description"/>
                </div>
            </div>
            <div class="h3 font-bold">آیا از بستن حساب اطمینان دارید؟ درصورت بستن موجودی حساب کسر شده و حساب غیرفعال میشود!</div>
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
import { accountStatus } from 'src/helpers/statics';
const columns = [
// {
//   name: 'select',
//   field: 'select',
//   label: 'انتخاب',
//   disable_search: true
// },
  {
    name: 'id',
    label: 'شماره حساب',
    field: 'id',
    disable_search: true,
  },
  {
    name: 'member_name',
    label: 'نام',
    field: 'member_name',
    disable_search: true,
  },
  {
    name: 'stock_units',
    label: 'ماهیانه',
    field: 'stock_units',
    disable_search: true,
  },
  {
    name: 'status',
    label: 'وضعیت',
    field: 'status',
    disable_search: true,
  },
  {
    name: 'balance',
    label: 'موجودی',
    field: 'balance',
    disable_search: true,
  },
  {
    name: 'is_open',
    label: ' باز / بسته',
    field: 'is_open',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ ایجاد حساب',
    field: 'created_at',
    disable_search: true,
  },
  {
    name: 'action',
    field: 'action',
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
              emit: 'on-edit-account'
            },
            {
              title: 'واریز ',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-deposit'
            },
            {
              title: 'بستن حساب ', //age hesab bastas fa'al nemudane hesabo biar
              icon_name: 'close',
              icon_color: 'negative',
              emit: 'on-closure'
            },
            {
              title: 'برداشت',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-withdraw'
            },
            {
              title: 'تسویه',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-settelment'
            },
            {
              title: 'اقساط و ماهیانه ها',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-installments'
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
        id:'',
        member_name:'',
        status:'',
        is_open:''
      }),
      accountInstance: ref({
        id:null,
        full_name: '',
        mobile_number: '',
        telephone_number: '',
        father_name: '',
        fax: '',
        stock_units: '',
        address: '',
        have_sms:false,
        account_id: '',
        balance: 0,
        status: 'بستانکار',
        have_sms:false,
        is_open: true,
        member_id:null,
        member_name:'',
        description:'',
      }),
      monthlyChargeInstance:ref({
        account_id:null,
        monthly_charge_id:null,
        year:year
      }),
      transactionInstance:ref({
        account_id:null,
        amount:null,
        description:'',
        balance:0
      }),
      accountInfoDialog: ref(false),
      createDepositDialog: ref(false),
      createWithdrawDialog: ref(false),
      closureDialog: ref(false),
      columns,
      searchQuery:ref('')
    }
  },
  data(){
    return{
    }
    },
  methods:{
    resetInstance(){
      this.accountInstance = {
        id:null,
        full_name: '',
        mobile_number: '',
        telephone_number: '',
        father_name: '',
        fax: '',
        stock_units: '',
        address: '',
        have_sms:false,
        account_id: '',
        balance: 0,
        status: 'بستانکار',
        is_open: true,
        member_id:null,
        member_name:'',
        description:'',
        // loans:[],
        monthly_charges:[{title:'',value:0}]
      }
    },
    fillInstance(instance){
      this.accountInstance = {
        id:instance.id,
        full_name: instance.member_name,
        mobile_number: instance.member.mobile_number,
        telephone_number: instance.member.telephone_number,
        father_name: instance.member.father_name,
        fax: instance.member.fax,
        stock_units: instance.stock_units,
        address: instance.member.address,
        have_sms:instance.have_sms,
        account_id: instance.id,
        balance: instance.balance,
        status: instance.status,
        is_open: instance.is_open,
        member_id:instance.member.id,
        member_name:instance.member.full_name,
        description:instance.description,
        monthly_charges:instance.monthly_charges ?[{title:'',value:0}]:[]
      }
    },
    async onAfterLoaded(rows){
      rows.forEach((row) => {
        row.class = row.is_open === '1' ? '':'opt-5'
      })
      this.$refs.table.setRowsValue(rows)
    },
    addaccount(){
      this.$refs.accountInfoDialogRef.submit({
        url: 'account',
        value : this.accountInstance
      })
    },
    updateaccount(){
      this.$refs.accountInfoDialogRef.submit({
        url: 'account',
        value : this.accountInstance
      },'put')
    },
    // async deleteaccount(account){
    //   this.$emit('on-ok-dialog', {
    //     message: `آیا از حذف حساب اطمینان دارید؟`,
    //     icon: 'delete',
    //     color: 'negative',
    //     textColor: 'white',
    //     onOk: async () => {
    //       await api.post('account/delete',{id:account.id}).then(res=>{
    //     this.$refs.table.getRows()
    //   }).catch(error=>{
    //     alert(error.response.data.message)
    //   })
    //     }
    //   })
    // },
    createDeposit(){
      this.$refs.createDepositDialogRef.submit({
        url: 'deposit',
        value : this.transactionInstance
      })    },
      createWithdraw(){
      this.$refs.createWithdrawDialogRef.submit({
        url: 'withdraw',
        value : this.transactionInstance
      })    },
      checkForClosure(){
        // check kon bbin ghste pardakht nashode nadare?
        //age dare bgu dare va beza karbar entkhab kne chikar kne

      },
      closure(){
        this.$refs.closureDialogRef.submit({
        url: 'withdraw/closure',
        value : this.transactionInstance
      },'put')
      },
      checkForSettlement(){
        this.$refs.closureDialogRef.submit({
        url: 'account/settlement',
        value : this.transactionInstance
      },'put')
      },
      showInstallments(account){

      },
      search(){
        this.searchQuery = ''
      }
  },
  components:{
    CustomeTable,
    CardPanel
    }
}
</script>
