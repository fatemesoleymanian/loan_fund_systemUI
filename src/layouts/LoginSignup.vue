<template>
  <div class="row items-center bg-white" style="max-height: 100vh!important;height: 100vh;">
    <div class="col-12 col-sm-6 q-pa-xl" >
      <q-form
        @submit="onSubmit"
        @reset="onReset" class="q-px-lg">
        <div class="row text-center justify-center items-center">
          <q-img src="../../public/logo.png" width="50px" height="50px"/>
          <div class="h1 text-primary font-bold q-ml-sm q-pt-sm">صندوق</div>
        </div>
        <ForgetResetPassword v-if="forgetPassword || resetPassword"
        :title="forgetPassword ? 'فراموشی رمز عبور' : 'کد تایید'">
        <template #body>
          <div v-if="forgetPassword" style="margin-top: -15px!important">
            <q-input
            outline
            v-model="emailOrPhone"
            class="style"
            maxlength="11"
            type="tel"
            outlined
            placeholder="شماره تلفن همراه :">
        </q-input>
          </div>
          <div v-else class="row">
            <div class="col-12 q-pt-md">
            <q-input
            outline
            v-model="code"
            class="style"
            maxlength="6"
            type="text"
            outlined
            hint="کد ارسال شده">
        </q-input>
        </div>
            <div class="col-12 q-pt-md">
              <q-input class="style" :type="isPwd ? 'password' : 'text'"
              outlined hint="رمز عبور جدید" v-model="newPassword">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            </div>
            <div class="col-12 q-pt-md">
              <q-input class="style" :type="isPwd ? 'password' : 'text'"
              outlined hint="تکرار رمز عبور جدید" v-model="repeatNewPassword">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          </div>
        </template>
        <template #actions>
          <div class="row col-12 justify-center q-px-md">
            <!-- <q-btn v-if="login" unelevated dense color="primary" class="style" label="فراموشی کلمه عبور؟" flat/> -->
            <q-btn color="primary" unelevated type="submit"
             class="font-bold col-12 style"
              :label="forgetPassword ?'ارسال کد':'ثبت'"
              :loading="loading"
            size="lg"/>
          </div>
        </template>

        </ForgetResetPassword>
      <login-signup-elements v-else :title="title" >
        <template #body>
          <div v-if="login" style="margin-top: -15px!important">
            <q-input
            outline
            v-model="username"
            class="style"
            maxlength="40"
            type="email"
            outlined
            @update:model-value="console.log(username)"
            placeholder="نام کاربری">
        </q-input>
            <q-input v-model="password" class="style"
             style="margin-top: 18px;" :type="isPwd ? 'password' : 'text'"  outlined
               placeholder="رمز عبور" maxlength="12" :rules="[ val => val.length >= 5 || 'طول  رمز عبور نباید کمتر از 5  کاراکتر باشد']">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
             <div class="row col-12 q-px-sm q-pb-sm">
              <p class="h4-5 font-light col-12">رمز عبور خود را فراموش کرده اید؟
            <q-btn v-if="login" unelevated dense color="primary"
              class="sm-style font-regular"
              label="اینجا را کلیک کنید."  flat
              style="margin-right: 0!important;text-decoration: underline"
              @click="toggleForgetPass(true)"/>
            </p>
          </div>
     <div class="row">
          <div class="col-12 col-sm-7">
            <q-input v-model="inputValue" class="col-12 col-sm-6 style"  type="number" outlined
              mask="#####" placeholder="کد امنیتی"
              :rules="[ val => val.length >= 5 || 'طول کد امنیتی نباید کمتر از 5  کاراکتر باشد']"/>
          </div>
          <div class="col-12 col-sm-5">
            <VueClientRecaptcha
            style="border: 2px solid #0000001f;width:100%"
                  :value="inputValue"
                  chars="123456789"
                  :hidelines="false"
                  custom-text-color="black"
                  @getCode="getCaptchaCode"
                  class=" rounded"
                  @isValid="checkValidCaptcha">
            </VueClientRecaptcha>
          </div>
     </div>
          </div>
          <div v-else class="row">
            <div class="col-12 col-sm-8">
              <q-input class="style" outlined hint="عنوان هتل/آژانس" v-model="hotelName"/>
            </div>
            <div class="col-12 col-sm-4 ">
              <SelectionInput style="margin-bottom: 14px!important;margin-top: 4px!important;"
                :option-list="orginazations"
                 hint="نوع سازمان"
                :show-selected="true"
                @on-update-model="setOrg"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input class="style" outlined hint="نام" v-model="fristName"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input class="style" outlined hint="نام خانوادگی" v-model="lastName"/>
            </div>
            <div class="col-12">
              <SelectionInput
                :option-list="cities"
                class="" hint="شهر"
                :show-selected="true"
                @on-update-model="setCity"/>
            </div>
            <div class="col-12 col-sm-6 q-pt-md">
              <q-input class="style" outlined hint="تلفن ثابت هتل/آژانس با کد شهر" v-model="hotelPhoneNumber"/>
            </div>
            <div class="col-12 col-sm-6 q-pt-md">
              <q-input class="style" outlined hint="تلفن همراه" v-model="phoneNumber"/>
            </div>
            <div class="col-12 q-pt-md">
              <q-input class="style" outlined hint="ایمیل هتل/آژانس" v-model="email"/>
            </div>
            <div class="col-12 q-pt-md">
              <q-input class="style" :type="isPwd ? 'password' : 'text'" outlined hint="رمز عبور" v-model="password">
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          </div>
        </template>
        <template #actions>
          <div class="row col-12 justify-center q-px-md">
            <!-- <q-btn v-if="login" unelevated dense color="primary" class="style" label="فراموشی کلمه عبور؟" flat/> -->
            <q-btn color="primary" unelevated type="submit"
             class="font-bold col-12 style" :label="login ? 'ورود':'ثبت نام'" :loading="loading"
            icon="login" size="lg"/>
          </div>
        </template>
        <template #extra-actions>

          <div class="row text-center justify-center col-12" style="margin-top:-5px!important;">
            <div class="h4 font-light col-12">{{ helpTip }}
            <q-btn dense size="md" unelevated flat color="primary" class="style font-regular"
             :label="helpTipButton" style="text-decoration: underline;margin-right: -3px!important;"
              @click="switchPage"/>
            </div>
          </div>
        </template>
      </login-signup-elements>
    </q-form>

      <div class="text-center row justify-center items-center">

        <div class="col-12 row justify-center">
          <q-btn unelevated dense size="md" flat color="positive"
          class="" label="تماس با پشتیبانی" icon-right="support_agent"
          @click="goToSupportPage"/>
        </div>
      </div>
      </div>
      <div class="col-12 col-sm-6" >
          <q-img :src="backgroundImage" fit="cover"  style="height:100%; width: 100%;margin:0!important"/>
      </div>
      <q-inner-loading :showing="loading">
          <q-spinner-gears size="10em" color="primary" />
      </q-inner-loading>
  </div>
