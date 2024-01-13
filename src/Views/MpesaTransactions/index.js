import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
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
import Authenticatonservice from '../../service/Authenticatonservice';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaTimes, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
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

const headers = [
    { label: "Customer Name", key: "customer_name" },
    { label: "Phone Number", key: "phone_number" },
    { label: "Mpesa Receipt", key: "mpesa_receipt" },
    { label: "Amount", key: "amount" },
    { label: "Account Refernece", key: "account_ref" },
    { label: "Customer Name", key: "customer_name" },
    { label: "Mpesa Service Message", key: "response_description" },
    { label: "Payment Status", key: "status" },
    { label: "Service Name", key: "service_name" },
    { label: "Service type", key: "service_type" },
    { label: "Transaction Date", key: "timestamp" },
    { label: "Company Name", key: "company_name" }
];
class MpesaTransactions extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            mpesa_list: [],
            mpesa_list_temp: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            phone_number: '',
            service_id: '',
            services: [],
            delete_dept_id: '',
            update_dept_id: '',
            username: '',
            phonenumber: '',
            fullnames: '',
            updated_fullnames: '',
            updated_phonenumber: '',
            updated_user_id: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            show_progress_status: false,
            openView: false,
            requestid: '',
            responsecode: '',
            responsedesc: '',
            receipt: '',
            customer_name: '',
            report: [],
            corp_list:[],
            selected_corp:'',
            pageNum: 0,
            pageCount :1
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getAllTransactions(0);
        await this.getAllTransactionReports();
        await this.getServices();
        await this.getCorporates();
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
    async getAllTransactions(pagnum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("push/all_transactions/"+pagnum+"/10");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ mpesa_list: apiResponse, mpesa_list_temp: apiResponse });


        }

    }

    async getAllTransactionReports() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("push/all_transactions_report");
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
                params["customer_name"]=r.customer_name;
                params["phone_number"] = r.phone_number;
                params["mpesa_receipt"] = r.mpesa_receipt;
                params["amount"] = r.amount;
                params["account_ref"] = r.account_ref;
                params["customer_name"] = r.customer_name;
                params["response_description"] = r.response_description;
                params["status"] = r.status;
                params["service_name"] = r.service_name;
                params["service_type"] = r.type;
                params["timestamp"] = r.timestamp;
                params["company_name"] = r.company_name;

                this.state.report.push(params);

            });
        }

    }
    async getServices() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("augmented/services");

        if (apiResponse.status == 403) {

            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ services: apiResponse });


        }

    }
    async getCorporates() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("corporate/list");
        if (apiResponse.status == 403) {
          notification.addNotification({
            message: apiResponse.message,
            level: 'error',
            autoDismiss: 5
          });
        } else {
    
          this.setState({ corp_list: apiResponse });
    
        }
    
    
      }
    getDepartment(cell, row) {
        return cell.dept_name;
    }
    getRole(cell, row) {
        return cell.role_name;
    }
    getStatus(row){
        if(row.response_code==="0"){

        }
    }
    cellButton(row) {
        const { classes } = this.props;
        let disableBtn = true;
        if (row.status === null || row.status === "Pending" || row.status === "") {
            disableBtn = false
            return (
                <IconButton onClick={() =>
                    this.onPaymentSelected(row)
                } disabled={false}>
                    <DoneIcon style={{ color: "#04a9f5" }} titleAccess='Not yet confirmed' />
                </IconButton>
            );
        } else if (row.response_code !== "0") {
            return (
                <IconButton onClick={() =>
                    this.onPaymentSelected(row)
                } disabled={true}>
                    <CloseIcon style={{ color: "red" }} titleAccess='Error' />
                </IconButton>
            );
        } else {
            return (

                <IconButton onClick={() =>
                    this.onPaymentSelected(row)
                } disabled={true}>
                    <DoneIcon style={{ color: "green" }} titleAccess='Confirmed' />
                </IconButton>

            );
        }
    }

    async AddPage(){
        this.setState({ show_progress_status: true });
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        add++;
        count++;
        this.setState({
            pageNum:add,
            pageCount:count
        });
        await this.getAllTransactions(add);
        this.setState({ show_progress_status: false });
    }
    async RemovePage(){
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        if(this.state.pageNum>0){
            this.setState({ show_progress_status: true });
        add--;
        count--;
        this.setState({
            pageNum:add,
            pageCount:count
        });
        await this.getAllTransactions(add);
        this.setState({ show_progress_status: false });
    }
    }
    handlerServicesChanges(e) {
        this.setState({
            service_id: e.target.value
        });
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

    closeDeleteDialog() {
        this.setState({ openDelete: false });
    }
    openView() {
        this.setState({ openView: true });
    }
    closeView() {
        this.setState({ openView: false });
    }
    handlerCorporateChanges(e) {
        this.setState({
          selected_corp: e.target.value
        });
      }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    async onPaymentSelected(row) {
        const notification = this.notificationSystem.current;
        this.setState({ show_progress_status: true });

        let params = {};
        params["checkout_request_id"] = row.checkout_request_id;


        let result = await APIService.makePostRequest("push/confirm", params);
        if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 10
            });

            this.getAllTransactions(0);
            this.setState({ show_progress_status: false });
        } else {
            this.setState({ show_progress_status: false });
            this.getAllTransactions(0);
            notification.addNotification({
                message: result.message,
                level: 'error',
                autoDismiss: 5
            });
        }

    }


    async initiatePayment() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        if (!privilegeList.includes("augmented_services_payment")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to initiate payment for an augmented service. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.phone_number == null || this.state.phone_number === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter phone number',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.service_id == null || this.state.service_id === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please select a service',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["phone_number"] = this.state.phone_number;
                params["id"] = this.state.service_id;
                params["service_id"] = this.state.service_id;
                params["type"] = "Augmented";
                params["customer_name"] = this.state.customer_name;
                params["corporate"]=this.state.selected_corp;

                let result = await APIService.makePostRequest("push", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 10
                    });
                    this.closeAddDialog();
                    this.setState({
                        phone_number: '',
                        service_id: ''
                    });
                    this.getAllTransactions(0);
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
        }
    }
    moreDetails(row) {
        const { classes } = this.props;
        return (

            <a
                href="#"
                onClick={() =>
                    this.onClickTrxView(row)
                }
            >
                {row.mpesa_receipt}
            </a>

        );
    }

    onClickTrxView(row) {

        this.setState({
            requestid: row.checkout_request_id,
            responsecode: row.response_code,
            responsedesc: row.response_description,
            receipt: row.mpesa_receipt
        });
        this.openView();
    }
    handleTrxSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.mpesa_list.filter(s => {
            return s.phone_number.includes(value) || s.status.includes(value) || s.mpesa_receipt.includes(value) || s.amount.includes(value) || s.type.includes(value);
        });
        this.setState({
            mpesa_list_temp: searchResult
        });

    }

    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Customer Name","Phone Number", "Mpesa Receipt", "Amount", "Service Type", "Status", "Transaction Date"];
        // define an empty array of rows
        const tableRows = [];
        // for each ticket pass all its data into an array
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.customer_name,
                ticket.phone_number,
                ticket.mpesa_receipt,
                ticket.amount,
                ticket.service_type,
                ticket.response_description,
                //ticket.created_by,
                //ticket.last_update_by,
                // called date-fns to format the date on the ticket
                format(new Date(ticket.timestamp), "yyyy-MM-dd"),
                ticket.company_name
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Kentrade Mpesa Transactions", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Mpesa_Transactions_${dateStr}.pdf`);
    };
    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />

                <Card title='Mpesa Triggers' isOption>

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                            this.openAddDialog()
                        }
                    >Initiate Payment For Augmented services</Button>


                    <br />
                    <br />
                    <CSVLink data={this.state.report} headers={headers} filename='MpesaTransactions.csv'>
                        <FaFileExcel size={50} color='green' title='Download transactions' />
                    </CSVLink>
                    <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        <FaFilePdf title='Download mpesa transactions' size={50} color='red' />
                    </IconButton>
                    
                   
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
             
             


                    <div className="input-group mb-3">
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Receipt or Amount or Phone Number or Status or Service type i.e Augmented, Training" onChange={e => this.handleTrxSearch(e)} />
                    </div>
                    <br />
                    <p>Page {this.state.pageCount}</p>

                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Customer Name</Th>
                                <Th>Phone</Th>
                                <Th>Company</Th>
                                <Th>Receipt</Th>
                                <Th>Amount(KES)</Th>
                                <Th>Time</Th>
                                <Th>Status</Th>
                                <Th>Confirm Payment Action</Th>


                            </Tr>

                        </Thead>
                        {this.state.mpesa_list_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.mpesa_list_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>{u.customer_name}</Td>
                                        <Td>
                                            {u.phone_number}
                                        </Td>
                                        <Td>
                                            {u.company_name}
                                        </Td>
                                        <Td>
                                            {this.moreDetails(u)}
                                        </Td>
                                        <Td>
                                            {u.amount}
                                        </Td>
                                        <Td>
                                            {u.timestamp}
                                        </Td>
                                        <Td>{u.response_description}</Td>
                                        <Td>{this.cellButton(u)}</Td>

                                    </Tr>
                                )
                            )}
                        </Tbody>}
                    </Table>
                    <div className="card-body text-center">
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
             <p>Page {this.state.pageCount}</p>
             </div>

                </Card>



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
                    open={this.state.open}
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Initiate Payment</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.county}
                                            onChange={this.handlerServicesChanges.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Service
                                            </option>
                                            {this.state.services.map(
                                                (c, index) => (
                                                    <option
                                                        key={index}
                                                        value={c.id}
                                                    >
                                                        {c.service + " Fee (KES) " + c.fee}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Phone number (Start with 254) " value={this.state.new_dept_name} onChange={e => this.handleChange(e, "phone_number")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Customer name " value={this.state.customer_name} onChange={e => this.handleChange(e, "customer_name")} />
                                    </div>
                                    <div className="input-group mb-3">
                    <select
                      className="form-control"
                      value={this.state.selected_corp}
                      onChange={this.handlerCorporateChanges.bind(
                        this
                      )}
                    >
                      <option value="">
                        Select Corporate
                      </option>
                      {this.state.corp_list.map(
                        (c, index) => (
                          <option
                            key={index}
                            value={c.id}
                          >
                            {c.corporate_name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <IconButton onClick={() => { this.closeAddDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.initiatePayment() }}>
                                        <FaSave color='green' size={50} title='Perform STK Push' />
                                    </IconButton>
                                </Col>
                            </Row>
                        </div>


                    </div>


                </Dialog>

                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Update Department</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Department name" value={this.state.updated_dept_name} onChange={e => this.handleChange(e, "updated_dept_name")} />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="card-body text-center">
                                        <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeUpdateDialog() }}>Dismiss</button>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="card-body text-center">
                                        <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.updateDepartment() }}>Save</button>
                                    </div>
                                </Col>
                            </Row>
                        </div>


                    </div>


                </Dialog>
                <Dialog
                    open={this.state.openView}

                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <Table style={{ textAlign: 'left' }}>
                                <Tbody>
                                    <Tr key={0}>
                                        <Td><b>Request Id</b></Td>
                                        <Td>{this.state.requestid}</Td>
                                    </Tr>

                                    <Tr key={1}>
                                        <Td><b>Mpesa receipt</b></Td>
                                        <Td>{this.state.receipt}</Td>
                                    </Tr>

                                    <Tr key={2}>
                                        <Td><b>Mpesa response code</b></Td>
                                        <Td>{this.state.responsecode}</Td>
                                    </Tr>
                                    <Tr key={3}>
                                        <Td><b>Mpesa Description</b></Td>
                                        <Td>{this.state.responsedesc}</Td>
                                    </Tr>
                                </Tbody>

                            </Table>



                        </div>
                        <Row>

                            <div className="card-body text-center">
                                <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeView() }}>Dismiss</button>
                            </div>


                        </Row>


                    </div>

                </Dialog>


            </Aux>

        );
    }
}

export default MpesaTransactions;