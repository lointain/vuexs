<style src="todomvc-app-css/index.css"></style>

<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <h1>todos</h1>
      <input class="new-todo"
             autofocus
             autocomplete="off"
             placeholder="What needs to be done?"
             @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section class="main" v-show="todoService.todos.length">
      <input class="toggle-all" id="toggle-all"
             type="checkbox"
             :checked="allChecked"
             @change="todoService.toggleAll(!allChecked)">
      <label for="toggle-all"></label>
      <ul class="todo-list">
        <todo v-for="(todo, index) in filteredTodos" :key="index" :todo="todo"></todo>
      </ul>
    </section>
    <!-- footer -->
    <footer class="footer" v-show="todoService.todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('item') }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters">
          <a :href="'#/' + key"
             :class="{ selected: visibility === key }"
             @click="visibility = key">{{ key | capitalize }}</a>
        </li>
      </ul>
      <button class="clear-completed"
              v-show="todoService.todos.length > remaining"
              @click="todoService.clearCompleted">
        Clear completed
      </button>
    </footer>
  </section>
</template>

<script>
  import {action, state, service} from 'vuexs'
  import Todo from './Todo.vue'

  const filters = {
    all: todos => todos,
    active: todos => todos.filter(todo => !todo.done),
    completed: todos => todos.filter(todo => todo.done)
  }

  export default {
    name: 'App',
    components: {Todo},

    @service
    todoService: 'todoService',

    data() {
      return {
        visibility: 'all',
        filters: filters
      }
    },
    computed: {
      allChecked() {
        return this.todoService.todos.every(todo => todo.done)
      },
      filteredTodos() {
        return filters[this.visibility](this.todoService.todos)
      },
      remaining() {
        return this.todoService.todos.filter(todo => !todo.done).length
      }
    },
    methods: {
      addTodo(e) {
        var text = e.target.value
        if (text.trim()) {
          this.todoService.addTodo(text)
        }
        e.target.value = ''
      }
    },
    filters: {
      pluralize: (n, w) => n === 1 ? w : (w + 's'),
      capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
    }
  }
</script>
