import React from 'react';
import $ from 'jquery';


window.jQuery = $;
window.$ = $;
global.jQuery = $;

const DashboardDefault = React.lazy(() => import('./Demo/Dashboard/Default'));
const Users = React.lazy(() => import('./Views/Users'));
const Roles = React.lazy(() => import('./Views/Roles'));
const SmtpConfigs = React.lazy(() => import('./Views/Smtpconfigs'));
const Department = React.lazy(() => import('./Views/Department'));


const routes = [
    { path: '/dashboard', exact: true, name: 'Default', component: DashboardDefault },
    { path: '/users', exact: true, name: 'Users', component: Users },
    { path: '/roles', exact: true, name: 'Roles', component: Roles },
    { path: '/settings/smtp', exact: true, name: 'SmtpConfigs', component: SmtpConfigs },
    { path: '/department', exact: true, name: 'Department', component: Department },
];

export default routes;