<template>
  <q-page class="style">
    //ماهیانه حساب موند
    حساب های بسته چی میشن؟ جایی نمایش داده میشن و جایی حساب میشن؟//
    <div class="row justify-center text-black h2">حساب ها</div>

      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'account',
          arrayKey: 'accounts'
          }"
              :add_button="
              {
                  label: 'افتتاح حساب ',
                  icon: 'add'
              }"
              :extra_buttons="[
              // {
              //     label: 'ویرایش سهم',
              //     icon: 'list',
              //     emit: 'on-multi-modify'
              // },
              // {
              //     label: 'انتخاب همه',
              //     icon: 'check_box',
              //     emit: 'on-select-all'
              // },
          ]"
          @on-multi-modify="this.multiModifyDialog = true;"
          @on-select-all="onSelectAll"
          @on-add-button="resetInstance();accountInfoDialog = true"
          @on-delete-account="deleteaccount"
          @on-edit-account="fillInstance($event);accountInfoDialog = true"
          :columns="columns"
          @on-deposit="transactionInstance.account_id=$event.id;transactionInstance.balance=$event.balance;transactionInstance.description='واریز حساب';createDepositDialog=true"
          @on-closure="transactionInstance.account_id=$event.id;transactionInstance.balance=$event.balance;transactionInstance.description='بستن حساب';transactionInstance.amount=$event.balance;closureDialog=true">
          <template v-slot:row-select="{ row }">
                <q-checkbox class="style" v-model="row.select" @click="saveDeselected(row)"/>
              </template>
            <template v-slot:row-description="{ row }">
                <div>{{row.member == null ? '': row.member.stock_units }}</div>
              </template>
              <template v-slot:row-created_at="{ row }">
                <div class="h5">{{row.created_at }}</div>
              </template>
              <template v-slot:row-monthly_charges="{ row }">
                <div v-if="row.monthly_charges">
                  <div v-for="m in row.monthly_charges" :key="m">
                    {{ m.title }}
                  </div>
                </div>
                <div v-else>ندارد</div>
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
                </div>
                <q-separator inset />

                <div class="row items-center">
                  <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات حساب</div>

                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense hint="تعداد سهام"
                  placeholder="تعداد سهام"
                   v-model="accountInstance.stock_units"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense  v-if="accountInstance.id == null"
                    type="text"
                    class="style"
                    outlined
                    placeholder="موجودی"
                    hint="موجودی"
                    v-model="accountInstance.balance"/>
                    <div v-else>موجودی : {{ accountInstance.balance }}</div>
                </div>

                <!-- <div class="col-12 col-sm-6 row">
                  <div class="h5-6">وضعیت حساب : </div>
                  <q-btn color="primary"
                   :label="accountInstance.status"
                    :outline="accountInstance.status === 'بستانکار'"/>
                </div> -->
                <div class="col-12 col-sm-6">
                  <q-input dense
                    type="textarea"
                    class="style"
                    outlined
                    placeholder="توضیحات"
                    hint="توضیحات"
                    v-model="accountInstance.description"/>
                </div>
                <div class="col-12 col-sm-6" v-if="accountInstance.id != null">
                  ماهیانه : {{ accountInstance.monthly_charges }}
                  </div>

            </div>

            <!-- <div class="row items-center" v-if="accountInstance.id != null">
                <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات وام</div>
                <div>{{ accountInstance.loans }}</div>
              </div> -->

          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="multiModifyDialog" :persistent="true">
        <card-panel ref="multiModifyDialogRef" title="ویرایش تعداد سهام برای اعضا" size="40%"
         @on-submit="updateManyaccounts"
         :disableNotify="false"
        @on-success="this.$refs.table.getRows();multiModifyDialog=false;">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense hint="تعداد سهام"
                  placeholder="تعداد سهام"
                   v-model="stock_units"/>
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
    name: 'balance',
    label: 'موجودی',
    field: 'balance',
    disable_search: true,
  },
  {
    name: 'stock_units',
    label: 'تعداد سهم',
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
    name: 'monthly_charges',
    label: 'نوع ماهیانه',
    field: 'monthly_charges',
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
              title: 'بستن حساب ',
              icon_name: 'close',
              icon_color: 'negative',
              emit: 'on-closure'
            },
            // {
            //   title: 'حذف',
            //   icon_name: 'delete',
            //   icon_color: 'primary',
            //   emit: 'on-delete-account'
            // },
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
      accountInstance: ref({
        id:null,
        full_name: '',
        mobile_number: '',
        telephone_number: '',
        father_name: '',
        fax: '',
        stock_units: '',
        address: '',
        account_id: '',
        balance: 0,
        status: 'بستانکار',
        is_open: true,
        member_id:null,
        member_name:'',
        description:'',
        // loans:[],
        monthly_charges:[{title:'',value:0}]
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
      closureDialog: ref(false),
      columns,
      stock_units: ref(0),
      deselecteds:ref([]),
      selectAll: ref(false),
      multiModifyDialog: ref(false),
      members:ref([]),
      monthlyCharges:ref([]),
      fundAccountsList:ref([])
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
    },
    addaccount(){
      this.$refs.accountInfoDialogRef.submit({
        url: 'account',
        value : this.accountInstance
      })
    },
    // async addAccNumber(response, method='post'){
    //     /**TODO */
    //    this.monthlyChargeInstance.account_id = this.accountInstance.id
    //   await api.post('monthly_charge_member',{...this.monthlyChargeInstance}).then(res=>{
    //     this.accountInfoDialog = false;
    //     this.$refs.table.getRows()
    //   }).catch(error=>{
    //     alert(error.response.data.message)
    //   })
    // },
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
    // onSelectAll () {
    //   this.stock_units = 0
    //   this.selectAll = !this.selectAll
    //   this.deselecteds = []
    //   this.onSelectAllaccounts()
    // },
    // saveDeselected (row) {
    //   if (!row.select) {
    //     this.deselecteds.push(row.id)
    //   }
    // },
    // onSelectAllaccounts () {
    //   const r = this.$refs.table.getRowsValue()
    //   const itemsNotInDeselecteds = r.filter(item => !this.deselecteds.includes(item.id))
    //   if (itemsNotInDeselecteds.length > 0) {
    //     itemsNotInDeselecteds.forEach(item => {
    //       item.select = this.selectAll
    //     })
    //   }
    // },
    // updateManyaccounts(){
    //   const account_ids = this.$refs.table.getRowsValue().filter(item => item.select).map(item => item.id)

    //   this.$refs.multiModifyDialogRef.submit({
    //     url: 'account/update_stocks',
    //     value : { account_ids , stock_units:this.stock_units}
    //   },'put')
    // },
    createDeposit(){
      this.$refs.createDepositDialogRef.submit({
        url: 'deposit',
        value : this.transactionInstance
      })    },
      closure(){
        this.$refs.closureDialogRef.submit({
        url: 'withdraw/closure',
        value : this.transactionInstance
      },'put')
      }
  },
  components:{
    CustomeTable,
    CardPanel
    }
}
</script>
