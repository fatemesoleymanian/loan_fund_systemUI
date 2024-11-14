<template>
  <q-page class="style">
      <CustomeTable
        ref="tabel"
        :add
        @after-loaded="onAfterLoaded"
        :table="{
          url: 'member',
          arrayKey: 'members'
          }"
            :add_button="
              {
                  label: 'عضو جدید',
                  icon: 'add'
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
          @on-multi-modify="onMultiModify"
          @on-select-all="onSelectAll"
          @on-add-button="memberInfoDialog = true"
          @on-delete-member="deleteMember"
          @on-edit-member="userInstance=$event;accountInstance=$event.account;memberInfoDialog = true"
          :columns="columns">
          <template v-slot:row-select="{ row }">
                <q-checkbox class="style" v-model="row.select" />
              </template>
            </CustomeTable>

      <q-dialog v-model="memberInfoDialog" :persistent="true">
        <card-panel ref="memberInfoDialogRef" :title="userInstance.id == null ? 'افزودن عضو جدید':'ویرایش اطلاعات عضو'" size="50%"
         @on-submit="userInstance.id == null ? addMember : updateMember"
         :disableNotify="false"
        @on-success="userInstance.id == null ? addAccNumber : updateAccNumber">

          <template #body>
            <div class="row items-center">
              <div class="col-12 col-sm-7 row">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام و نام خانوادگی"
                  placeholder="نام و نام خانوادگی"
                   v-model="userInstance.full_name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="text"
                class="style"
                outlined
                placeholder="شماره تلفن همراه"
                hint="شماره تلفن همراه"
                v-model="userInstance.mobile_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="شماره تلفن ثابت"
                  placeholder="شماره تلفن ثابت"
                   v-model="userInstance.telephone_number"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="text"
                class="style"
                outlined
                placeholder="نام پدر"
                hint="نام پدر"
                v-model="userInstance.father_name"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="فکس"
                  placeholder="فکس"
                   v-model="userInstance.fax"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="textarea"
                class="style"
                outlined
                placeholder="آدرس"
                hint="آدرس"
                v-model="userInstance.address"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="number" min="0" class="style" outlined dense hint="تعداد سهام"
                  placeholder="تعداد سهام"
                   v-model="userInstance.stock_units"/>
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
import { event } from 'quasar';
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
    name: 'full_name',
    label: 'نام',
    field: 'full_name',
    disable_search: true,
  },
  {
    name: 'mobile_number',
    label: 'شماره موبایل',
    field: 'mobile_number',
    disable_search: true,
  },
  {
    name: 'stock_units',
    label: 'تعداد سهم',
    field: 'stock_units',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ شروع عضویت',
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
              title: 'ویرایش',
              icon_name: 'info',
              icon_color: 'primary',
              emit: 'on-edit-member'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-member'
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
        member_id: '',
        balance: 0,
        account_number: '',
        member_name: '',
        status: true
      }),
      memberInfoDialog: ref(false),
      columns
    }
  },
  data(){
    },
  methods:{
    onAfterLoaded(rows){
      const r = rows
      r.forEach(row=>{
       row.account_number = row.account.account_number
      })
      this.$refs.table.setRows(r)
    },
    addMember(){
      this.accountInstance.member_name = this.userInstance.full_name
      this.$refs.memberInfoDialogRef.submit({
        url: 'member',
        value : this.userInstance
      })
    },
    async addAccNumber(response){
      this.accountInstance.member_id = response.member.id

      await api.post('account',{...this.accountInstance}).then(res=>{
        this.memberInfoDialog = false;
        this.$refs.tabel.getRows()
      }).catch(error=>{
        alert(error.message)
      })
    },
    async updateAccNumber(response){
      this.accountInstance.member_id = response.member.id

      await api.put('account',{...this.accountInstance}).then(res=>{
        this.memberInfoDialog = false;
        this.$refs.tabel.getRows()
      }).catch(error=>{
        alert(error.message)
      })
    },
    updateMember(){

    },
    deleteMember(){

    },
    showMmeber(){

    }
  },
  components:{
    CustomeTable,
    CardPanel
  }
}
</script>
