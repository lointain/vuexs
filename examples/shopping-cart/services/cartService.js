import {state, action, service} from 'vuexs'
import shop from "../api/shop"

export default {
  name: 'cartService',

  @service
  productsService: 'productsService',

  @state('productsService')
  'productsServiceStates': {
    all: 'all',
  },

  @action('productsService')
  'productsServiceActions': {
    decrementProductInventory: 'decrementProductInventory',
  },

  state: {
    added: [],
    checkoutStatus: null,
    cartProducts() {
      const self = this
      return self.added.map(({id, quantity}) => {
        const product = self.all.find(product => product.id === id)
        return {
          title: product.title,
          price: product.price,
          quantity
        }
      })
    },
    cartTotalPrice() {
      const self = this
      return self.cartProducts.reduce((total, product) => {
        return total + product.price * product.quantity
      }, 0)
    }
  },
  actions: {
    checkout(products) {
      const savedCartItems = [...this.added]
      this.setCheckoutStatus()
      // empty cart
      this.setCartItems({items: []})
      shop.buyProducts(
        products,
        () => this.setCheckoutStatus('successful'),
        () => {
          this.setCheckoutStatus('failed')
          // rollback to the cart saved before sending the request
          this.setCartItems({items: savedCartItems})
        }
      )
    },
    addProductToCart(product) {
      // debugger
      const self = this
      this.setCheckoutStatus(null)
      if (product.inventory > 0) {
        const cartItem = this.added.find(item => item.id === product.id)
        if (!cartItem) {
          this.pushProductToCart({id: product.id})
        } else {
          this.incrementItemQuantity(cartItem)
        }
        // remove 1 item from stock
        self.decrementProductInventory({id: product.id})
      }
    },
    pushProductToCart({id}) {
      this.added.push({
        id,
        quantity: 1
      })
    },
    incrementItemQuantity({id}) {
      const cartItem = this.added.find(item => item.id === id)
      cartItem.quantity++
    },
    setCartItems({items}) {
      this.added = items
    },
    setCheckoutStatus(status) {
      this.checkoutStatus = status
    }
  }
}
