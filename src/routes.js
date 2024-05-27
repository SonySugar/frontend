import React from 'react';
import $ from 'jquery';


window.jQuery = $;
window.$ = $;
global.jQuery = $;

const DashboardDefault = React.lazy(() => import('./Demo/Dashboard/Default'));
const Users = React.lazy(() => import('./Views/Users'));
const Roles = React.lazy(() => import('./Views/Roles'));
const SmtpConfigs = React.lazy(() => import('./Views/Smtpconfigs'));
const SmsConfigs = React.lazy(() => import('./Views/BulkSmsConfigs'));
const Department = React.lazy(() => import('./Views/Department'));
const AppUsers = React.lazy(() => import('./Views/AppUsers'));
const SmsTemplates = React.lazy(() => import('./Views/SmsTemplates'));
const SendSms = React.lazy(() => import('./Views/SendSms'));


const routes = [
    { path: '/dashboard', exact: true, name: 'Default', component: DashboardDefault },
    { path: '/users', exact: true, name: 'Users', component: Users },
    { path: '/roles', exact: true, name: 'Roles', component: Roles },
    { path: '/settings/smtp', exact: true, name: 'SmtpConfigs', component: SmtpConfigs },
    { path: '/settings/sms', exact: true, name: 'SmsConfigs', component: SmsConfigs },
    { path: '/department', exact: true, name: 'Department', component: Department },
    { path: '/farmers', exact: true, name: 'AppUsers', component: AppUsers },
    { path: '/sms/templates', exact: true, name: 'SmsTemplates', component: SmsTemplates },
    { path: '/sms/send', exact: true, name: 'SendSms', component: SendSms },
];

export default routes;