</template>

<script>
/* eslint-disable */

import LoginSignupElements from 'src/components/Login/Login-Signup-Elements.vue'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
const loginImage = new URL('../../public/Login.jpg', import.meta.url).href
const signupImage = new URL('../../public/Signup.jpg', import.meta.url).href
import VueClientRecaptcha from 'vue-client-recaptcha'
import { removeNodeIds, setLastActiveTap, setPanelFaName, setPanelName, setPreferences } from 'src/stores/localStoreVariables'
import SelectionInput from 'src/components/Selection-Input.vue'
import { citiesApi } from 'src/stores/api'
import { setPanelVariables } from 'stores/panel'
import ForgetResetPassword from 'src/components/Login/Forget-Reset-Password.vue'

export default {
setup (props) {
  return {
    forgetPassword:ref(false),
    resetPassword:ref(false),
    $q: useQuasar(),
    loading: ref(false)
  }
},
data () {
  const $q = useQuasar()
  return {
    login: ref(true),
    isPwd: ref(true),
    loginImage,
    signupImage,
    username: ref(null),
    password: ref(null),
    emailOrPhone:ref(null),
    newPassword:ref(null),
    repeatNewPassword:ref(null),
    code:ref(null),
    email: ref(null),
    cityId: ref(null),
    hotelName: ref(null),
    fristName: ref(null),
    lastName: ref(null),
    phoneNumber: ref(null),
    hotelPhoneNumber: ref(null),
    cities: ref([]),
    orgType:ref(Boolean),
    orginazations:ref([{
    label:'هتل',
        value:0,
        isHotel:true
    },
    {
      label:'آژانس',
          value:1,
          isHotel:false
    }]),
    inputValue: null,
    isValidCaptcha: false,
    showNotify (message, type = 'positive') {
      $q.notify({
        timeout: 2000,
        progress: true,
        message,
        type,
        classes: 'h4 font-medium'
      })
    }
  }
},

components: {
  LoginSignupElements,
  ForgetResetPassword,
  SelectionInput,
  VueClientRecaptcha
},

methods: {
  goToSupportPage(){
    window.open('https://vhotel.ir/تماس-با-وی-هتل/','_blank')
  },
  switchPage () {
    this.login = !this.login
    if (!this.login) this.getCities()
    this.isPwd = true
  },
  switchPassword(){
    this.forgetPassword = !this.forgetPassword

  },
  toggleForgetPass(toggle){
    this.forgetPassword = toggle
  },
  async getCities () {
    await citiesApi.request('get',true)
      .then(res => {
        this.cities = []
        res.data.items.forEach(city => {
          this.cities.push({
            label: city.name,
            value: city.id
          })
        })
      })
  },

  setCity (city) {
    this.cityId = city.value
  },
  setOrg(org){
    this.orgType = org.isHotel

},
  onSubmit () {
    if(this.forgetPassword){
      this.forgetPasswordSubmit()

    }else if(this.resetPassword){
      this.resetPasswordSubmit()

    }else{
    localStorage.removeItem('centeralOffice')
    removeNodeIds()

    if (this.login) {
      this.loginSubmit()
    } else {
      this.registerSubmit()
    }
  }
  },
  async forgetPasswordSubmit(){
    if (this.emailOrPhone == null || this.emailOrPhone === ''){
       this.showNotify('لطفا شماره تلفن همراه خود را برای دریافت کد وارد کنید.', 'negative')
    }else if(this.emailOrPhone.length < 11 ) this.showNotify('شماره تلفن همراه صحیح نمی باشد!', 'negative')
    else{
      this.loading = true
      await api.post('/Identity/ForgetPassword',{emailOrPhone:this.emailOrPhone})
      .then((res)=>{
        this.resetPassword = true
        this.forgetPassword = false
        this.loading = false
        this.showNotify('کد تایید برای شما ارسال شد.', 'positive')
      }).catch((obj)=>{
        const data = obj.response.data.errorsList
        this.loading = false
        for (const k of data) {
          this.showNotify(k, 'negative')
        }
      })
    }

  },
  async resetPasswordSubmit(){
    if (this.code == null || this.code === ''){
       this.showNotify('لطفا کد ارسال شده را وارد کنید.', 'negative')
    }else if(this.code.length < 6 ) this.showNotify('کد وارد شده صحیح نمی باشد!', 'negative')
    else if(this.newPassword == null || this.newPassword === ''){
      this.showNotify('لطفا رمز عبور جدید را وارد کنید.', 'negative')
    }else if(this.newPassword.length < 6 ) this.showNotify('طول  رمز عبور نباید کمتر از 5  کاراکتر باشد!', 'negative')
    else if (this.newPassword !== this.repeatNewPassword) this.showNotify('رمز عبور ها برابر نیستند!', 'negative')
    else{
      this.loading = true
      await api.post('/Identity/ResetPassword',{
        emailOrPhone:this.emailOrPhone,
        code :this.code,
        newPassword:this.newPassword
      })
      .then((res)=>{
        this.showNotify('رمز عبور شما تغییر یافت! می توانید وارد حساب کاربری خود شوید.', 'positove')
        this.resetPassword = false
        this.forgetPassword = false
        this.login = true
        this.loading = false
      }).catch((obj)=>{
        const data = obj.response.data.errorsList
        this.loading = false
        for (const k of data) {
          this.showNotify(k, 'negative')
        }
      })
    }

  },

  async loginSubmit () {
    if (this.isValidCaptcha) {
      this.loading = true
       await api.post('/Identity/login', {
        email: this.username,
        password: this.password
      }).then(async response => {
        localStorage.removeItem('goTo')
        localStorage.removeItem('goToCO')
        const token = response.data.accessToken
        api.defaults.headers.common.Authorization = 'Bearer ' + token

        if (token != null) {
          if(response.data.panel === 'دفترمرکزی') {
            localStorage.setItem('centeralOffice', 'true')
            setPanelName('hotel')
            setPanelFaName('هتل')
          }else{
          await setPanelVariables(response.data.panel)
          }
          localStorage.setItem('token', token)
          setLastActiveTap('داشبورد')
          setPreferences(response.data.preferences || '{"theme":"true"}')
          await api.get('Role/GetMenuPermissions').then(response => {
            const rolesForPages = response.data
              .filter(i => i.checked)
              .map(i => ({
                description: i.description,
                icon: i.icon,
                link: i.link,
                nodeId: i.nodeId,
                children: i.children
              }))
            localStorage.setItem('essentialLinks', JSON.stringify(rolesForPages))
            this.showNotify('با موفقیت وارد شدید')
            this.$router.push('/admin')
          })
        } else {
          this.showNotify('خطا در ورود به حساب کاربری', 'negative')
        }
      }).catch(obj => {
        const data = obj.response.data.errorsList
        this.loading = false
        for (const k of data) {
          this.showNotify(k, 'negative')
        }
      })
    } else {
      this.showNotify('کد امنیتی صحیح نمی باشد', 'warning')
    }
  },

  async registerSubmit () {
    const data = {
      isHotel:this.orgType,
      email: this.email,
      password: this.password,
      cityId: this.cityId | 1,
      hotelName: this.hotelName,
      fristName: this.fristName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      hotelPhoneNumber: this.hotelPhoneNumber
    }
    await api.post('Identity/registeruserAndHotelByEmail', data)
      .then(response => {
        if (response.data.message != null) {
          this.showNotify(response.data.message)
          setLastActiveTap('داشبورد')

        }
      }).catch(error => {
        if (error.response != null) {
          error.response.data.errorsList.forEach(item => {
            this.showNotify(item, 'negative')
          })
        }
      })
  },
  getCaptchaCode (capthaResult) {
    // console.log(capthaResult)
  },
  checkValidCaptcha (capthaResult) {
    this.isValidCaptcha = capthaResult
  }
},
// mounted () {
//   localStorage.removeItem('opened-tabs')
// },

computed: {
  title () {
    return this.login ? 'ورود هتل/آژانس' : 'ثبت‌نام هتل/آژانس'
  },

  // header () {
  //   return this.login ? 'نام کاربری و کلمه عبور خود را وارد کنید' : 'برای ثبت‌نام، اطلاعات زیر را وارد کنید'
  // },

  helpTip () {
    return this.login ? 'ثبت نام نکرده اید؟' : 'حساب کاربری دارید؟'
  },

  helpTipButton () {
    return 'اینجا را کلیک کنید.'
  },

  backgroundImage () {
    return this.login ? this.loginImage : this.signupImage
  }
}
}
</script>
<style>
.vue_client_recaptcha_icon{
position: absolute;
}
</style>
