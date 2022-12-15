export const menuSuperAdmin: any[] = [
  {
    icon: 'fa fa-sign-in',
    text: 'label.menu.news-letter.news-letter',
    route: '/news-letter'
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.products-list.catalog",
    route: "/products-list",
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.cart",
    route: "/cart",
  },
  {
    icon: "fa fa-caret-down",
    text: "label.menu.users.text",
    children: [
      {
        text: "label.menu.users.users",
        route: "users",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.users.roles",
        route: "roles",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.users.permissions",
        route: "permissions",
        icon: "fa fa-user"
      }
    ]
  },
  {
    icon: "fa fa-caret-down",
    text: "label.menu.products.text",
    children: [
      {
        text: "label.menu.products.categories",
        route: "categories",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.products.products",
        route: "products",
        icon: "fa fa-user"
      },
    ]
  },
  {
    icon: "fa fa-caret-down",
    text: "label.menu.orders.text",
    children: [
      {
        text: "label.menu.orders.carts",
        route: "manage-carts",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.orders.orders",
        route: "orders",
        icon: "fa fa-user"
      }
    ]
  }, 
  {
    icon: "fa fa-sign-out",
    text: "label.menu.auth.logout",
    route: "/auth/logout",
  },
];

export const menuAdmin: any[] = [
  {
    icon: 'fa fa-sign-in',
    text: 'label.menu.news-letter.news-letter',
    route: '/news-letter'
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.products-list.catalog",
    route: "/products-list",
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.cart",
    route: "/cart",
  },
  {
    icon: "fa fa-caret-down",
    text: "label.menu.users.text",
    children: [
      {
        text: "label.menu.users.users",
        route: "users",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.users.roles",
        route: "roles",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.users.permissions",
        route: "permissions",
        icon: "fa fa-user"
      }
    ]
  },
  {
    icon: "fa fa-caret-down",
    text: "label.menu.products.text",
    children: [
      {
        text: "label.menu.products.categories",
        route: "categories",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.products.products",
        route: "products",
        icon: "fa fa-user"
      },
    ]
  }, 
  {
    icon: "fa fa-caret-down",
    text: "label.menu.orders.text",
    children: [
      {
        text: "label.menu.orders.carts",
        route: "manage-carts",
        icon: "fa fa-user"
      },
      {
        text: "label.menu.orders.orders",
        route: "orders",
        icon: "fa fa-user"
      }
    ]
  }, 
  {
    icon: "fa fa-sign-out",
    text: "label.menu.auth.logout",
    route: "/auth/logout",
  },
];

export const menuUser: any[] = [
  {
    icon: 'fa fa-sign-in',
    text: 'label.menu.news-letter.news-letter',
    route: '/news-letter'
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.products-list.catalog",
    route: "/products-list",
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.cart",
    route: "/cart",
  },
  {
    icon: "fa fa-sign-out",
    text: "label.menu.auth.logout",
    route: "/auth/logout",
  },
];

export const menuLogout: any[] = [
  {
    icon: 'fa fa-sign-in',
    text: 'label.menu.news-letter.news-letter',
    route: '/news-letter'
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.products-list.catalog",
    route: "/products-list",
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.cart",
    route: "/cart",
  },
  {
    icon: "fa fa-sign-in",
    text: "label.menu.auth.login",
    route: "/auth/login",
  },
  
];
