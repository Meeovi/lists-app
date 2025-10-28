<template>
    <div>
        <section data-bs-version="5.1" class="header1 cid-v0HengyO4j" id="header01-0">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-12 col-lg-8 image-wrapper">
                        <img class="w-100" src="assets/images/8.jpg" alt="Mobirise Website Builder">
                    </div>
                    <div class="col-12 col-lg col-md-12">
                        <div class="text-wrapper align-left">
                            <h1 class="mbr-section-title mbr-fonts-style mb-4 display-2">
                                <strong>{{ page?.name }}</strong>
                            </h1>
                            <p class="mbr-text mbr-fonts-style mb-4 display-7" v-html="page?.content"></p>
                            <createList class="mbr-section-btn mt-3 mobi-mbri mobi-mbri-plus mbr-iconfont mbr-iconfont-btn" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <RelatedLists />

        <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
            <v-toolbar color="transparent">
                <v-toolbar-title>{{ page?.repeaterTextBox?.[1]?.name }}</v-toolbar-title>
            </v-toolbar>
            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(list, index) in myLists"
                    :key="index">
                    <listCard :class="['ma-4', selectedClass]" :list="list" v-if="isSelected" @click="toggle" />
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
            <v-toolbar color="transparent">
                <v-toolbar-title>{{ page?.repeaterTextBox?.[2]?.name }}</v-toolbar-title>
            </v-toolbar>
            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(list, index) in myLists"
                    :key="index">
                    <listCard :class="['ma-4', selectedClass]" :list="list" v-if="isSelected" @click="toggle" />
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import listCard from '~/components/related/list.vue'
    import RelatedLists from '~/components/related/relatedlists.vue'
    import createList from '~/components/related/add-list.vue'
    import {
        useUserStore
    } from '~/stores/user'

    const userStore = useUserStore()
    const userDisplayName = computed(() => {
        return userStore.user?.name || userStore.user?.username || 'User'
    })

    const model = ref(null)

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: lists
    } = await useAsyncData('lists', () => {
        return $directus.request($readItems('lists', {
            filter: {
                status: {
                    _eq: 'public'
                }
            },
        }))
    })

    const {
        data: myLists
    } = await useAsyncData('myLists', () => {
        return $directus.request($readItems('lists', {
            filter: {
                user: {
                    _eq: userDisplayName.value,
                }
            },
        }))
    })

    const {
        data: bookmarks
    } = await useAsyncData('bookmarks', () => {
        return $directus.request($readItems('lists', {
            filter: {
                creator: {
                    _eq: userDisplayName.value,
                },
                type: {
                    _eq: "bookmark",
                }
            },
        }))
    })

    const {
        data: page
    } = await useAsyncData('page', () => {
        return $directus.request($readItems('pages', {
            filter: {
                id: {
                    _eq: 40
                }
            },
            fields: ['*'],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })

    useHead({
        title: 'Meeovi Tasks'
    })
</script>