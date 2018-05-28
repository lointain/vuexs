import shop from "../api/shop";

export default {
  name: 'productsService',
  state: {
    all: [],
    allProducts() {
      return this.all
    }
  },
  actions: {
    getAllProducts() {
      shop.getProducts(products => {
        this.setProducts(products)
      })
    },
    setProducts(products) {
      this.all = products
    },

    decrementProductInventory({id}) {
      const product = this.all.find(product => product.id === id)
      product.inventory--
    }
  },
  watch: {}
}
