<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          نرم افزار صندوق
        </q-toolbar-title>

        <!-- <q-btn dense flat round icon="menu" @click="toggleRightDrawer" /> -->
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered >
      <q-list>
        <q-item-label
          header
        >
          صفحات
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

defineOptions({
  name: 'MainLayout'
})

const linksList = [
  {
    title: 'حساب ها',
    icon: 'school',
    link: '#/'
  },
  {
    title: 'وام ها',
    icon: 'code',
    link: '#/loans'
  },
  {
    title: 'اقساط و ماهیانه',
    icon: 'chat',
    link: '#/transactions'
  },
  {
    title: 'دفترتلفن',
    icon: 'record_voice_over',
    link: '#/members'
  },
  {
    title: 'مدیریت حساب ها',
    icon: 'rss_feed',
    link: '#/fund_accounts'
  }
]

const rightDrawerOpen = ref(true)

function toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
</script>
