import { defineStore } from 'pinia'

export interface Post {
  id: string
  title: string
  body: string
  createdAt: string
}

interface PostsState {
  items: Post[]
  current: Post | null
  loading: boolean
  error: string | null
}

export const usePostsStore = defineStore('posts', {
  state: (): PostsState => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),

  getters: {
    count: (state) => state.items.length,
    findById: (state) => (id: string) => state.items.find((p) => p.id === id),
  },

  actions: {
    async fetchAll() {
      this._begin()
      try {
        const { $api } = useNuxtApp()
        this.items = await ($api as typeof $fetch)<Post[]>('/posts')
      } catch (e) {
        this._fail(e)
      } finally {
        this._end()
      }
    },

    async fetchOne(id: string) {
      this._begin()
      try {
        const { $api } = useNuxtApp()
        this.current = await ($api as typeof $fetch)<Post>(`/posts/${id}`)
      } catch (e) {
        this._fail(e)
      } finally {
        this._end()
      }
    },

    async create(payload: Pick<Post, 'title' | 'body'>) {
      this._begin()
      try {
        const { $api } = useNuxtApp()
        const created = await ($api as typeof $fetch)<Post>('/posts', {
          method: 'POST',
          body: payload,
        })
        this.items.push(created)
        return created
      } catch (e) {
        this._fail(e)
      } finally {
        this._end()
      }
    },

    async update(id: string, payload: Partial<Pick<Post, 'title' | 'body'>>) {
      this._begin()
      try {
        const { $api } = useNuxtApp()
        const updated = await ($api as typeof $fetch)<Post>(`/posts/${id}`, {
          method: 'PATCH',
          body: payload,
        })
        const index = this.items.findIndex((p) => p.id === id)
        if (index !== -1) this.items[index] = updated
        if (this.current?.id === id) this.current = updated
        return updated
      } catch (e) {
        this._fail(e)
      } finally {
        this._end()
      }
    },

    async remove(id: string) {
      this._begin()
      try {
        const { $api } = useNuxtApp()
        await ($api as typeof $fetch)(`/posts/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((p) => p.id !== id)
        if (this.current?.id === id) this.current = null
      } catch (e) {
        this._fail(e)
      } finally {
        this._end()
      }
    },

    _begin() {
      this.loading = true
      this.error = null
    },

    _end() {
      this.loading = false
    },

    _fail(e: unknown) {
      this.error = (e as any)?.data?.message ?? (e as any)?.message ?? 'An error occurred'
    },
  },
})
