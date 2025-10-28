<template>
  <v-container fluid>
    <div v-if="pending" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    
    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error">Failed to load list</v-alert>
    </div>
    
    <div v-else-if="list">
      <!-- List Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn icon @click="$router.back()" class="me-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            
            <div class="flex-grow-1">
              <div class="d-flex align-center">
                <v-icon :icon="getListIcon(list.type)" :color="getListColor(list.type)" class="me-2" />
                <h1 class="text-h4">{{ list.name }}</h1>
                <v-chip 
                  :color="list.visibility === 'public' ? 'success' : 'default'"
                  class="ml-3"
                  variant="outlined"
                >
                  {{ list.visibility }}
                </v-chip>
              </div>
              
              <p v-if="list.description" class="text-body-1 text-medium-emphasis mt-2">
                {{ list.description }}
              </p>
            </div>
            
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              Add Item
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Media Player for Playlists -->
      <v-row v-if="list.type === 'playlist' && mediaItems.length > 0" class="mb-4">
        <v-col cols="12">
          <MediaPlayer :playlist="mediaItems" :autoplay="false" />
        </v-col>
      </v-row>

      <!-- List Items -->
      <v-row>
        <v-col cols="12">
          <div v-if="list.items?.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">{{ getListIcon(list.type) }}</v-icon>
            <h3 class="text-h6 mt-4 mb-2">No items yet</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Add your first item to get started
            </p>
            <v-btn color="primary" @click="showAddDialog = true">
              Add Item
            </v-btn>
          </div>
          
          <div v-else>
            <!-- Task Items -->
            <div v-if="list.type === 'tasks'">
              <TaskItem
                v-for="item in list.items"
                :key="item.id"
                :task="item.content"
                @update="updateTask(item.id, $event)"
                @edit="editItem(item)"
                @duplicate="duplicateItem(item)"
                @delete="deleteItem(item.id)"
              />
            </div>
            
            <!-- Other List Types -->
            <v-row v-else>
              <v-col
                v-for="item in list.items"
                :key="item.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <ListItemCard
                  :item="item"
                  :list-type="list.type"
                  @edit="editItem(item)"
                  @delete="deleteItem(item.id)"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Add Item Dialog -->
    <AddItemDialog
      v-model="showAddDialog"
      :list-type="list?.type"
      :list-id="list?.id"
      @added="refreshList"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()
const { getListById, updateListItem, removeFromList } = useLists()

const showAddDialog = ref(false)

const { data: list, pending, error, refresh: refreshList } = await useAsyncData(
  `list-${route.params.id}`,
  () => getListById(route.params.id)
)

const mediaItems = computed(() => {
  if (list.value?.type !== 'playlist') return []
  return list.value.items?.filter(item => 
    item.content.type === 'media' && 
    ['audio', 'video'].includes(item.content.media_type)
  ).map(item => item.content) || []
})

const getListIcon = (type) => {
  const icons = {
    default: 'mdi-format-list-bulleted',
    playlist: 'mdi-playlist-music',
    wishlist: 'mdi-heart',
    bookmarks: 'mdi-bookmark',
    tasks: 'mdi-check-circle'
  }
  return icons[type] || icons.default
}

const getListColor = (type) => {
  const colors = {
    default: 'primary',
    playlist: 'purple',
    wishlist: 'pink',
    bookmarks: 'orange',
    tasks: 'green'
  }
  return colors[type] || colors.default
}

const updateTask = async (itemId, taskData) => {
  try {
    await updateListItem(itemId, { content: taskData })
    await refreshList()
  } catch (error) {
    console.error('Failed to update task:', error)
  }
}

const editItem = (item) => {
  // Handle edit functionality
  console.log('Edit item:', item)
}

const duplicateItem = (item) => {
  // Handle duplicate functionality
  console.log('Duplicate item:', item)
}

const deleteItem = async (itemId) => {
  try {
    await removeFromList(itemId)
    await refreshList()
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}

useHead({
  title: computed(() => list.value?.name || 'List')
})

definePageMeta({
  middleware: ['authenticated']
})
</script>