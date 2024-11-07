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
const ScheduleSms = React.lazy(() => import('./Views/ScheduleSms'));
const Tickets = React.lazy(() => import('./Views/Tickets'));
const TicketConfigs = React.lazy(() => import('./Views/TicketConfigs'));
const Lar = React.lazy(() => import('./Views/Lar'));
const Tcr = React.lazy(() => import('./Views/Tcr'));
const ContractTypes = React.lazy(() => import('./Views/ContractTypes'));
const EmailAlertConfig = React.lazy(() => import('./Views/EmailAlertConfig'));
const FileTemplates = React.lazy(() => import('./Views/FileTemplates'));
const ContactGroups = React.lazy(() => import('./Views/ContactGroups'));
const BulkContactUpload = React.lazy(() => import('./Views/BulkContactUpload'));
const CustomerCategory = React.lazy(() => import('./Views/CustomerCategory'));
const Products = React.lazy(() => import('./Views/Products'));
const Customer = React.lazy(() => import('./Views/Customers'));
const Company = React.lazy(() => import('./Views/Companies'));


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
    { path: '/sms/contactgroups', exact: true, name: 'ContactGroups', component: ContactGroups },
    { path: '/sms/contactupload', exact: true, name: 'BulkContactUpload', component: BulkContactUpload },
    { path: '/sms/schedule', exact: true, name: 'ScheduleSms', component: ScheduleSms },
    { path: '/tickets', exact: true, name: 'Tickets', component: Tickets },
    { path: '/ticketconfigs', exact: true, name: 'TicketConfigs', component: TicketConfigs },
    { path: '/lar', exact: true, name: 'Lar', component: Lar },
    { path: '/tcr', exact: true, name: 'Lar', component: Tcr },
    { path: '/contracttypes', exact: true, name: 'ContractTypes', component: ContractTypes },
    { path: '/settings/emailalert', exact: true, name: 'EmailAlertConfig', component: EmailAlertConfig },
    { path: '/settings/filetemplates', exact: true, name: 'FileTemplates', component: FileTemplates },
    { path: '/customercategory', exact: true, name: 'CustomerCategory', component: CustomerCategory },
    { path: '/products', exact: true, name: 'Products', component: Products },
    { path: '/customer', exact: true, name: 'Customer', component: Customer },
    { path: '/company', exact: true, name: 'Company', component: Company },
];

export default routes;