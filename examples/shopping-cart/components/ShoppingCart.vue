<template>
  <div class="cart">
    <h2>Your Cart</h2>
    <p v-show="!products.length"><i>Please add some products to cart.</i></p>
    <ul>
      <li v-for="product in products">
        {{ product.title }} - {{ product.price | currency }} x {{ product.quantity }}
      </li>
    </ul>
    <p>Total: {{ total | currency }}</p>
    <p>
      <button :disabled="!products.length" @click="checkout(products)">Checkout</button>
    </p>
    <p v-show="checkoutStatus">Checkout {{ checkoutStatus }}.</p>
  </div>
</template>

<script>
  import {action, state, service} from 'vuexs'

  export default {
    name: 'ShoppingCart',

    @state('cartService')
    'cartServiceStates': {
      products: 'cartProducts',
      checkoutStatus: 'checkoutStatus',
      total: 'cartTotalPrice'
    },

    @service
    cartService: 'cartService',

    created(){

    },
    methods: {
      checkout(products) {
        this.cartService.checkout(products)
      }
    }
  }
</script>
