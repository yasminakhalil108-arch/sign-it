/**
 * Threading & Messaging Manager
 * Handles threads, messages, and AI summarization
 */

class ThreadManager {
  constructor() {
    this.supabase = window.supabase || null
    this.currentUser = null
    this.init()
  }

  async init() {
    try {
      if (!this.supabase) {
        console.error('❌ Supabase not initialized')
        return
      }
      
      const { data } = await this.supabase.auth.getUser()
      this.currentUser = data.user
      console.log('✅ ThreadManager initialized for:', this.currentUser?.email)
    } catch (error) {
      console.error('ThreadManager init error:', error)
    }
  }

  // Create a new thread (1:1 or group)
  async createThread(title, description, threadType = 'individual', memberIds = []) {
    try {
      if (!this.currentUser) throw new Error('Not authenticated')

      // Create thread
      const { data: thread, error: threadErr } = await this.supabase
        .from('threads')
        .insert({
          title,
          description,
          thread_type: threadType,
          created_by: this.currentUser.id
        })
        .select()
        .single()

      if (threadErr) throw threadErr

      // Add creator as member
      await this.addThreadMember(thread.id, this.currentUser.id, 'admin')

      // Add other members if provided
      for (const memberId of memberIds) {
        await this.addThreadMember(thread.id, memberId, 'member')
      }

      console.log('✅ Thread created:', thread.id)
      return thread
    } catch (error) {
      console.error('Create thread error:', error)
      throw error
    }
  }

  // Add member to thread
  async addThreadMember(threadId, userId, role = 'member') {
    try {
      const { data, error } = await this.supabase
        .from('thread_members')
        .insert({
          thread_id: threadId,
          user_id: userId,
          role
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Member added to thread')
      return data
    } catch (error) {
      console.error('Add member error:', error)
      throw error
    }
  }

  // Get all user's threads
  async getUserThreads() {
    try {
      if (!this.currentUser) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('thread_members')
        .select('threads(id, title, description, thread_type, created_at)')
        .eq('user_id', this.currentUser.id)
        .order('joined_at', { ascending: false })

      if (error) throw error
      
      return data.map(tm => tm.threads).filter(Boolean)
    } catch (error) {
      console.error('Get threads error:', error)
      throw error
    }
  }

  // Get thread details with messages
  async getThreadMessages(threadId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get messages error:', error)
      throw error
    }
  }

  // Send a message
  async sendMessage(threadId, content) {
    try {
      if (!this.currentUser) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          user_id: this.currentUser.id,
          content
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Message sent')
      return data
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }

  // Subscribe to real-time messages
  subscribeToMessages(threadId, callback) {
    try {
      const subscription = this.supabase
        .channel(`thread:${threadId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `thread_id=eq.${threadId}`
          },
          (payload) => {
            console.log('📨 New message:', payload.new)
            callback(payload.new)
          }
        )
        .subscribe()

      return subscription
    } catch (error) {
      console.error('Subscribe error:', error)
      throw error
    }
  }

  // Get thread summaries for current user
  async getThreadSummaries(threadId) {
    try {
      if (!this.currentUser) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('message_summaries')
        .select('*')
        .eq('thread_id', threadId)
        .eq('summary_for_user', this.currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get summaries error:', error)
      throw error
    }
  }

  // Call Edge Function to generate summary
  async generateSummary(threadId, focusArea = 'general') {
    try {
      if (!this.currentUser) throw new Error('Not authenticated')

      const token = (await this.supabase.auth.getSession()).data.session?.access_token
      if (!token) throw new Error('No access token')

      const response = await fetch(
        `${Deno.env.get('VITE_SUPABASE_URL') || 'https://vpwpafsqmnuogsoivfid.supabase.co'}/functions/v1/summarize-thread-openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            thread_id: threadId,
            summary_for_user: this.currentUser.id,
            focus_area: focusArea,
            limit: 100
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate summary')
      }

      const result = await response.json()
      console.log('✅ Summary generated:', result)
      return result
    } catch (error) {
      console.error('Generate summary error:', error)
      throw error
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      console.log('✅ Message deleted')
      return true
    } catch (error) {
      console.error('Delete message error:', error)
      throw error
    }
  }

  // Update thread title
  async updateThreadTitle(threadId, title) {
    try {
      const { data, error } = await this.supabase
        .from('threads')
        .update({ title, updated_at: new Date() })
        .eq('id', threadId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Thread updated')
      return data
    } catch (error) {
      console.error('Update thread error:', error)
      throw error
    }
  }

  // Get thread members
  async getThreadMembers(threadId) {
    try {
      const { data, error } = await this.supabase
        .from('thread_members')
        .select('user_id, role, joined_at')
        .eq('thread_id', threadId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get members error:', error)
      throw error
    }
  }
}

// Initialize on page load
let threadManager = null
document.addEventListener('DOMContentLoaded', () => {
  threadManager = new ThreadManager()
})

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreadManager
}
