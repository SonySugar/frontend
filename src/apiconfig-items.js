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
            id: 'pages-settings',
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
                    id: 'bulk-page',
                    title: 'Bulk SMS Configurations',
                    type: 'item',
                    url: '/settings/sms',
                    classes: 'nav-item',
                    icon: 'feather icon-message-square'
                },
                {
                    id: 'smtp-page',
                    title: 'SMTP Configurations',
                    type: 'item',
                    url: '/settings/smtp',
                    classes: 'nav-item',
                    icon: 'feather icon-server'
                },
                {
                    id: 'ecitizen-page',
                    title: 'Ecitizen Configurations',
                    type: 'item',
                    url: '/settings/ecitizenconfigs',
                    classes: 'nav-item',
                    icon: 'feather icon-credit-card'
                },
                {
                    id: 'crm-page',
                    title: 'CRM Configurations',
                    type: 'item',
                    url: '/settings/crmconfigs',
                    classes: 'nav-item',
                    icon: 'feather icon-tag'
                },

                {
                    id: 'alerts-page',
                    title: 'Registration Alerts',
                    type: 'item',
                    url: '/settings/registrationalert',
                    classes: 'nav-item',
                    icon: 'feather icon-tag'
                },
                {
                    id: 'financealerts-page',
                    title: 'Finance Alerts',
                    type: 'item',
                    url: '/settings/schedulealerts',
                    classes: 'nav-item',
                    icon: 'feather icon-tag'
                },


                
                
            ]
        }
    ]
        },




    ]
}