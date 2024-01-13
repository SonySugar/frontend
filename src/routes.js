import React from 'react';
import $ from 'jquery';


window.jQuery = $;
window.$ = $;
global.jQuery = $;

const DashboardDefault = React.lazy(() => import('./Demo/Dashboard/Default'));


const Users = React.lazy(() => import('./Views/Users'));
const Roles = React.lazy(() => import('./Views/Roles'));
const Merchants = React.lazy(() => import('./Views/Merchants'));
const MerchantUsers = React.lazy(() => import('./Views/MerchantUsers'));
const ApiUsers = React.lazy(() => import('./Views/ApiUsers'));
const MpesaConfigs = React.lazy(() => import('./Views/MpesaConfigs'));
const SmtpConfigs = React.lazy(() => import('./Views/Smtpconfigs'));
const ChargeTemplates = React.lazy(() => import('./Views/ChargeTemplates'));



const routes = [
    { path: '/dashboard', exact: true, name: 'Default', component: DashboardDefault },
    { path: '/users', exact: true, name: 'Users', component: Users },
    { path: '/roles', exact: true, name: 'Roles', component: Roles },
    { path: '/merchants', exact: true, name: 'Merchants', component: Merchants },
    { path: '/charge_templates', exact: true, name: 'ChargeTemplates', component: ChargeTemplates },
    { path: '/merchant/users', exact: true, name: 'MerchantUsers', component: MerchantUsers },
    { path: '/merchant/api_users', exact: true, name: 'ApiUsers', component: ApiUsers },
    { path: '/settings/mpesa', exact: true, name: 'MpesaConfigs', component: MpesaConfigs },
    { path: '/settings/smtp', exact: true, name: 'SmtpConfigs', component: SmtpConfigs }
];

export default routes;