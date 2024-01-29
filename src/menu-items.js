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


    ]
}