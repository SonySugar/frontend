import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import CloseIcon from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

var custom_notification_style = {
    NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '10px 5px 2px 1px'
        },

        warning: {
            color: 'white',
            backgroundColor: "orange",
            textStyle: "bold"
        },
        error: {
            color: 'white',
            backgroundColor: "red",
            textStyle: "bold"
        },
        success: {
            color: 'white',
            backgroundColor: "green",
            textStyle: "bold"
        }
    }
}
const SpinnerDiv = styled.div`
text-align: center;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: RGBA(0, 0, 0, 0.2);
display: grid;
place-items: center;
z-index: 10;
`;


const payment_generated_header = [
    { label: "Receipt No", key: "receipt_no" },
    { label: "Amount", key: "amount" },
    { label: "Account Name", key: "account_name" },
    { label: "Mobile Number", key: "phone_number" },
    { label: "Payment Code", key: "payment_code" },
    { label: "Service Type", key: "service_type" },
    { label: "Date created", key: "date_created" }
];

const training_requests_generated_header = [
    { label: "Name", key: "created_by" },
    { label: "Mobile Number", key: "phone_number" },
    { label: "Email", key: "account_name" },
    { label: "Training Name", key: "training_name" },
    { label: "Date requested", key: "date_created" },
    { label: "Training Location", key: "location" },
    { label: "CRM Case No", key: "case_no" },
];

