<template>
    <v-card color="primary" variant="flat" class="mx-auto">
        <v-card-item>
            <div>
                <div class="text-overline mb-1">
                    {{ bookmark?.name }}
                </div>
                <div class="text-h6 mb-1">
                    {{ bookmark?.type }}
                </div>
                <div class="text-caption"><p v-html="bookmark?.description"></p></div>
            </div>
        </v-card-item>

        <v-card-actions>
            <v-btn :href="bookmark?.url" :title="`Visit ${bookmark?.name}`" target="_blank" rel="noopener" color="primary" variant="text">
                View
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    const props = defineProps({
        bookmark: {
            type: Object,
            required: true,
        },
    });
</script>