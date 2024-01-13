import React from 'react';
import { Row, Col,Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton} from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
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
const headers = [
    { label: "System Module", key: "module" },
    { label: "Narration", key: "narration" },
    { label: "Activity Date", key: "activity_date" }
];
class AuditReports extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            audit_reports: [],
            training_requests: [],
            customer_complaints: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id:'',
            receipt_no:'',
            amount:'',
            account_name:'',
            mobile_number:'',
            payment_code: '',
            service_type: '',
            requested_service_name: '',
            status: '',
            _notificationSystem: null,
            date_created:'',
            updated_role:'',
            show_progress_status:false,
            query_status_url:'',
            openConfirm:false,
            type:'UserAuthentication_Services',
            report_name:'UserAuthentication_Services_audit_report.csv',
            show_payment:false,
            show_training:false,
            show_complaints:false,
            report:[],
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getAuditReports(0,"UserAuthentication_Services");
        await this.getDownloadableAuditReports("UserAuthentication_Services");
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
    async getAuditReports(pagenum,val) {
        //call API
        const notification = this.notificationSystem.current;
        this.setState({
            show_progress_status:true
        });
       
       
        let apiResponse = await APIService.makeApiGetRequest("user_activity/" + pagenum + "/10/"+val);
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ audit_reports: apiResponse });
                    
            }
            this.setState({
                show_progress_status:false
            });
       
    }

    async getDownloadableAuditReports(val) {
        //call API
        const notification = this.notificationSystem.current;
        this.setState({
            show_progress_status:true
        });
       
       
        let apiResponse = await APIService.makeApiGetRequest("user_activity/all_report/"+val);
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                   
                    apiResponse.forEach(r => {
                        let params = {};
                        params["module"] = r.system_module;
                        params["narration"] = r.narration;
                        params["activity_date"] = r.activity_date;
                        this.state.report.push(params);
        
                    });
                 
                    
            }
            this.setState({
                show_progress_status:false
            });
       
    }




    
      cellButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
            size="sm"
            variant="primary"
            onClick={() =>
                this.onClickTicketSelected(cell, row, enumObject, rowIndex)
            }
        >
            More Details
        </Button>

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

    titleName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
            {row.customer_tickets.title}
            </p>

        );
    }

    categoryName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
            {row.customer_tickets.category.category_name}
            </p>

        );
    }

    requestDate(cell, row, enumObject, rowIndex) {
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
   
    closeUpdateDialog(){
        this.setState({ openUpdate: false }); 
    }
    openUpdateDialog(){
        this.setState({ openUpdate: true }); 
    }

    closeAddDialog(){
        this.setState({ open: false }); 
    }
    openAddDialog(){
        this.setState({ open: true }); 
    }

    closeConfirmDialog(){
        this.setState({ openConfirm: false }); 
       
    }
    openConfirmDialog(){
        this.setState({ openConfirm: true }); 
        this.closeUpdateDialog();
    }
    openDeleteDialog(cell, row, enumObject, rowIndex){
        this.setState({ 
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        }); 
    }
    

    handlerTypeChange(e){
        this.setState({
          trx_type:e.target.value
      });
      }

      handlerTicketTypeChange(e){
        this.setState({
        type:e.target.value,
        pageCount:1,
        report_name:e.target.value+"_audit_report.csv"
      });
      let val = e.target.value;
      this.getAuditReports(0,val);
      this.getDownloadableAuditReports(val);
      }
      getFormatedStartDate(val) {
      
        let date = new Date(val);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
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

let concatTime = year+'-' + month + '-'+dt + ' '+hour+':'+mins;
      return concatTime;
    }

    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["System Module", "Narration", "Activity Date"];
        // define an empty array of rows
        const tableRows = [];


       

        // for each ticket pass all its data into an array
        this.state.audit_reports.forEach(ticket => {
            const ticketData = [
                ticket.system_module,
                ticket.naration,

                format(new Date(ticket.activity_date), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Kentrade System Audit Report", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`SystemAuditReport${dateStr}.pdf`);
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
        await this.getAuditReports(add,this.state.type);
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
            await this.getAuditReports(add,this.state.type);
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
                    <Card title='System audit reports' isOption>
                    <label style={{ color: '#000000' }}><b>Module</b></label>
                                    <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.type}
                                        onChange={this.handlerTicketTypeChange.bind(
                                            this
                                        )}
                                      >
                                        <option value="">
                                          Select module
                                        </option>
                                        <option value="UserAuthentication_Services">
                                        System user authentication actions
                                        </option>

                                        <option value="Corporate_Services">
                                        Corporate actions
                                        </option>
                                        <option value="MobileApp_Registration_Services">
                                        Mobile app registration actions
                                        </option>
                                        <option value="SMSTemplate_Services">
                                         SMS Template actions
                                        </option>
                                        <option value="CRM_Configs">
                                         CRM configs actions
                                        </option>
                                        <option value="Department_Services">
                                         Organization department actions
                                        </option>
                                        <option value="MpesaConfig_Services">
                                         Mpesa config actions
                                        </option>
                                        <option value="Region_Services">
                                         Regions actions
                                        </option>
                                        <option value="Scheduling_Services">
                                         Scheduling actions
                                        </option>
                                        <option value="Scheduled_Training_Services">
                                         Scheduled training actions
                                        </option>
                                        <option value="SMTP_Services">
                                         SMTP actions
                                        </option>
                                        <option value="Augmented_Services">
                                         Augmented service actions
                                        </option>
                                      </select>
                                     
                                    </div>
                      
                            

 
                            
                        </Card>
                        <br />
                        {this.state.audit_reports==null ||this.state.audit_reports.length == 0 ? null:<CSVLink data={this.state.report} headers={headers} filename={this.state.report_name}>
                        <FaFileExcel size={50} color='green' title='Download audit report' />
                    </CSVLink>}
                        {this.state.audit_reports==null ||this.state.audit_reports.length == 0 ? null:
                        
                        <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        
                        <FaFilePdf title='Download audit report' size={50} color='red' />
                    </IconButton>}
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
                        <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>System module</Th>
                                <Th>Narration</Th>
                                <Th>Activity Date</Th>
                                
                               

                            </Tr>

                        </Thead>
                        {this.state.audit_reports==null ||this.state.audit_reports.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                {this.state.type==null || this.state.type==""?
                                <Td style={{color:'red'}}>Select a module....</Td>:<Td style={{color:'blue'}}>Loading ....</Td>}
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.audit_reports.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.system_module}
                                        </Td>
                                        <Td>
                                            {u.naration}
                                        </Td>
                                        <Td>
                                            {u.activity_date}
                                        </Td>
                                        
                                   
                                       
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
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.closeTicket() }}>Yes</button>
                            </div>
                            </Col>
                        </Row> 


                    </div>

                </Dialog>
               
            </Aux>
            
        );
    }
}

export default AuditReports;