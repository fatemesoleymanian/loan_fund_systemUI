<template>
  <q-page class="style">
    <div class="row justify-center text-black h2">مدیریت حساب های صندوق</div>

    <div class="row">
      <div class="col-8">
      <q-btn label="ایجاد حساب" v-if="current_acc == null" color="primary" outline @click="accountInstance={  id: null,
        balance: 0,
        total_balance: 0,
        fees: 0,
        expenses:0,
        name: 'صندوق قرض الحسنه (اصلی)'};fundAccountInfoDialog = true"/>
      </div>
      <div class="col-4">
        <q-select outlined dense v-model="current_acc" :value="fundAccountsList[0]" :options="fundAccountsList" label="صندوق" />
      </div>
    </div>
    <div v-if="current_acc != null">
    <q-splitter
      v-model="splitterModel"
      style="height: fit-content;"
    >

      <template v-slot:before>
        <q-tabs
          v-model="tab"
        switch-indicator
          vertical
          class="text-primary bg-white"
          @update:model-value="tabUpdated">
          <q-tab name="info" icon="mail" label="حساب صندوق"/>
          <q-tab name="assets" icon="alarm" label="اثاثیه" />
          <q-tab name="charity" icon="movie" label="خیریه" />
          <q-tab name="todayReport" icon="movie" label="دفتر روزانه" />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="info">
            <div class="text-h6 q-mb-md">اطلاعات کلی این حساب</div>
            <div class="row">
              <div class="col-12 q-pa-sm">
                عنوان : {{ current_acc.label }}
               <div class="row">
                <q-input type="text" outlined dense
                   v-model="accountInstance.name" class="col-7 q-mx-sm"/>
                   <q-btn label="ویرایش نام صندوق" @click="updatefundAccount" color="primary" />
               </div>

              </div>
              <div class="col-12 q-pa-sm">
            موجودی : {{ current_acc.data.balance }}
            </div>
            <div class="col-12 q-pa-sm">
           مجموع کارمزد (درآمد) : {{ current_acc.data.fees }}
            </div>
            <div class="col-12 q-pa-sm">
           هزینه : {{ current_acc.data.expenses }}
            </div>
            <div class="col-12 q-pa-sm">
           موجودی کل : {{ current_acc.data.total_balance }}
            </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="assets">
            <CustomeTable
            ref="assestTable"
            :table="{
              url: 'asset',
              arrayKey: 'assets'
              }"
                :add_button="
                  {
                      label: 'افزودن اثاثیه',
                      icon: 'add'
                  }"

              @on-add-button="assetInstance={
                id:null,
                title:'',
                cost:0,
                description:''
              };assestInfoDialog=true;"
              @on-delete-asset="deleteAsses"
              @on-edit-asset="assetInstance=$event;assestInfoDialog=true;"
              :columns="assestColumns">
              <template v-slot:row-created_at="{ row }">
                    <div class="h5">{{row.created_at }}</div>
                  </template>
          </CustomeTable>

          </q-tab-panel>

          <q-tab-panel name="charity">
            <q-btn label="برداشت" color="primary" outline/>

            <div class="text-h4 q-mb-md">Movies</div>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
          </q-tab-panel>
          <q-tab-panel name="todayReport">
            <div class="text-h4 q-mb-md">todayReport</div>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
          </q-tab-panel>
        </q-tab-panels>
      </template>

    </q-splitter>
  </div>


      <q-dialog v-model="fundAccountInfoDialog" :persistent="true">
        <card-panel ref="fundAccountInfoDialogRef" title=" حساب صندوق جدید" size="50%"
         @on-submit="addfundAccount()"
         :disableNotify="false"
        @on-success="reloadPage">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام حساب"
                  placeholder="نام حساب"
                   v-model="accountInstance.name"/>
                </div>
                <div class="col-12 col-sm-6">
                  موجودی : {{ accountInstance.balance }}<br>
                  مجموع کارمزد (درآمد) : {{ accountInstance.fees }}<br>
                  موجودی کل : {{ accountInstance.total_balance }}<br>
                  هزینه : {{ accountInstance.expenses }}

                </div>
              </div>
          </template>
        </card-panel>
      </q-dialog>
      <q-dialog v-model="assestInfoDialog" :persistent="true">
        <card-panel ref="assestInfoDialogRef" :title="assetInstance.id == null ? 'افزودن اثاثیه جدید':'ویرایش اثاثیه'" size="50%"
         @on-submit="assetInstance.id == null ? addAsset() : updateAsset()"
         :disableNotify="false"
        @on-success="this.$refs.assestTable.getRows();assestInfoDialog=false">

          <template #body>
            <div class="row items-center">
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="نام "
                  placeholder="نام "
                   v-model="assetInstance.title"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input dense
                type="text"
                class="style"
                outlined
                placeholder="هزینه"
                hint="هزینه"
                v-model="assetInstance.cost"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input type="text" class="style" outlined dense hint="توضیحات اضافی"
                  placeholder="توضیحات اضافی"
                   v-model="assetInstance.description"/>
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
import { fundAccountList, fundAccTypeList } from 'src/helpers/statics';
const assestColumns = [
{
    name: 'id',
    label: 'شناسه',
    field: 'id',
    disable_search: true,
  },
  {
    name: 'title',
    label: 'نام',
    field: 'title',
    disable_search: true,
  },
  {
    name: 'cost',
    label: 'هزینه',
    field: 'cost',
    disable_search: true,
  },
  {
    name: 'description',
    label: 'توضیح',
    field: 'description',
    disable_search: true,
  },
  {
    name: 'created_at',
    label: 'تاریخ خرید ',
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
              emit: 'on-edit-asset'
            },
            {
              title: 'حذف',
              icon_name: 'delete',
              icon_color: 'primary',
              emit: 'on-delete-asset'
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
      tab: ref('info'),
      splitterModel: ref(20),
      accountInstance: ref({
        id: null,
        balance: 0,
        total_balance: 0,
        fees: 0,
        expenses:0,
        name: 'صندوق قرض الحسنه (اصلی)',
      }),
      assetInstance:ref({
        id:null,
        title:'',
        cost:0,
        description:''
      }),
      fundAccountInfoDialog: ref(false),
      assestInfoDialog: ref(false),
      assestColumns,
      balance_change:ref(0),
      fundAccountsList:ref([]),
      current_acc:ref(null)
    }
  },
  data(){
    this.onAfterLoaded()
    },
  methods:{
    reloadPage(){
     window.location.reload()
    },
    async onAfterLoaded(){
      this.fundAccountsList = await fundAccountList()
      if (this.fundAccountsList.length <1) {
        this.accountInstance={  id: null,
        balance: 0,
        total_balance: 0,
        fees: 0,
        expenses:0,
        name: 'صندوق قرض الحسنه (اصلی)'}
        this.fundAccountInfoDialog = true
      }else this.current_acc = this.fundAccountsList[0]
    },
    addfundAccount(){
      this.$refs.fundAccountInfoDialogRef.submit({
        url: 'fund_account',
        value : this.accountInstance
      })
    },
    async updatefundAccount(){
      this.accountInstance.balance = this.current_acc.data.balance
      this.accountInstance.total_balance = this.current_acc.data.total_balance
      this.accountInstance.fees = this.current_acc.data.fees
      this.accountInstance.expenses = this.current_acc.data.expenses
      this.accountInstance.id = this.current_acc.value
      await api.put('fund_account',this.accountInstance).then(res=>{
        this.$emit('on-notify',res.data.msg)
      }).catch(error=>{
        if (error.response != null ) {
    alert(error.response.data.message || error.response.data.msg)
  }
      })

    },
    async deletefundAccount(){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف حساب صندوق اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('fund_account/delete',{id:this.current_acc.value}).then(res=>{
        this.reloadPage()
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
    async deleteAsses(asset){
      this.$emit('on-ok-dialog', {
        message: `آیا از حذف اثاثیه اطمینان دارید؟`,
        icon: 'delete',
        color: 'negative',
        textColor: 'white',
        onOk: async () => {
          await api.post('asset/delete',{id:asset.id}).then(res=>{
        this.$refs.assestTable.getRows();
      }).catch(error=>{
        alert(error.response.data.message)
      })
        }
      })
    },
    addAsset(){
      this.$refs.assestInfoDialogRef.submit({
        url: 'asset',
        value : this.assetInstance
      })
    },
    updateAsset(){
      this.$refs.assestInfoDialogRef.submit({
        url: 'asset',
        value : this.assetInstance
      },'put')

    },
  },
  components:{
    CustomeTable,
    CardPanel,
  }
}
</script>
