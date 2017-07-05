document.addEventListener('DOMContentLoaded', () => {
  const vm = {};
  vm.albums = ko.observableArray();
  vm.albumsInShoppingCart = ko.observableArray();
  vm.albumTitle = ko.observable('');
  vm.total = ko.observable(0);
  vm.grandTotal = ko.observable(0);
  vm.price = 9.99;
  vm.discount = ko.observable(0);

  vm.formattedPriceTotal = ko.computed(() => "EUR " + vm.total().toFixed(2));
  vm.formattedPriceGrandTotal = ko.computed(() => "EUR " + vm.grandTotal().toFixed(2));
  vm.formattedPriceDiscount = ko.computed(() => "- EUR " + vm.discount().toFixed(2));
  vm.formattedPriceRegular = ko.computed(() => "EUR " + vm.price.toFixed(2));

  vm.searchAlbumsByTitle = () => {
    fetch(`http://localhost:3000/api/albums/${vm.albumTitle()}`)
      .then(result => result.json())
      .then(albums => {
        return vm.albums(albums);
      })
  }

  const loadAlbumsFromShoppingCart = () => {
    fetch('http://localhost:3000/api/shoppingcart')
      .then(result => result.json())
      .then(albums => {
        vm.albumsInShoppingCart(albums);
        const total = albums.length * vm.price;
        vm.total(total);
        const discount = vm.albumsInShoppingCart().length >= 3 ? total * 0.03 : 0;
        vm.discount(discount)
        vm.grandTotal(total - discount);
      });
  }

  loadAlbumsFromShoppingCart();

  vm.addAlbumToCart = album => {
    fetch('http://localhost:3000/api/shoppingcart',
      {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${album.title}&price=${vm.price}`
      })
      .then(result =>
        result.json())
      .then(addedAlbum => {
        vm.albumsInShoppingCart.push(addedAlbum);
        vm.total(vm.total() + vm.price);
        const discount = vm.albumsInShoppingCart().length >= 3 ? vm.total() * 0.03 : 0;
        vm.discount(discount);
        vm.grandTotal(vm.total() - discount);
      })
  }

  vm.removeAlbumFromCart = album => {
    fetch(`http://localhost:3000/api/shoppingcart/${album._id}`,
      {
        method: "DELETE",
      })
      .then(result => result.json())
      .then(deletedAlbum => {
        vm.albumsInShoppingCart(vm.albumsInShoppingCart().filter(r => r._id != deletedAlbum._id));
        vm.total(vm.total() - vm.price);
        const discount = vm.albumsInShoppingCart().length >= 3 ? vm.total() * 0.03 : 0;
        vm.discount(discount);
        vm.grandTotal(vm.total() - discount);
      })
  }

  ko.applyBindings(vm);
});