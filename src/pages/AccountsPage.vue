<template>
  <q-page class="style">
    فیلتر براساس و ویرایش چندتایی مونده***
    ***واریز / برداشت به حساب  ، بستن حساب
      <CustomeTable
        ref="table"
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'account',
          arrayKey: 'accounts'
          }"

              :extra_buttons="[
              {
                  label: 'ویرایش سهم',
                  icon: 'list',
                  emit: 'on-multi-modify'
              },
              {
                  label: 'انتخاب همه',
                  icon: 'check_box',
                  emit: 'on-select-all'
              },
          ]"
          @on-multi-modify="this.multiModifyDialog = true;"
          @on-select-all="onSelectAll"
          @on-add-button="accountInfoDialog = true"
          @on-delete-account="deleteaccount"
          @on-edit-account="accountInstance=$event;userInstance=$event.member;accountInfoDialog = true"
          :columns="columns">
          <template v-slot:row-select="{ row }">
                <q-checkbox class="style" v-model="row.select" @click="saveDeselected(row)"/>
              </template>
            <template v-slot:row-description="{ row }">
                <div>{{row.member == null ? '': row.member.stock_units }}</div>
              </template>
            </CustomeTable>

      <q-dialog v-model="accountInfoDialog" :persistent="true">
        <card-panel ref="accountInfoDialogRef" :title="userInstance.id == null ? 'افزودن حساب جدید':'ویرایش اطلاعات حساب'" size="50%"
         @on-submit="userInstance.id == null ? addaccount() : updateaccount()"
         :disableNotify="false"
        @on-success="addAccNumber">

          <template #body>
            <div class="row items-center" v-if="userInstance.id != null">
                <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات عضو</div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام و نام خانوادگی"
                  placeholder="نام و نام خانوادگی"
                   v-model="userInstance.full_name" disable/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                  disable
                type="text"
                class="style"
                outlined
                placeholder="شماره تلفن همراه"
                hint="شماره تلفن همراه"
                v-model="userInstance.mobile_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="شماره تلفن ثابت"
                  placeholder="شماره تلفن ثابت" disable
                   v-model="userInstance.telephone_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                  disable
                type="text"
                class="style"
                outlined
                placeholder="نام پدر"
                hint="نام پدر"
                v-model="userInstance.father_name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="فکس"
                  placeholder="فکس" disable
                   v-model="userInstance.fax"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="textarea" disable
                class="style"
                outlined
                placeholder="آدرس"
                hint="آدرس"
                v-model="userInstance.address"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense hint="تعداد سهام"
                  placeholder="تعداد سهام" disable
                   v-model="userInstance.stock_units"/>
                </div>
                </div>
                <q-separator inset />

                <div class="row items-center">
                  <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات حساب</div>
                <div class="col-12 col-sm-6" v-if="userInstance.id == null">
                  <SelectionInput dense
                    :option-list="members"
                    @on-update-model="accountInstance.member_name=$event.label;accountInstance.member_id=$event.value;"
                    :value="{label:accountInstance.member_name,value:accountInstance.member_id}"
                    label="نام عضو" />

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
                <!-- <div class="col-12 col-sm-6">
                  <q-input dense
                    type="text"
                    class="style"
                    outlined
                    placeholder="موجودی"
                    hint="موجودی"
                    v-model="accountInstance.balance"/>
                </div> -->
                <div class="col-12 col-sm-6 row">
                  <div class="h5-6">وضعیت حساب : </div>
                  <q-btn color="primary"
                   :label="accountInstance.status"
                    :outline="accountInstance.status === 'بدهکار'"/>
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
            <q-separator inset />

            <div class="row items-center" v-if="userInstance.id != null">
                <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات وام</div>
                <div>{{ accountInstance.loans }}</div>
              </div>
              <div class="row items-center" v-if="userInstance.id != null">
                <div class="col-12 text-center h3-4 text-dark q-pa-lg font-bold">اطلاعات ماهیانه</div>
                <div>{{ accountInstance.monthlyCharges }}</div>
              </div>
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
  </q-page>
</template>

<script>
import { ref } from 'vue';

import CustomeTable from 'src/components/CustomeTable.vue';
import { api } from 'src/boot/axios';
import CardPanel from 'src/components/CardPanel.vue';
import SelectionInput from 'src/components/SelectionInput.vue';
import { membersList } from 'src/helpers/statics';
const columns = [
{
  name: 'select',
  field: 'select',
  label: 'انتخاب',
  disable_search: true
},
  {
    name: 'account_number',
    label: 'شماره حساب',
    field: 'account_number',
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
    name: 'description',
    label: 'تعداد سهم',
    field: 'description',
    disable_search: true,
  },
  {
    name: 'status',
    label: 'وضعیت',
    field: 'status',
    disable_search: true,
  },
  {
    name: 'monthlyCharges',
    label: 'نوع ماهیانه',
    field: 'monthlyCharges',
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
              title: 'واریز به حساب',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-member'
            },
            {
              title: 'برداشت از حساب',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-member'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-account'
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
      userInstance: ref({
        id:null,
        full_name: '',
        mobile_number: '',
        telephone_number: '',
        father_name: '',
        fax: '',
        stock_units: '',
        address: '',
        // join_date: ''
      }),
      accountInstance: ref({
        account_id: '',
        balance: 0,
        account_number: '',
        account_name: '',
        status: '',
        member_id:'',
        member_name:'',
        description:'',
        loans:[],
        monthlyCharges:[]
      }),
      accountInfoDialog: ref(false),
      columns,
      stock_units: ref(0),
      deselecteds:ref([]),
      selectAll: ref(false),
      multiModifyDialog: ref(false),
      members:ref([])
    }
  },
  data(){
    },
  methods:{
    async onAfterLoaded(rows){
      this.members = await membersList()
    },
    addaccount(){
      this.$refs.accountInfoDialogRef.submit({
        url: 'account',
        value : this.accountInstance
      })
    },
    async addAccNumber(){
      // if(method === 'post') this.accountInstance.account_id = response.account.id
      // await api[method]('account',{...this.accountInstance}).then(res=>{
        this.accountInfoDialog = false;
        this.$refs.table.getRows()
      // }).catch(error=>{
      //   alert(error.response.data.message)
      // })
    },
    updateaccount(){

      this.$refs.accountInfoDialogRef.submit({
        url: 'account',
        value : this.accountInstance
      },'put')
    },
    async deleteaccount(account){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف حساب اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('account/delete',{id:account.id}).then(res=>{
        this.$refs.table.getRows()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
    onSelectAll () {
      this.stock_units = 0
      this.selectAll = !this.selectAll
      this.deselecteds = []
      this.onSelectAllaccounts()
    },
    saveDeselected (row) {
      if (!row.select) {
        this.deselecteds.push(row.id)
      }
    },
    onSelectAllaccounts () {
      const r = this.$refs.table.getRowsValue()
      const itemsNotInDeselecteds = r.filter(item => !this.deselecteds.includes(item.id))
      if (itemsNotInDeselecteds.length > 0) {
        itemsNotInDeselecteds.forEach(item => {
          item.select = this.selectAll
        })
      }
    },
    updateManyaccounts(){
      const account_ids = this.$refs.table.getRowsValue().filter(item => item.select).map(item => item.id)

      this.$refs.multiModifyDialogRef.submit({
        url: 'account/update_stocks',
        value : { account_ids , stock_units:this.stock_units}
      },'put')
    }
  },
  components:{
    CustomeTable,
    CardPanel,
    SelectionInput
  }
}
</script>