const customer_complaints_generated_header = [
    { label: "Case No", key: "case_no" },
    { label: "Created By", key: "created_by" },
    { label: "Mobile Number", key: "phone_number" },
    { label: "Ticket Category", key: "category" },
    { label: "Subject", key: "subject" },
    { label: "Description", key: "description" },
    { label: "Date created", key: "date_created" }
];
class Tickets extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            tickets: [],
            training_requests: [],
            customer_complaints: [],
            users_temp: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            receipt_no: '',
            amount: '',
            account_name: '',
            mobile_number: '',
            payment_code: '',
            service_type: '',
            requested_service_name: '',
            status: '',
            _notificationSystem: null,
            date_created: '',
            updated_role: '',
            show_progress_status: false,
            query_status_url: '',
            openConfirm: false,
            type: '',
            show_payment: false,
            show_training: false,
            show_complaints: false,
            crmticketno: '',
            report: [],
            payment_generated_report: [],
            training_request_generated_report: [],
            customer_complaint_generated_report: [],
            date_from:'',
            date_to:'',
            training_requests_temp:[],
            show_training_requests_report:false,
            pageCustomNum: 0,
            pageCustomCount: 1,
            pagePaymentNum: 0,
            pagePaymentCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getTickets(0);
        await this.getCustomerComplaints(0);
        await this.getTicketsReport();
        await this.getCustomerComplaintsReport();

        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getTickets(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/payment_generated/"+pagenum+"/"+10);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ tickets: apiResponse });


        }

    }

    async getTicketsReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/payment_generated");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {



            apiResponse.forEach(r => {
                let params = {};
                params["receipt_no"] = r.receipt_no;
                params["amount"] = r.amount;
                params["account_name"] = r.account_name;
                params["phone_number"] = r.mobile_number;
                params["payment_code"] = r.payment_code;
                params["service_type"] = r.service_type;
                params["date_created"] = r.date_created;
                this.state.payment_generated_report.push(params);
            });


        }

    }



    async getTrainingRequests() {
        //call API
        const notification = this.notificationSystem.current;
        if(this.state.date_from==="" || this.state.date_to === ""){
            notification.addNotification({
                message: "Please select both date from and date to",
                level: 'warning',
                autoDismiss: 8
            });
        }else{
            this.setState({ show_progress_status: true });
        let dateFrom = this.dateConverter(this.state.date_from);
        let dateTo = this.dateConverter(this.state.date_to);
        let apiResponse = await APIService.makeApiGetRequest("tickets/training_requests/"+dateFrom+"/"+dateTo);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ training_requests: apiResponse,training_requests_temp:apiResponse,show_training_requests_report:true });

            apiResponse.forEach(r => {
                let params = {};
               
                params["created_by"] = r.created_by;
                params["phone_number"] = r.mobile_number;
                params["account_name"] = r.account_name;
                params["training_name"] = r.training_requests.trainings.module;
                params["date_created"] = r.date_created;
                params["location"] = r.training_requests.location.county;
                params["case_no"] = r.crmticketno;
                this.state.training_request_generated_report.push(params);
            });
            this.setState({ show_progress_status: false });
        }
    }
    }

    async getCustomerComplaints(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/customer_complaints/"+pagenum+"/"+10);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ customer_complaints: apiResponse });


        }

    }

    async getCustomerComplaintsReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/customer_complaints");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {


            apiResponse.forEach(r => {
                let params = {};
                params["case_no"] = r.crmticketno;
                params["created_by"] = r.created_by;
                params["phone_number"] = r.mobile_number;
                params["category"] = r.customer_tickets.category.category_name;
                params["subject"] = r.title;
                params["description"] = r.narration;
                params["date_created"] = r.date_created;
                this.state.customer_complaint_generated_report.push(params);
            });


        }

    }

    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickTicketSelected(row)
            } >
                <Visibility style={{ color: "#04a9f5" }} titleAccess='More Details' />
            </IconButton>

        );
    }

    trainingName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.training_requests.trainings.module}
            </p>

        );
    }

    titleName(row) {

        return (

            <p>
                {row.customer_tickets.title}
            </p>

        );
    }

    categoryName(row) {
        return (

            <p>
                {row.customer_tickets.category.category_name}
            </p>

        );
    }

    requestDate(row) {
        const { classes } = this.props;
        let startDate = this.getFormatedStartDate(row.training_requests.start_date);
        return (

            <p>
                {startDate}
            </p>



        );
    }

    customerName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.training_requests.created_by}
            </p>

        );
    }

    closeUpdateDialog() {
        this.setState({ openUpdate: false });
    }
    openUpdateDialog() {
        this.setState({ openUpdate: true });
    }

    closeAddDialog() {
        this.setState({ open: false });
    }
    openAddDialog() {
        this.setState({ open: true });
    }

    closeConfirmDialog() {
        this.setState({ openConfirm: false });

    }
    openConfirmDialog() {
        this.setState({ openConfirm: true });
        this.closeUpdateDialog();
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickTicketSelected(row) {
        this.setState({
            id: row.id,
            crmticketno: row.crmticketno,
            receipt_no: row.receipt_no,
            amount: row.amount,
            account_name: row.account_name,
            mobile_number: row.mobile_number,
            payment_code: row.payment_code,
            service_type: row.service_type,
            requested_service_name: row.requested_service_name,
            status: row.status,
            date_created: row.date_created,

        });
        this.openUpdateDialog();
    }


    async closeTicket() {
        this.closeConfirmDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;


        let params = {};
        params["id"] = this.state.id;


        let result = await APIService.makePostRequest("tickets/close", params);
        if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
            });
            this.closeUpdateDialog();
            this.setState({
                id: '',
            });
            this.getTickets();
            this.setState({ show_progress_status: false });
        } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: result.message,
                level: 'error',
                autoDismiss: 5
            });
        }

    }
    handlerTypeChange(e) {
        this.setState({
            trx_type: e.target.value
        });
    }

    handlerTicketTypeChange(e) {
        this.setState({
            type: e.target.value
        });
        if (e.target.value == "payment") {
            this.setState({
                show_payment: true,
                show_training: false,
                show_complaints: false,
                show_training_requests_report:false,
            });
        } else if (e.target.value == "training") {
            this.setState({
                show_payment: false,
                show_training: true,
                show_complaints: false
            });
        } else {
            this.setState({
                show_payment: false,
                show_training: false,
                show_complaints: true,
                show_training_requests_report:false
            });
        }
    }
    getFormatedStartDate(val) {

        let date = new Date(val);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }

        let concatTime = year + '-' + month + '-' + dt + ' ' + hour + ':' + mins;
        return concatTime;
    }
    dateConverter(val) {
        let date = val;
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();
    
        if (dt < 10) {
          dt = '0' + dt;
        }
        if (month < 10) {
          month = '0' + month;
        }
    
        if (hour < 10) {
          hour = '0' + hour;
        }
        if (mins < 10) {
          mins = '0' + mins;
        }
    
        let concatTime = year + '-' + month + '-' + dt
    
        return concatTime;
      }

    generatePaymentPDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Receipt No", "Amount", "Account Name", "Phone Number", "Payment Mode","Service Type", "Date Created"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.tickets.forEach(ticket => {
            const ticketData = [
                ticket.receipt_no,
                ticket.amount,
                ticket.account_name,
                ticket.mobile_number,
                ticket.payment_code,
                ticket.service_type,
                format(new Date(ticket.date_created), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });
        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Kentrade Payment Generated Ticket Report", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Tickets_Payment_Generated${dateStr}.pdf`);
    }

    generateTrainingPDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Name", "Mobile Number", "Email", "Training Name", "Date Requested","Location","Case No"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.training_requests.forEach(ticket => {
            const ticketData = [
                ticket.created_by,
                ticket.mobile_number,
                ticket.account_name,
                ticket.training_requests.trainings.module,
                format(new Date(ticket.date_created), "yyyy-MM-dd"),
                ticket.training_requests.location.county,
                ticket.crmticketno,
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });
        let dateFrom = this.dateConverter(this.state.date_from);
        let dateTo = this.dateConverter(this.state.date_to);
        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Kentrade Training Requests Generated Ticket Report (From "+dateFrom+" to "+dateTo+")", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        
        doc.save(`Tickets_Training_Requests_Generated${dateStr}.pdf`);
    }

    generateCustomerComplaintsPDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Case No", "Created By", "Phone Number", "Ticket Category", "Complaint Title", "Complaint Description", "Date Created"];
        // define an empty array of rows
        const tableRows = [];



        // for each ticket pass all its data into an array
        this.state.customer_complaints.forEach(ticket => {
            const ticketData = [
                ticket.case_no,
                ticket.created_by,
                ticket.mobile_number,
                ticket.customer_tickets.category.category_name,
                ticket.title,
                ticket.narration,
                format(new Date(ticket.date_created), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });
        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Kentrade Customer Complaint Generated Ticket Report", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Tickets_Customer_Complaint_Generated${dateStr}.pdf`);
    }


 

    setDateFrom(e) {


        this.setState({
          date_from: e
        })
      }
      setDateTo(e) {


        this.setState({
          date_to: e
        })
      }

      handleTrainingSearch(e){
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.training_requests.filter(s => {
            return s.training_requests.trainings.module.includes(value) || s.training_requests.location.county.includes(value) || s.training_requests.app_user.stakeholder.stake_holder_type.includes(value.toUpperCase());
        });
        this.setState({
            training_requests_temp: searchResult
        });
      }

      async AddPage() {
        this.setState({ show_progress_status: true });
        var add = this.state.pagePaymentNum;
        var count = this.state.pagePaymentCount;
        add++;
        count++;
        this.setState({
            pagePaymentNum: add,
            pagePaymentCount: count
        });
        await this.getTickets(add);
        this.setState({ show_progress_status: false });
    }
    async RemovePage() {
        var add = this.state.pagePaymentNum;
        var count = this.state.pagePaymentCount;
        if (this.state.pagePaymentNum > 0) {
            this.setState({ show_progress_status: true });
            add--;
            count--;
            this.setState({
                pagePaymentNum: add,
                pagePaymentCount: count
            });
            await this.getTickets(add);
            this.setState({ show_progress_status: false });
        }
    }
    async AddCustomPage() {
        this.setState({ show_progress_status: true });
        var add = this.state.pageCustomNum;
        var count = this.state.pageCustomCount;
        add++;
        count++;
        this.setState({
            pageCustomNum: add,
            pageCustomCount: count
        });
        await this.getCustomerComplaints(add);
        this.setState({ show_progress_status: false });
    }
    async RemoveCustomPage() {
        var add = this.state.pageCustomNum;
        var count = this.state.pageCustomCount;
        if (this.state.pageCustomNum > 0) {
            this.setState({ show_progress_status: true });
            add--;
            count--;
            this.setState({
                pageCustomNum: add,
                pageCustomNum: count
            });
            await this.getCustomerComplaints(add);
            this.setState({ show_progress_status: false });
        }
    }

    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='Open Tickets' isOption>
                            <label style={{ color: '#000000' }}><b>Ticket type</b></label>
                            <div className="input-group mb-3">
                                <select
                                    className="form-control"
                                    value={this.state.type}
                                    onChange={this.handlerTicketTypeChange.bind(
                                        this
                                    )}
                                >
                                    <option value="">
                                        Select ticket type
                                    </option>
                                    <option value="payment">
                                        Payment Generated
                                    </option>

                                    <option value="training">
                                        Training requests
                                    </option>
                                    <option value="customer">
                                        Customer complaints
                                    </option>
                                </select>

                            </div>
                            <div>
     
    </div>

                            {this.state.show_payment ? <IconButton onClick={() =>
                                this.generatePaymentPDF()
                            }>
                                <FaFilePdf title='Download report' size={50} color='red' />
                            </IconButton> : null}
                            {this.state.show_payment ?

                                <CSVLink data={this.state.payment_generated_report} headers={payment_generated_header} filename='Payment_Generated_Tickets.csv'>
                                    <FaFileExcel size={50} color='green' title='Download report' />
                                </CSVLink> : null}


                            {this.state.show_training_requests_report ? <IconButton onClick={() =>
                                this.generateTrainingPDF()
                            }>
                                <FaFilePdf title='Download report' size={50} color='red' />
                            </IconButton> : null}
                            {this.state.show_training_requests_report ?

                                <CSVLink data={this.state.training_request_generated_report} headers={training_requests_generated_header} filename='Training_Request_Generated_Tickets.csv'>
                                    <FaFileExcel size={50} color='green' title='Download report' />
                                </CSVLink> : null}

                            {this.state.show_complaints ? <IconButton onClick={() =>
                                this.generateCustomerComplaintsPDF()
                            }>
                                <FaFilePdf title='Download report' size={50} color='red' />
                            </IconButton> : null}
                            {this.state.show_complaints ?

                                <CSVLink data={this.state.customer_complaint_generated_report} headers={customer_complaints_generated_header} filename='Training_Request_Generated_Tickets.csv'>
                                    <FaFileExcel size={50} color='green' title='Download report' />
                                </CSVLink> : null}
                                {this.state.show_complaints ?<IconButton onClick={() =>
                        this.RemoveCustomPage()
                    } >
                        <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                    </IconButton>:null}

                    {this.state.show_complaints ?<IconButton onClick={() =>
                        this.AddCustomPage()
                    } >
                        <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                    </IconButton>:null}

                    {this.state.show_complaints ?<p>Page {this.state.pageCustomCount}</p>:null}


                   
                    {this.state.show_payment ?<IconButton onClick={() =>
                            this.RemovePage()
                        } >
                            <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                        </IconButton>:null}

                        {this.state.show_payment ?<IconButton onClick={() =>
                            this.AddPage()
                        } >
                            <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                        </IconButton> :null}
                        {this.state.show_payment ?<p>Page {this.state.pagePaymentCount}</p>
                    :null}

                            {this.state.show_payment ?




                                <Table>
                                    <Thead>
                                        <Tr style={{ border: '1px solid' }}>

                                            <Th>Reciept No</Th>
                                            <Th>Amount</Th>
                                            <Th>Account Name</Th>
                                            <Th>Mobile Number</Th>
                                            <Th>Payment Code</Th>
                                            <Th>Service Type</Th>
                                            <Th>More Details</Th>



                                        </Tr>

                                    </Thead>
                                    {this.state.tickets == null || this.state.tickets.length == 0 ? <Tbody>
                                        <Tr style={{ border: '1px solid' }} key={0}>
                                            {this.state.type == null || this.state.type == "" ?
                                                <Td style={{ color: 'red' }}>Select a ticket type....</Td> : <Td style={{ color: 'blue' }}>Loading ....</Td>}
                                        </Tr>
                                    </Tbody> : <Tbody>
                                        {this.state.tickets.map(
                                            (u, index) => (
                                                <Tr style={{ border: '1px solid' }} key={index}>

                                                    <Td>
                                                        {u.receipt_no}
                                                    </Td>
                                                    <Td>
                                                        {u.amount}
                                                    </Td>
                                                    <Td>{u.account_name}</Td>
                                                    <Td>
                                                        {u.mobile_number}
                                                    </Td>
                                                    <Td>
                                                        {u.payment_code}
                                                    </Td>
                                                    <Td>
                                                        {u.service_type}
                                                    </Td>

                                                    <Td>
                                                        {this.cellButton(u)}
                                                    </Td>



                                                </Tr>
                                            )
                                        )}
                                    </Tbody>}
                                </Table>
                                 


                                : null}

{this.state.show_payment ?<div className="card-body text-center">
                        <IconButton onClick={() =>
                            this.RemovePage()
                        } >
                            <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                        </IconButton>

                        <IconButton onClick={() =>
                            this.AddPage()
                        } >
                            <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                        </IconButton>
                        <p>Page {this.state.pagePaymentCount}</p>
                    </div> :null}
                                {this.state.show_training ?
                                <Table>
                                    <Thead>
                      <Tr key={0}>
                        <Th>Date from</Th>
                        <Th>Date to</Th>
                      </Tr>
                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                            <DatePicker onChange={date => this.setDateFrom(date)} selected={this.state.date_from} dateFormat="dd-MM-yyyy" placeholderText={this.state.date_from} />
      
                                            </Td>
                                            <Td>
                                            <DatePicker onChange={date => this.setDateTo(date)} selected={this.state.date_to} dateFormat="dd-MM-yyyy" placeholderText={this.state.date_to} /> 
                                            </Td>
                                            <Td>
                                            <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.getTrainingRequests() }}>Search</button>
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                             
                               :null}

                                {this.state.show_training?
                               
                                <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can filter by start typing either the county or stakeholder type or training Name " onChange={e => this.handleTrainingSearch(e)} />
                                </div>:null
                               }

                            {this.state.show_training ?
                                
                                <Table>
                                    <Thead>
                                        <Tr style={{ border: '1px solid' }}>
                                            <Th>Name</Th>
                                            <Th>Mobile No</Th>
                                            <Th>Email</Th>
                                            <Th>Requested Training</Th>
                                            <Th>Request Date</Th>
                                            <Th>Location</Th>
                                            <Th>Stake Holder</Th>
                                            <Th>Case Id</Th>



                                        </Tr>

                                    </Thead>
                                    {this.state.training_requests_temp == null || this.state.training_requests_temp.length == 0 ? <Tbody>
                                        <Tr style={{ border: '1px solid' }} key={0}>
                                            {this.state.type == null || this.state.type == "" ?
                                                <Td style={{ color: 'red' }}>Select a module....</Td> : <Td style={{ color: 'blue' }}>No data found....</Td>}
                                        </Tr>
                                    </Tbody> : <Tbody>
                                        {this.state.training_requests_temp.map(
                                            (u, index) => (
                                                <Tr style={{ border: '1px solid' }} key={index}>
                                                    <Td>
                                                        {u.created_by}
                                                    </Td>
                                                    <Td>
                                                        {u.mobile_number}
                                                    </Td>
                                                    <Td>
                                                        {u.account_name}
                                                    </Td>
                                                    <Td>
                                                        {u.training_requests.trainings.module}
                                                    </Td>
                                                    
                                                    <Td>
                                                        {this.requestDate(u)}
                                                    </Td>
                                                    <Td>
                                                        {u.training_requests.location.county}
                                                    </Td>
                                                    <Td>
                                                        
                                                        {u.training_requests.app_user.stakeholder.stake_holder_type}
                                                    </Td>

                                                    <Td>
                                                        {u.crmticketno}
                                                    </Td>



                                                </Tr>
                                            )
                                        )}
                                    </Tbody>}
                                </Table>

                                : null}

                            {this.state.show_complaints ?

                                <Table>
                                    <Thead>
                                        <Tr style={{ border: '1px solid' }}>
                                            <Th>Case No</Th>
                                            <Th>Mobile Number</Th>
                                            <Th>Title</Th>
                                            <Th>Category</Th>
                                            <Th>More Details</Th>
                                        </Tr>

                                    </Thead>
                                    {this.state.customer_complaints == null || this.state.customer_complaints.length == 0 ? <Tbody>
                                        <Tr style={{ border: '1px solid' }} key={0}>
                                            {this.state.type == null || this.state.type == "" ?
                                                <Td style={{ color: 'red' }}>Select a ticket type....</Td> : <Td style={{ color: 'blue' }}>Loading ....</Td>}
                                        </Tr>
                                    </Tbody> : <Tbody>
                                        {this.state.customer_complaints.map(
                                            (u, index) => (
                                                <Tr style={{ border: '1px solid' }} key={index}>
                                                    <Td>
                                                        {u.crmticketno}
                                                    </Td>
                                                    <Td>
                                                        {u.mobile_number}
                                                    </Td>
                                                    <Td>
                                                        {this.titleName(u)}
                                                    </Td>
                                                    <Td>{this.categoryName(u)}</Td>
                                                    <Td>
                                                        {this.cellButton(u)}
                                                    </Td>



                                                </Tr>
                                            )
                                        )}
                                    </Tbody>}
                                </Table>
                                 
                                : null}
                                 {this.state.show_complaints ?<div className="card-body text-center">
                        <IconButton onClick={() =>
                            this.RemoveCustomPage()
                        } >
                            <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                        </IconButton>

                        <IconButton onClick={() =>
                            this.AddCustomPage()
                        } >
                            <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                        </IconButton>
                        <p>Page {this.state.pageCustomCount}</p>
                    </div> :null}
                        </Card>


                    </Col>
                </Row>
                <Dialog
                    open={this.state.closesession}

                    fullWidth
                    
                >

                    <div className="card">
                        <center>
                            <Lottie
                                loop
                                animationData={lottieJson}
                                play
                                style={{ width: 50, height: 50 }}
                            />
                        </center>
                        <div className="card-body text-center">
                            <h3>Your session has expired</h3>
                            <br />
                            <br />
                            <h4>Please log in again</h4>



                        </div>
                        <div className="card-body text-center">
                            <IconButton onClick={() => { this.logout() }}>

                                <FaDoorOpen size={50} title='Exit' color='red' />
                            </IconButton>
                        </div>


                    </div>

                </Dialog>



                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Ticket Details</h3></center>
                        <div className="card-body text-center">

                            <Table style={{ textAlign: 'left' }}>
                                <Tr key={0}>
                                    <Td><b>Case No</b></Td>
                                    <Td>{this.state.crmticketno}</Td>
                                </Tr>

                                <Tr key={1}>
                                    <Td><b>Receipt No</b></Td>
                                    <Td>{this.state.receipt_no}</Td>
                                </Tr>

                                <Tr key={2}>
                                    <Td><b>Amount</b></Td>
                                    <Td>{this.state.amount}</Td>
                                </Tr>
                                <Tr key={3}>
                                    <Td><b>Account name</b></Td>
                                    <Td>{this.state.account_name}</Td>
                                </Tr>
                                <Tr key={4}>
                                    <Td><b>Mobile Number</b></Td>
                                    <Td>{this.state.mobile_number}</Td>
                                </Tr>
                                <Tr key={5}>
                                    <Td><b>Payment Code</b></Td>
                                    <Td>{this.state.payment_code}</Td>
                                </Tr>

                                <Tr key={6}>
                                    <Td><b>Service name</b></Td>
                                    <Td>{this.state.requested_service_name}</Td>
                                </Tr>
                                <Tr key={7}>
                                    <Td><b>Date created</b></Td>
                                    <Td>{this.state.date_created}</Td>
                                </Tr>


                            </Table>

                            <Row>
                                <Col>
                                    <div className="card-body text-center">
                                        <IconButton onClick={() =>
                                            this.closeUpdateDialog()
                                        }>
                                            <CloseIcon style={{ color: "red" }} titleAccess='Dimiss' />
                                        </IconButton>
                                    </div>
                                </Col>
                                {/*<Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.openConfirmDialog() }}>Close Ticket</button>
                            </div>
    </Col>*/}
                            </Row>
                        </div>


                    </div>


                </Dialog>

                <Dialog
                    open={this.state.openConfirm}

                    fullWidth

                >

                    <div className="card">
                        <center>
                            <Lottie
                                loop
                                animationData={lottieJson}
                                play
                                style={{ width: 50, height: 50 }}
                            />
                        </center>
                        <div className="card-body text-center">
                            <h3>Ticket Id #{this.state.id}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to close this ticket?</h4>



                        </div>
                        <Row>
                            <Col>
                                <div className="card-body text-center">
                                    <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeConfirmDialog() }}>No</button>
                                </div>
                            </Col>
                            {/*<Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.closeTicket() }}>Yes</button>
                            </div>
                            </Col>*/}
                        </Row>


                    </div>

                </Dialog>

            </Aux>

        );
    }
}

export default Tickets;