<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title>Add Item to {{ formatListType(listType) }}</v-card-title>
      
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Common Fields -->
          <v-text-field
            v-model="itemData.title"
            label="Title"
            :rules="[v => !!v || 'Title is required']"
            required
          />
          
          <v-text-field
            v-model="itemData.url"
            label="URL"
            type="url"
          />
          
          <!-- Media-specific fields -->
          <div v-if="listType === 'playlist'">
            <v-select
              v-model="itemData.media_type"
              :items="['audio', 'video']"
              label="Media Type"
              :rules="[v => !!v || 'Media type is required']"
              required
            />
            
            <v-text-field
              v-model="itemData.thumbnail"
              label="Thumbnail URL"
            />
            
            <v-text-field
              v-model.number="itemData.duration"
              label="Duration (seconds)"
              type="number"
            />
            
            <v-text-field
              v-model="itemData.artist"
              label="Artist"
            />
          </div>
          
          <!-- Wishlist-specific fields -->
          <div v-if="listType === 'wishlist'">
            <v-text-field
              v-model.number="itemData.price"
              label="Price"
              type="number"
              step="0.01"
              prefix="$"
            />
            
            <v-select
              v-model="itemData.priority"
              :items="['low', 'medium', 'high']"
              label="Priority"
            />
            
            <v-text-field
              v-model="itemData.category"
              label="Category"
            />
          </div>
          
          <!-- Bookmark-specific fields -->
          <div v-if="listType === 'bookmarks'">
            <v-combobox
              v-model="itemData.tags"
              label="Tags"
              multiple
              chips
              hint="Press Enter to add tags"
            />
          </div>
          
          <!-- Task-specific fields -->
          <div v-if="listType === 'tasks'">
            <v-select
              v-model="itemData.priority"
              :items="['low', 'medium', 'high']"
              label="Priority"
            />
            
            <v-text-field
              v-model="itemData.due_date"
              label="Due Date"
              type="date"
            />
            
            <v-combobox
              v-model="itemData.labels"
              label="Labels"
              multiple
              chips
            />
          </div>
          
          <v-textarea
            v-model="itemData.description"
            label="Description"
            rows="3"
          />
          
          <v-text-field
            v-model="itemData.image"
            label="Image URL"
          />
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="loading"
          @click="addItem"
        >
          Add Item
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  listType: String,
  listId: String
})

const emit = defineEmits(['update:modelValue', 'added'])

const { addToList } = useLists()

const valid = ref(false)
const loading = ref(false)
const form = ref(null)

const itemData = ref({
  title: '',
  description: '',
  url: '',
  image: '',
  // Media fields
  media_type: 'audio',
  thumbnail: '',
  duration: null,
  artist: '',
  // Wishlist fields
  price: null,
  priority: 'medium',
  category: '',
  // Bookmark fields
  tags: [],
  // Task fields
  labels: [],
  due_date: ''
})

const formatListType = (type) => {\n  const types = {\n    default: 'List',\n    playlist: 'Playlist',\n    wishlist: 'Wishlist',\n    bookmarks: 'Bookmarks',\n    tasks: 'Tasks'\n  }\n  return types[type] || 'List'\n}

const addItem = async () => {
  if (!valid.value) return
  
  loading.value = true
  try {\n    let contentData = {\n      type: getContentType(props.listType),\n      title: itemData.value.title,\n      description: itemData.value.description,\n      url: itemData.value.url,\n      image: itemData.value.image\n    }\n\n    // Add type-specific data\n    if (props.listType === 'playlist') {\n      contentData = {\n        ...contentData,\n        media_type: itemData.value.media_type,\n        thumbnail: itemData.value.thumbnail,\n        duration: itemData.value.duration,\n        metadata: {\n          artist: itemData.value.artist\n        }\n      }\n    } else if (props.listType === 'wishlist') {\n      contentData = {\n        ...contentData,\n        type: 'product',\n        price: itemData.value.price,\n        priority: itemData.value.priority,\n        category: itemData.value.category\n      }\n    } else if (props.listType === 'bookmarks') {\n      contentData = {\n        ...contentData,\n        type: 'bookmark',\n        tags: itemData.value.tags,\n        read: false,\n        archived: false\n      }\n    } else if (props.listType === 'tasks') {\n      contentData = {\n        ...contentData,\n        type: 'task',\n        completed: false,\n        priority: itemData.value.priority,\n        due_date: itemData.value.due_date,\n        labels: itemData.value.labels,\n        subtasks: []\n      }\n    }\n\n    await addToList(props.listId, contentData)\n    emit('added')\n    emit('update:modelValue', false)\n    resetForm()\n  } catch (error) {\n    console.error('Failed to add item:', error)\n  } finally {\n    loading.value = false\n  }\n}\n\nconst getContentType = (listType) => {\n  const types = {\n    playlist: 'media',\n    wishlist: 'product',\n    bookmarks: 'bookmark',\n    tasks: 'task',\n    default: 'item'\n  }\n  return types[listType] || 'item'\n}\n\nconst resetForm = () => {\n  itemData.value = {\n    title: '',\n    description: '',\n    url: '',\n    image: '',\n    media_type: 'audio',\n    thumbnail: '',\n    duration: null,\n    artist: '',\n    price: null,\n    priority: 'medium',\n    category: '',\n    tags: [],\n    labels: [],\n    due_date: ''\n  }\n  form.value?.reset()\n}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>