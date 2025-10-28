<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4">My Lists</h1>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
            Create List
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="all">All Lists</v-tab>
          <v-tab value="default">Lists</v-tab>
          <v-tab value="playlist">Playlists</v-tab>
          <v-tab value="wishlist">Wishlists</v-tab>
          <v-tab value="bookmarks">Bookmarks</v-tab>
          <v-tab value="tasks">Tasks</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Lists Grid -->
    <v-row>
      <v-col v-for="list in filteredLists" :key="list.id" cols="12" sm="6" md="4" lg="3">
        <Lists :list="list" @edit="editList" @share="shareList" @delete="deleteList" />
      </v-col>

      <v-col cols="12" v-if="filteredLists.length === 0">
        <v-card class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-format-list-bulleted</v-icon>
          <h3 class="text-h6 mt-4 mb-2">No lists found</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Create your first list to get started
          </p>
          <v-btn color="primary" @click="showCreateDialog = true">
            Create List
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create List Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create New List</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="formValid">
            <v-text-field v-model="newList.name" label="List Name" :rules="[v => !!v || 'Name is required']" required />

            <v-textarea v-model="newList.description" label="Description (optional)" rows="3" />

            <v-select v-model="newList.type" :items="listTypes" label="List Type" item-title="label" item-value="value"
              :rules="[v => !!v || 'Type is required']" required />

            <v-select v-model="newList.visibility" :items="visibilityOptions" label="Visibility" item-title="label"
              item-value="value" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!formValid" :loading="creating" @click="createNewList">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete List</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ listToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  const {
    getUserLists,
    createList,
    deleteList: deleteListApi
  } = useLists()

  const lists = ref([])
  const activeTab = ref('all')
  const showCreateDialog = ref(false)
  const showDeleteDialog = ref(false)
  const formValid = ref(false)
  const creating = ref(false)
  const deleting = ref(false)
  const listToDelete = ref(null)

  const newList = ref({
    name: '',
    description: '',
    type: 'default',
    visibility: 'private'
  })

  const listTypes = [{
      label: 'Default List',
      value: 'default'
    },
    {
      label: 'Playlist',
      value: 'playlist'
    },
    {
      label: 'Wishlist',
      value: 'wishlist'
    },
    {
      label: 'Bookmarks',
      value: 'bookmarks'
    },
    {
      label: 'Tasks',
      value: 'tasks'
    }
  ]

  const visibilityOptions = [{
      label: 'Private',
      value: 'private'
    },
    {
      label: 'Public',
      value: 'public'
    }
  ]

  const filteredLists = computed(() => {
    if (activeTab.value === 'all') return lists.value
    return lists.value.filter(list => list.type === activeTab.value)
  })

  const loadLists = async () => {
    try {
      lists.value = await getUserLists()
    } catch (error) {
      console.error('Failed to load lists:', error)
    }
  }

  const createNewList = async () => {
    if (!formValid.value) return

    creating.value = true
    try {
      await createList(newList.value)
      showCreateDialog.value = false
      newList.value = {
        name: '',
        description: '',
        type: 'default',
        visibility: 'private'
      }
      await loadLists()
    } catch (error) {
      console.error('Failed to create list:', error)
    } finally {
      creating.value = false
    }
  }

  const editList = (list) => {
    // Navigate to edit page or show edit dialog
    navigateTo(`/list/${list.id}/edit`)
  }

  const shareList = (list) => {
    // Copy share URL to clipboard
    const shareUrl = `${window.location.origin}/list/${list.id}`
    navigator.clipboard.writeText(shareUrl)
    // Show success message
  }

  const deleteList = (list) => {
    listToDelete.value = list
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!listToDelete.value) return

    deleting.value = true
    try {
      await deleteListApi(listToDelete.value.id)
      showDeleteDialog.value = false
      listToDelete.value = null
      await loadLists()
    } catch (error) {
      console.error('Failed to delete list:', error)
    } finally {
      deleting.value = false
    }
  }

  onMounted(() => {
    loadLists()
  })
</script>