<template>
    <div>
        <div v-if="page?.slug === 'all-my-lists'"><lists /></div>
        <div v-else-if="page?.slug === 'my-bookmarks'"><bookmarks /></div>
        <div v-else-if="page?.slug === 'my-starred-lists'"><starred /></div>
        <div v-else-if="page?.slug === 'archived-lists'"><archived /></div>

        <div v-else><errorPage /></div>
    </div>
</template>

<script setup>
    import lists from '@/components/features/lists.vue'
    import bookmarks from '@/components/features/bookmarks.vue'
    import starred from '@/components/features/starred.vue'
    import archived from '@/components/features/archived.vue'
    import errorPage from '~/pages/error.vue'

    const route = useRoute();
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: page
    } = await useAsyncData('page', () => {
        return $directus.request($readItems('pages', {
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
            fields: ['*'],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })
     
    useHead({
        title: page?.value?.name || 'Page',
    })
</script>