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
                            id: 'smtp-page',
                            title: 'SMTP Configurations',
                            type: 'item',
                            url: '/settings/smtp',
                            classes: 'nav-item',
                            icon: 'feather icon-server'
                        },
                        {
                            id: 'sms-page',
                            title: 'SMS Configurations',
                            type: 'item',
                            url: '/settings/sms',
                            classes: 'nav-item',
                            icon: 'feather icon-message-square'
                        },
                        {
                            id: 'emailalert-page',
                            title: 'Email Configuration',
                            type: 'item',
                            url: '/settings/emailalert',
                            classes: 'nav-item',
                            icon: 'feather icon-mail'
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
                        },
                        {
                            id: 'farmer-page',
                            title: 'Farmers',
                            type: 'item',
                            url: '/farmers',
                            classes: 'nav-item',
                            icon: 'feather icon-users'
                        },

                    ]
                }
            ]
        },

        {
            id: 'departments-settings',
            title: 'Department management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic_dept',
                    title: 'Departments',
                    type: 'collapse',
                    icon: 'feather icon-box',
                    children: [

                        {
                            id: 'dept-page',
                            title: 'Departments',
                            type: 'item',
                            url: '/department',
                            classes: 'nav-item',
                            icon: 'feather icon-box'
                        },

                    ]
                }
            ]
        },
        {
            id: 'smstemplate-settings',
            title: 'Bulk SMS management',
            type: 'group',
            icon: 'icon-message-square',
            children: [
                {
                    id: 'basic_template',
                    title: 'Sms',
                    type: 'collapse',
                    icon: 'feather icon-message-circle',
                    children: [

                        {
                            id: 'template-page',
                            title: 'Sms Templates',
                            type: 'item',
                            url: '/sms/templates',
                            classes: 'nav-item',
                            icon: 'feather icon-message-circle'
                        },
                        {
                            id: 'sendsms-page',
                            title: 'Send SMS',
                            type: 'item',
                            url: '/sms/send',
                            classes: 'nav-item',
                            icon: 'feather icon-smartphone'
                        },
                        {
                            id: 'groups-page',
                            title: 'Contact Groups',
                            type: 'item',
                            url: '/sms/contactgroups',
                            classes: 'nav-item',
                            icon: 'feather icon-users'
                        },
                        {
                            id: 'contactmanagement-page',
                            title: 'Manage Contacts',
                            type: 'item',
                            url: '/sms/contactupload',
                            classes: 'nav-item',
                            icon: 'feather icon-upload'
                        },
                        {
                            id: 'schedulesms-page',
                            title: 'Schedule SMS',
                            type: 'item',
                            url: '/sms/schedule',
                            classes: 'nav-item',
                            icon: 'feather icon-clock'
                        },

                    ]
                }
            ]
        },
        {
            id: 'tickets-settings',
            title: 'Ticket management',
            type: 'group',
            icon: 'icon-support',
            children: [
                {
                    id: 'basic-ticket',
                    title: 'Tickets',
                    type: 'collapse',
                    icon: 'feather icon-help-circle',
                    children: [

                        {
                            id: 'ticketconfig-page',
                            title: 'Categories',
                            type: 'item',
                            url: '/ticketconfigs',
                            classes: 'nav-item',
                            icon: 'feather icon-settings'
                        },
                        {
                            id: 'ticket-page',
                            title: 'Tickets',
                            type: 'item',
                            url: '/tickets',
                            classes: 'nav-item',
                            icon: 'feather icon-help-circle'
                        },

                    ]
                }
            ]
        },
        
        {
            id: 'product-settings',
            title: 'Product management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic_prod',
                    title: 'Products',
                    type: 'collapse',
                    icon: 'feather icon-box',
                    children: [

                        {
                            id: 'prod-page',
                            title: 'Products',
                            type: 'item',
                            url: '/products',
                            classes: 'nav-item',
                            icon: 'feather icon-box'
                        },

                    ]
                }
            ]
        },
        {
            id: 'customer-settings',
            title: 'Registration management',
            type: 'group',
            icon: 'icon-pages',
            children: [
                {
                    id: 'basic_custreg',
                    title: 'Customer',
                    type: 'collapse',
                    icon: 'feather icon-box',
                    children: [
                        {
                            id: 'custcategory-page',
                            title: 'Customer Category',
                            type: 'item',
                            url: '/customercategory',
                            classes: 'nav-item',
                            icon: 'feather icon-users'
                        },

                        {
                            id: 'cust_page',
                            title: 'Customer',
                            type: 'item',
                            url: '/customer',
                            classes: 'nav-item',
                            icon: 'feather icon-users'
                        },

                    ]
                },
                {
                    id: 'basic_compreg',
                    title: 'Company',
                    type: 'collapse',
                    icon: 'feather icon-box',
                    children: [

                        {
                            id: 'comp_page',
                            title: 'Company',
                            type: 'item',
                            url: '/company',
                            classes: 'nav-item',
                            icon: 'feather icon-users'
                        },

                    ]
                }                
            ]
        },
        {
            id: 'lar-settings',
            title: 'LAR management',
            type: 'group',
            icon: 'icon-support',
            children: [
                {
                    id: 'basic-lar',
                    title: 'LAR',
                    type: 'collapse',
                    icon: 'feather icon-folder',
                    children: [
                        {
                            id: 'contracttypes-page',
                            title: 'Contract types',
                            type: 'item',
                            url: '/contracttypes',
                            classes: 'nav-item',
                            icon: 'feather icon-settings'
                        },

                        {
                            id: 'lar-page',
                            title: 'Requests',
                            type: 'item',
                            url: '/lar',
                            classes: 'nav-item',
                            icon: 'feather icon-file'
                        }

                    ]
                }
            ]
        },
        {
            id: 'tcr-settings',
            title: 'TCR management',
            type: 'group',
            icon: 'icon-support',
            children: [
                {
                    id: 'tcr-lar',
                    title: 'TCR',
                    type: 'collapse',
                    icon: 'feather icon-file',
                    children: [

                        {
                            id: 'tcr-page',
                            title: 'Requests',
                            type: 'item',
                            url: '/tcr',
                            classes: 'nav-item',
                            icon: 'feather icon-clipboard'
                        },

                    ]
                }
            ]
        },
        {
            id: 'order-settings',
            title: 'Order request management',
            type: 'group',
            icon: 'icon-support',
            children: [
                {
                    id: 'customer-orders',
                    title: 'Customer Orders',
                    type: 'collapse',
                    icon: 'feather icon-shopping-cart',
                    children: [

                        {
                            id: 'cust-order-page',
                            title: 'Requests',
                            type: 'item',
                            url: '/customerorders',
                            classes: 'nav-item',
                            icon: 'feather icon-credit-card'
                        },

                    ]
                },

                {
                    id: 'company-orders',
                    title: 'Company Orders',
                    type: 'collapse',
                    icon: 'feather icon-shopping-cart',
                    children: [

                        {
                            id: 'comp-order-page',
                            title: 'Requests',
                            type: 'item',
                            url: '/companyorders',
                            classes: 'nav-item',
                            icon: 'feather icon-credit-card'
                        },

                    ]
                }
            ]
        },

    ]
}