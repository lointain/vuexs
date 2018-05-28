<template>
  <ul>
    <li v-for="product in products">
      {{ product.title }} - {{ product.price | currency }}[{{product.inventory}}]
      <br>
      <button
        :disabled="!product.inventory"
        @click="addProductToCart(product)">
        Add to cart
      </button>
    </li>
  </ul>
</template>

<script>

  import {action, state, service} from 'vuexs'

  export default {
    name: 'ProductList',

    @state('productsService')
    'productsServiceStates': {
      products: 'allProducts',
    },

    @action('cartService')
    'cartServiceActions': {
      addProductToCart: 'addProductToCart',
    },

    @service
    productsService: 'productsService',

    created() {
      this.productsService.getAllProducts()
    }
  }
</script>
