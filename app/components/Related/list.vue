<template>
    <div>
        <div class="item-wrapper">
            <div class="item-img">
                <img v-if="list?.image" :src="`${$directus.url}assets/${list?.image?.filename_disk}`" :alt="list?.name" />
                <img v-else src="assets/images/shop1.jpg" :alt="list?.name" />
            </div>
            <div class="item-content">
                <h5 class="item-title mbr-fonts-style display-5">
                    <strong>{{ list?.name }}</strong>
                </h5>
                <p class="mbr-text mbr-fonts-style display-7" v-html="list?.description"></p>
                <div class="mbr-section-btn item-footer">
                    <NuxtLink :to="`/list/${list?.id}`" class="btn item-btn btn-primary display-7">View</NuxtLink>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        list: {
            type: Object,
            required: true,
        },
    });
</script>