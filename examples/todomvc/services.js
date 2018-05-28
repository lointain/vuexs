export const STORAGE_KEY = 'todos-vuejs'

export default {
  'todoService': {
    name: 'todoService',
    state: {
      todos: JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    },
    watch: {
      todos: function (todos) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      }
    },
    actions: {
      addTodo(text) {
        this.todos.push({
          text,
          done: false
        })
      },

      deleteTodo(todo) {
        this.todos.splice(this.todos.indexOf(todo), 1)
      },

      toggleTodo(todo) {
        todo.done = !todo.done
      },

      editTodo(todo, value) {
        todo.text = value
      },

      toggleAll(done) {
        this.todos.forEach((todo) => {
          todo.done = done
        })
      },

      clearCompleted(state) {
        this.todos = this.todos.filter(todo => !todo.done)
      }
    }
  }
}
