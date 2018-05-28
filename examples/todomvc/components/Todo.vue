<template>
  <li class="todo" :class="{ completed: todo.done, editing: editing }">
    <div class="view">
      <input class="toggle"
             type="checkbox"
             :checked="todo.done"
             @change="toggleTodo(todo)">
      <label v-text="todo.text" @dblclick="editing = true"></label>
      <button class="destroy" @click="deleteTodo(todo)"></button>
    </div>
    <input class="edit"
           v-show="editing"
           v-focus="editing"
           :value="todo.text"
           @keyup.enter="doneEdit"
           @keyup.esc="cancelEdit"
           @blur="doneEdit">
  </li>
</template>

<script>
  import {action} from 'vuexs'

  export default {
    name: 'Todo',
    props: ['todo'],

    @action('todoService')
    'todoServiceActions': {
      editTodo: 'editTodo',
      toggleTodo: 'toggleTodo',
      deleteTodo: 'deleteTodo'
    },

    data() {
      return {
        editing: false
      }
    },
    directives: {
      focus(el, {value}, {context}) {
        if (value) {
          context.$nextTick(() => {
            el.focus()
          })
        }
      }
    },
    methods: {
      doneEdit(e) {
        const value = e.target.value.trim()
        const {todo} = this
        if (!value) {
          this.deleteTodo(todo)
        } else if (this.editing) {
          this.editTodo(todo, value)
          this.editing = false
        }
      },
      cancelEdit(e) {
        e.target.value = this.todo.text
        this.editing = false
      }
    }
  }
</script>
