import React from 'react';
import { Row, Col, Button, Image } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton } from '@material-ui/core';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import Authenticatonservice from '../../service/Authenticatonservice';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import EditIcon from '@material-ui/icons/Edit';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaTimes, FaUserPlus, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
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
    { label: "First name", key: "firstname" },
    { label: "Surname", key: "surname" },
    { label: "Last name", key: "lastname" },
    { label: "Email address", key: "email" },
    { label: "Phone number", key: "phonenumber" },
    { label: "Active", key: "active" },
    { label: "Approved", key: "isApproved" },
    { label: "Updated by", key: "modifiedby" },
    { label: "Date created", key: "datecreated" },

];
class Customers extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            customer: [],
            customer_temp: [],
            sysroles: [],
            files: [],
            role_privileges: [],
            all_privileges: [],
            selected_privileges: [],
            compare_role_privileges: [],
            openView: false,
            openAdd: false,
            hover: false,
            checked_value: false,
            closesession: false,
            openUpdate: false,
            updateopen: false,
            _notificationSystem: null,
            id: '',
            firstname: '',
            surname: '',
            lastname: '',
            phonenumber: '',
            active: false,
            isApproved: false,
            updated_hover: false,
            open: false,
            cropcycle: '',
            showmoremessage: 'Click here to show more details',
            disabled: false,
            show_progress_status: false,
            showmore: false,
            showbtn: true,
            showdocmessage: 'Click here to show uploaded documents',
            datecreated: '',
            dateupdated: '',
            status: '',
            remarks: '',
            updatedby: '',
            national_id_filename: '',
            national_id_filetype: '',
            national_id: '',
            showdocs: false,
            report: [],
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getCustomerReport();
        await this.getCustomers(0);
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }

    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getCustomers(pagenum) {
        //call API
        console.log("Page number")
        console.log(pagenum)
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("customer/0/10");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ customer: apiResponse, customer_temp: apiResponse });




        }
    }
    async getCustomerReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("customer");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            //create report

            apiResponse.forEach(r => {
                let params = {};
                params["firstname"] = r.firstname;
                params["surname"] = r.lastname;
                params["lastname"] = r.lastname;
                params["email"] = r.email;
                params["phonenumber"] = r.phonenumber;
                params["postaladdress"] = r.postaladdress;
                params["status"] = r.status;
                params["updatedby"] = r.system_user !== null ? r.system_user.username : "None"
                params["dateupdated"] = r.dateupdated;
                params["datecreated"] = r.datecreated;
                this.state.report.push(params);

            });


        }
    }

    async approveCustomer() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("approve_registered_customer")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to approve customer registration. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {

            if (!this.state.isApproved && (this.state.remarks == null || this.state.remarks === '')) {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter reason for rejecting customer registration',
                    level: 'warning',
                    autoDismiss: 5
                });
            }else if(this.state.status == null || this.state.status === '' || this.state.status == "submitted") {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please select status',
                    level: 'warning',
                    autoDismiss: 5
                });
                
            }else {

                let params = {};
                let flag = this.state.status == "approved" ? "approve" : "reject";
                params["id"] = this.state.id;
                params["flag"] = flag;
                params["remarks"] = this.state.remarks;


                let result = await APIService.makePostRequest("customer/update_status", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        id: '',
                        flag: '',
                        remarks: '',

                    });
                    this.getCustomers(0);
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

    async getAllPrivileges() {
        //call API

        await APIService.makeApiGetRequest("privileges")
            .then(data => this.setState({ all_privileges: data }));

    }

    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };

    closeUpdateDialog() {
        this.setState({
            openUpdate: false,
            updated_hover: false,
            showmore: false
        });
    }
    openSessionDialog() {
        this.setState({ closesession: true });
    };
    cellButton(row) {
        const { classes } = this.props;
        return (
            <IconButton onClick={() =>
                this.onClickCustomerSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='More Actions' />
            </IconButton>

        );
    }


    async onClickCustomerSelected(row) {
        this.setState({
            id: row.id,
            firstname: row.firstname,
            postaladdress: row.postaladdress,
            surname: row.surname,
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            isActive: row.active,
            isApproved: row.isApproved,
            phonenumber: row.phonenumber,
            status: row.status,
            remarks: row.remarks,
            updatedby: row.system_user !== null ? row.system_user.username : "None",
            datecreated: row.datecreated,
            dateupdated: row.dateupdated,
            national_id: row.national_id,
            national_id_filename: row.national_id_filename,
            national_id_filetype: row.national_id_filetype,
            openUpdate: true,
            updated_hover: true,
        });
        if (row.status == "rejected" || row.status == "approved") {
            this.setState({
                showbtn: false
            })
        } else {
            this.setState({
                showbtn: true
            })
        }
        let fileData = [];
        // row.national_id.forEach(f => {
        //     let param = {}
        //     param["filename"] = f.fileName
        //     param["data"] = f.data
        //     fileData.push(param)
        // });
        let param = {}
        param["filename"] = row.national_id_filename
        param["data"] = row.national_id
        fileData.push(param)
        this.setState({ files: fileData });


    }

    handleCustomerSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.customer.filter(s => {
            return s.status.includes(value) || s.email.includes(value) || s.firstname.includes(value);
        });
        this.setState({
            customer_temp: searchResult
        });

    }
    // define a generatePDF function that accepts a tickets argument
    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Name", "Email", "Contact", "Status", "UpdatedBy", "DateCreated", "DateUpdated"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.firstname + " " + ticket.lastname,
                ticket.email,
                ticket.phonenumber,
                ticket.status,
                ticket.updatedby,
                // called date-fns to format the date on the ticket
                format(new Date(ticket.datecreated), "yyyy-MM-dd"),
                format(new Date(ticket.dateupdated), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Sonysugar Temporary Contract Requests", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Temporary_Contract_Requests${dateStr}.pdf`);
    };
    async AddPage() {
        this.setState({ show_progress_status: true });
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        add++;
        count++;
        this.setState({
            pageNum: add,
            pageCount: count
        });
        await this.getLar(add);
        this.setState({ show_progress_status: false });
    }
    async RemovePage() {
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        if (this.state.pageNum > 0) {
            this.setState({ show_progress_status: true });
            add--;
            count--;
            this.setState({
                pageNum: add,
                pageCount: count
            });
            await this.getLar(add);
            this.setState({ show_progress_status: false });
        }
    }
    showMoreDetails() {
        if (this.state.showmore) {
            this.setState({ showmoremessage: 'Click here to show more details', showmore: false })
        } else {
            this.setState({ showmoremessage: 'Hide details', showmore: true })
        }

    }
    showDocDetails() {
        if (this.state.showdocs) {
            this.setState({ showdocmessage: 'Click here to show uploaded national Id document', showdocs: false })
        } else {
            this.setState({ showdocmessage: 'Hide document', showdocs: true })
        }

    }
    getFormattedStatus(val) {
        if (val == "rejected") {
            return <Td style={{ color: 'red' }}>{val}</Td>
        }

        if (val == "approved") {
            return <Td style={{ color: 'green' }}>{val}</Td>
        }

        if (val == "submitted") {
            return <Td style={{ color: 'orange' }}>pending review</Td>
        }

        return <Td>Unknown</Td>
    }
    render() {

        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />


                <Card title='Customer registration' isOption>




                    <br />
                    <br />
                    <CSVLink data={this.state.report} headers={headers} filename='Customer_Registration_Requests.csv'>

                        <FaFileExcel size={50} color='green' title='Download customer registration requests' />
                    </CSVLink>
                    <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        <FaFilePdf title='Download customer registration requests' size={50} color='red' />
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
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by request Id or status or contact" onChange={e => this.handleCustomerSearch(e)} />
                    </div>
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Status</Th>
                                <Th>Action</Th>

                            </Tr>

                        </Thead>
                        {this.state.customer_temp == null || this.state.customer_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.customer_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.firstname} {u.lastname}
                                        </Td>
                                        <Td>
                                            {u.email}
                                        </Td>
                                        <Td>
                                            {u.phonenumber}
                                        </Td>
                                        <Td>
                                        {this.getFormattedStatus(u.status)}
                                        </Td>
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
                    maxWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Review Registration</h3>
                            <Row>
                                <p><b style={{ color: 'brown' }} onClick={() => { this.showMoreDetails() }}>{this.state.showmoremessage}</b></p>
                            </Row>
                            <br />
                            {this.state.showmore ? <Row>

                                <label style={{ color: '#000000' }}><b>First name</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.firstname} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Surname</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.surname} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Last name</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.lastname} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Email</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.email} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Phone</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.phonenumber} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Postal Address</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.postaladdress} readOnly />
                                </div>

                            </Row> : null}
                            <Row>
                                <label style={{ color: '#000000' }}><b>Status</b></label>
                                <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.status}
                                        onChange={e => this.handleChange(e, "status")}
                                    >
                                        <option value="submitted">
                                            Pending review
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>
                                        <option value="approved">
                                            Approved
                                        </option>
                                    </select>
                                </div>
                                <label style={{ color: '#000000' }}><b>Remarks</b></label>
                                <div className="input-group mb-3">

                                    <textarea
                                        className="form-control"
                                        value={this.state.remarks}
                                        style={{ height: '200px', width: '600px' }}
                                        onChange={e => this.handleChange(e, "remarks")}
                                    ></textarea>
                                </div>

                            </Row>
                            <Row>
                                <p><b style={{ color: 'brown' }} onClick={() => { this.showDocDetails() }}>{this.state.showdocmessage}</b></p>
                            </Row>
                            {this.state.showdocs ? <Row>
                                {this.state.files.map(
                                    f => (
                                        <div className="card-body text-center">
                                            <center>
                                                {f.filename.includes(".pdf") ? <embed src={`data:application/pdf;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpeg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : <img src={`data:image/png;base64,${f.data}`} height={500} width={800} />}
                                            </center>
                                        </div>
                                    )
                                )}
                            </Row> : null}
                            <br />
                            <Row key={0}>
                                <Col>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                            this.closeUpdateDialog()
                                        }
                                    >
                                        Dismiss
                                    </Button>
                                </Col>
                                <Col>
                                    {this.state.showbtn ? <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() =>
                                            this.approveCustomer()
                                        }
                                    >
                                        Save
                                    </Button> : null}

                                </Col>
                            </Row>






                        </div>


                    </div>




                </Dialog>

            </Aux>
        );
    }
}

export default Customers;