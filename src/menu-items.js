export default {
    items: [
        {
            id: 'navigation',
            title: 'Navigation',
            type: 'group',
            icon: 'icon-navigation',
            children: [
                {
                    id: 'dashboard',
                    title: 'Dashboard',
                    type: 'item',
                    url: '/dashboard/default',
                    icon: 'feather icon-home',
                }
            ]
        },

        {
            id: 'api-settings',
            title: 'System Settings',
            type: 'group',
            icon: 'icon-settings',
            children: [
                {
                    id: 'basic_configs',
                    title: 'API Configurations',
                    type: 'collapse',
                    icon: 'feather icon-settings',
            children: [

                {
                    id: 'Mpesa-page',
                    title: 'Mpesa Configurations',
                    type: 'item',
                    url: '/settings/mpesa',
                    classes: 'nav-item',
                    icon: 'feather icon-credit-card'
                },
                {
                    id: 'smtp-page',
                    title: 'SMTP Configurations',
                    type: 'item',
                    url: '/settings/smtp',
                    classes: 'nav-item',
                    icon: 'feather icon-server'
                }
               


                
                
            ]
        }
    ]
        },

        {
            id: 'user-settings',
            title: 'User management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic',
                    title: 'Users and Roles',
                    type: 'collapse',
                    icon: 'feather icon-users',

            children: [
                {
                    id: 'user-role',
                    title: 'Roles',
                    type: 'item',
                    url: '/roles',
                    classes: 'nav-item',
                    icon: 'feather icon-user-check'
                },
                {
                    id: 'user-page',
                    title: 'Users',
                    type: 'item',
                    url: '/users',
                    classes: 'nav-item',
                    icon: 'feather icon-users'
                }
                
            ]
        }
         ]
        },
        {
            id: 'user-merchant-settings',
            title: 'User management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic',
                    title: 'System and Api Users',
                    type: 'collapse',
                    icon: 'feather icon-users',

            children: [
                {
                    id: 'user-merchant-page',
                    title: 'System users',
                    type: 'item',
                    url: '/merchant/users',
                    classes: 'nav-item',
                    icon: 'feather icon-users'
                },
                {
                    id: 'user-merchant-page',
                    title: 'Api users',
                    type: 'item',
                    url: '/merchant/api_users',
                    classes: 'nav-item',
                    icon: 'feather icon-server'
                }
                
            ]
        }
         ]
        },
        {
            id: 'merchant-settings',
            title: 'Merchant management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic_merchant',
                    title: 'Merchants',
                    type: 'collapse',
                    icon: 'feather icon-box',
            children: [

                {
                    id: 'merchant-page',
                    title: 'Merchants',
                    type: 'item',
                    url: '/merchants',
                    classes: 'nav-item',
                    icon: 'feather icon-box'
                },
                {
                    id: 'charge-page',
                    title: 'Charges',
                    type: 'item',
                    url: '/charge_templates',
                    classes: 'nav-item',
                    icon: 'feather icon-box'
                },
                
            ]
        }
    ]
        },




    ]
}