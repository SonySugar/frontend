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
                }
                
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
                    id: 'dept-page',
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
                    icon: 'feather icon-message-square'
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


    ]
}