import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import DatePicker from "react-datepicker";
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import { FaFileExcel, FaTimes, FaUserPlus, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import CloseIcon from '@material-ui/icons/Close';


import "react-datepicker/dist/react-datepicker.css";

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

class CorporateBooking extends React.Component {
  notificationSystem = React.createRef();
  constructor() {
    super();
    this.state = {
      training_list: [],
      open: false,
      openUpdate: false,
      openDelete: false,
      openEnd: false,
      closesession: false,
      training_id: '',
      uploaded_file_list: [],
      corp_list: [],
      schedule_list: [],
      selected_corp: '',
      updated_selected_corp: '',
      counties: [],
      confirm_list:[],
      fileUploading: false,
      payment_mode: 'Mpesa',
      startdate: '',
      delivery_mode: '',
      enddate: '',
      county: '',
      fees: 0,
      previous_fee: 0,
      updated_fees: 0,
      updated_previous_fee: 0,
      updated_training_id: '',
      updated_enddate: '',
      no_of_participants: 0,
      updated_startdate: '',
      new_service_name: '',
      training_name: '',
      updated_new_service_name: '',
      show_max_participants: false,
      delete_service_name: '',
      delete_service_id: '',
      update_service_id: '',
      _notificationSystem: null,
      role: '',
      updated_role: '',
      trx_ref: '',
      new_newfeetwo: '',
      new_previousfeetwo: '',
      new_newfeeone: '',
      new_previousfeeone: '',
      new_duration: '',
      new_service_name: '',
      update_new_duration: '',
      update_new_previousfeeone: '',
      update_new_service_name: '',

      update_new_newfeeone: '',
      updated_county: '',
      payment_confirmation_status: 'NO CONFIRMATION',
      payment_confirmed: 'no',

      update_new_previousfeetwo: '',
      update_new_newfeetwo: '',
      training_type: '',
      delivery_mode: '',
      updated_delivery_mode: '',
      updated_training_type: '',
      no_of_participants: 1,
      updated_no_of_participants: 1,
      show_max_participants: false,
      start_date: '',
      end_date: '',
      show_actions: false,
      openFileList: false,
      file_contents: [],
      selected_file_id:'',
      selected_file_name:'',
      confirmed_amount:'',
      confirmed_date:'',
      openReject:false,
      reject_id:'',
    }
  }
  async componentDidMount() {
    this.setState({ fileUploading: true });
    this.checkLogin();
    await this.getFiles();
    await this.getCorporates();
    await this.getScheduled();
    this.setState({ fileUploading: false });
  }
  checkLogin() {
    if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
      this.logout();
    }
  }

  async getScheduled() {
    //call API
    const notification = this.notificationSystem.current;
    let apiResponse = await APIService.makeApiGetRequest("schedule/list/approved");



    this.setState({ schedule_list: apiResponse });
    console.log(this.state.schedule_list.length);

  }
  handleChange = (event, stateName) => {
    let fee = this.state.previous_fee;
    let updated_fee = this.state.updated_previous_fee;

    if (stateName === "no_of_participants") {

      this.setState({
        [stateName]: event.target.value,

      });
      if (event.target.value !== null && event.target.value > 0) {
        fee = fee * event.target.value;
      }
      this.setState({

        fees: fee
      });
    } else if (stateName === "updated_no_of_participants") {
      if (event.target.value !== null && event.target.value > 0) {
        updated_fee = updated_fee * event.target.value;
      }
      this.setState({
        [stateName]: event.target.value,
        updated_fees: updated_fee
      });
    } else {
      this.setState({
        [stateName]: event.target.value
      });
    }
  };
  logout() {

    const { from } = this.props.location.state || {
      from: { pathname: "/" }
    };
    this.props.history.push("/");

  }
  async getServices() {
    //call API
    const notification = this.notificationSystem.current;
    let apiResponse = await APIService.makeApiGetRequest("training/services");
    if (apiResponse.status == 403) {
      this.setState({ closesession: true });
      notification.addNotification({
        message: apiResponse.message,
        level: 'error',
        autoDismiss: 5
      });
    } else {

      this.setState({ training_list: apiResponse });

      this.getFiles();
      this.getCounties();
     

    }

  }
  async getFiles() {
    //call API
    const notification = this.notificationSystem.current;
    let apiResponse = await APIService.makeApiGetRequest("uploaded_files");
  
    if (apiResponse.status == 403) {
      this.setState({ closesession: true });
      notification.addNotification({
        message: apiResponse.message,
        level: 'error',
        autoDismiss: 5
      });
    } else {

    this.setState({ uploaded_file_list: apiResponse });

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
  async getCounties() {
    //call API

    let apiResponse = await APIService.makeApiGetRequest("counties");
    this.setState({ counties: apiResponse });

  }
  getDepartment(cell, row) {
    return cell.dept_name;
  }
  getRole(cell, row) {
    return cell.role_name;
  }
  closeRejectDialog(){
    this.setState({
      openReject: false
    });
  }

  openRejectDialog(row){
    this.setState({
      openReject: true,
      reject_id:row.id,
    });
  }
  async rejectFile(){
    this.closeRejectDialog();
    this.setState({ show_progress_status: true });
    const notification = this.notificationSystem.current;

    
      let params = {};
      params["id"] = this.state.reject_id;

      let result = await APIService.makePostRequest("reject_file", params);
      if (result.success) {
        notification.addNotification({
            message: 'File successfully rejected',
            level: 'success',
            autoDismiss: 5
          });
          this.closeDeleteDialog();
          this.setState({
            reject_id:'',
          });
          this.getFiles();
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
  cellButton(row) {
    

    return (

      <Button
        size="sm"
        variant="primary"
        onClick={() =>
          this.onPreApproval(row)
        }
      >
        Approve
      </Button>

    );
  }

  deleteButton(row) {
    

    return (

      <Button
        size="sm"
        variant="danger"
        onClick={() =>
          this.openRejectDialog(row)
        }
      >
        Reject
      </Button>

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

  closeDeleteDialog() {
    this.setState({ openDelete: false });
  }
  closeEndDialog() {
    this.setState({ openEnd: false });
  }
  openStartDialog(cell, row, enumObject, rowIndex) {

    let startDate = row.start_date.slice(0, 10);
    let endDate = row.end_date.slice(0, 10);
    this.setState({
      openDelete: true,
      training_id: row.id,
      training_name: row.trainings.module,
      updated_startdate: startDate,
      updated_enddate: endDate,
    });
  }

  openEndDialog() {

    this.setState({
      openEnd: true,
    });
  }
  onPreApproval(row){
    this.setState({
      selected_file_id:row.id,
      selected_file_name:row.file_name,
      openDelete:true,
    });
  
  }
  onClickServiceSelected(cell, row, enumObject, rowIndex) {
    let startDate = new Date(row.start_date);
    let endDate = new Date(row.end_date);
    let base = this.state.training_list.filter(a => {
      return a.id == row.trainings.id
    });
    let baseFee = base[0].previousfeeone;
    if (row.trainingtype === "Corporate") {
      this.setState({
        show_max_participants: true
      });
    } else {
      this.setState({
        show_max_participants: false
      });
    }
    this.setState({
      updated_training_id: row.id,
      updated_startdate: startDate,
      updated_enddate: endDate,
      training_name: row.trainings.module,
      updated_delivery_mode: row.delivery_mode,
      updated_training_type: row.trainingtype,
      updated_no_of_participants: row.no_of_participants,
      updated_fees: row.fees,
      updated_previous_fee: baseFee,
      updated_county: row.county


    });
    this.openUpdateDialog();
  }

  
  async confirmApproval() {
    this.setState({ fileUploading: true });
    const notification = this.notificationSystem.current;


    let params = {};
    params["id"] = this.state.selected_file_id;
    params["status"] = "Approved";



    let result = await APIService.makePostRequest("approve_file", params);
    if (result.success) {
      notification.addNotification({
        message: 'File has been approved',
        level: 'success',
        autoDismiss: 5
      });
      this.closeDeleteDialog();
      this.setState({
        selected_file_id: '',
      });
      this.getFiles();
      this.setState({ fileUploading: false });
    } else {
      this.setState({ fileUploading: false });
      notification.addNotification({
        message: result.message,
        level: 'error',
        autoDismiss: 5
      });

    }
  }

  async confirmPayment() {
    this.setState({ fileUploading: true });
    const notification = this.notificationSystem.current;



    if (this.state.trx_ref === '') {
      notification.addNotification({
        message: 'Please enter a transaction reference',
        level: 'warning',
        autoDismiss: 5
      });

    } else if (this.state.payment_mode === '') {
      notification.addNotification({
        message: 'Please select a mode of payment',
        level: 'warning',
        autoDismiss: 5
      });
    } else {
      let params = {};
      params["trxref"] = this.state.trx_ref;
      params["mode"] = this.state.payment_mode;
      let result = await APIService.makePostRequest("transactions/confirm", params);
      this.setState({ confirm_list: result });
      this.setState({ fileUploading: false });
   
      this.openEndDialog();
      
        this.setState({
          payment_confirmed: 'yes',
          payment_confirmation_status: result[0].status,
          confirmed_amount: result[0].amount,
          confirmed_date: result[0].transactiondate
          
        })
    
      
    }
  }

  uploadFile = async e => {
    const notification = this.notificationSystem.current;
    this.setState({
      fileUploading: true
    });
    const files = e.target.files;
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("corp_id", this.state.selected_corp);
    formData.append("scheduled_training", this.state.training_id);
    formData.append("payment_confirmed", this.state.payment_confirmed);
    formData.append("payment_mode", this.state.payment_mode);
    formData.append("trx_ref",this.state.trx_ref);
    formData.append("payment_confirmation_status",this.state.payment_confirmation_status);

    // clear the value
    e.target.value = null;

    let response = await APIService.uploadFile("upload", formData);

    if (response) {
    
      if (response.data && response.data.success) {
        notification.addNotification({
          message: "File uploaded successfully",
          level: 'success',
          autoDismiss: 5
        });
         this.setState({
           training_id:'',
           selected_corp:'',
           show_actions:false,
         })
        // get uploaded clients
        this.getFiles();
      } else {
        notification.addNotification({
          message: response.message,
          level: 'error',
          autoDismiss: 5
        });
      }
      this.setState({
        fileUploading: false
      });
    } else {
      notification.addNotification({
        message: 'Something went wrong',
        level: 'error',
        autoDismiss: 5
      });
      this.setState({
        fileUploading: false
      });
    }

  };

  handlerTrainingChanges(e) {
    const notification = this.notificationSystem.current;
    if (this.state.selected_corp === '') {
      notification.addNotification({
        message: 'Please select a corporate',
        level: 'warning',
        autoDismiss: 5
      });
    } else {
      let selected = this.state.schedule_list.filter(a => {
        return a.id == e.target.value
      });
      let startDate = new Date(selected[0].start_date);
      let endDate = new Date(selected[0].end_date);
      let showParticipants = false;

      this.setState({
        fees: selected[0].fee,
        training_id: e.target.value,
        start_date: this.dateConverter(startDate),
        end_date: this.dateConverter(endDate),
        show_actions: true,
        delivery_mode: selected[0].delivery_mode
      });
    }
  }

  handlerTrainingTypeChanges(e) {
    let val = false;
    if (e.target.value === 'Corporate') {
      val = true
    }
    this.setState({
      training_type: e.target.value,
      show_max_participants: val
    });
  }
  handlerPaymentMode(e) {
    this.setState({
      payment_mode: e.target.value
    });
  }
  handlerCorporateChanges(e) {
    this.setState({
      selected_corp: e.target.value
    });
  }
  handlerUpdatedCorporateChanges(e) {
    this.setState({
      updated_selected_corp: e.target.value
    });
  }
  handlerUpdatedTrainingTypeChanges(e) {
    let val = false;
    if (e.target.value === 'Corporate') {
      val = true
    }
    this.setState({
      updated_training_type: e.target.value,
      show_max_participants: val
    });
  }
  handlerUpdatedDeliveryMode(e) {
    this.setState({
      updated_delivery_mode: e.target.value
    });
  }
  handlerUpdatedTrainingChanges(e) {
    this.setState({
      updated_training_id: e.target.value
    });
  }
  setStartDate(e) {

    this.setState({
      startdate: e
    })
  }
  setEndDate(e) {
   

    this.setState({
      enddate: e
    })
  }

  setStartUpdateDate(e) {

    this.setState({
      updated_startdate: e
    })
  }
  setEndUpdateDate(e) {


    this.setState({
      updated_enddate: e
    })
  }


  getTraining(cell, row) {
    return cell.module;
  }
  getFormatedStartDate(cell, row) {
 
    let val = row.start_date
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
  getFormatedEndDate(cell, row) {
    let val = row.end_date
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

    let concatTime = year + '-' + month + '-' + dt + ' ' + hour + ':' + mins;
  
    return concatTime;
  }

  getCorporate(cell) {
    return cell.corporate_name;
  }
  getFileName(row) {
    
    return (
    
      <a href="#"
        onClick={() =>
          this.onClickFileSelected(row)
        }
      >
        {row.file_name}
      </a>

    );
  }
  getScheduledTraining(cell) {
    return cell.trainings.module;
  }

  onClickFileSelected(row) {
    
    this.setState({
      openFileList: true,
      file_contents: row.corp_clients
    })
  }
  closeFileList() {
    this.setState({
      openFileList: false,
    });

  }
  render() {

    return (

      <Aux>
        {this.state.fileUploading && (<SpinnerDiv>
          <CircularProgress />
        </SpinnerDiv>)}
        <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />


        <Row>

          <Col>
            <Card title='Bulk Upload schedule' isOption>
              <div
                style={{
                  textAlign: "left",
                  display: "grid"
                }}
              >

               
                  <a href="/FileUploadTemplates/Corporate_Trainees.xlsx" download>
                  <FaFileExcel size={50} color='green' title='Download template'/>
                  </a>
                
              </div>
              <br />
              <Row>
                <Col>
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
                <Col>
                  <div className="input-group mb-3">
                <select
                      className="form-control"
                      value={this.state.training_id}
                      onChange={this.handlerTrainingChanges.bind(
                        this
                      )}
                    >
                      <option value="">
                        Select Scheduled Training
                      </option>
                      {this.state.schedule_list.map(
                        (c, index) => (
                          <option
                            key={index}
                            value={c.id}
                          >
                            {c.module} ({c.delivery_mode}) |From {this.dateConverter(new Date(c.start_date))} to {this.dateConverter(new Date(c.end_date))}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </Col>
              </Row>
              {this.state.show_actions ? <Table style={{ textAlign: 'left' }} striped={true} bordered={true} hover>
                <tr>
                  <td><b>Delivery mode</b></td>
                  <td>{this.state.delivery_mode}</td>
                </tr>

                {this.state.showlocation ? <tr>
                  <td><b>Location</b></td>
                  <td>{this.state.countyName}</td>
                </tr> : null}
                {this.state.show_max_participants ?
                  <tr>
                    <td><b>Maximum number of participants</b></td>
                    <td>{this.state.no_of_participants}</td>
                  </tr> : null}

                <tr>
                  <td><b>Start date</b></td>
                  <td>{this.state.start_date}</td>
                </tr>
                <tr>
                  <td><b>End date</b></td>
                  <td>{this.state.end_date}</td>
                </tr>
                <tr>
                  <td><b>Fee (KES)</b></td>
                  <td>{this.state.fees}</td>
                </tr>
                {/*<tr>
                  <td>
                    <b>Confirm payment (Optional)</b>
                  </td>
                  <td>
                    <div className="input-group mb-3">
                      <select
                        className="form-control"
                        value={this.state.payment_mode}
                        onChange={this.handlerPaymentMode.bind(
                          this
                        )}
                      >
                        <option value="">
                          Select mode of payment
                        </option>
                        <option value="Mpesa">
                          Mpesa
                        </option>

                        <option value="Airtel Money">
                          Airtel Money
                        </option>



                        <option value="Bank Cheque">
                          Bank Cheque
                        </option>
                      </select>

                    </div>
                    <div className="input-group mb-3">
                      <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Payment reference" value={this.state.trx_ref} onChange={e => this.handleChange(e, "trx_ref")} />
                    </div>

                    <div className="card-body text-center">
                      <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.confirmPayment() }}>Confirm payment</button>
                    </div>
                  </td>
                        </tr>*/}
                <Row>
                  <Col>
                    <input
                      type="file"
                      id="myfile"
                      className="hidden"
                      style={{
                        display: "none",
                        cursor: "pointer"
                      }}
                      onChange={e => this.uploadFile(e)}
                    />
                    <label
                      htmlFor="myfile"
                      style={{
                        position: "relative",
                        top: "3px",
                        width: "193px",
                        height: "34px",
                        fontSize: "15px",
                        textAlign: "center",
                        backgroundColor: "rgb(4,169,245)",
                        color: "white",
                        borderRadius: ".25em",
                        cursor: "pointer",
                        padding: "6px 12px"
                      }}
                    >

                      Upload File
                    </label>
                  </Col>

                </Row>
              </Table> : null}
            

              <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>File name</Th>
                                <Th>Corporate</Th>
                                <Th>Training</Th>
                                <Th>Status</Th>
                                <Th>Approve</Th>
                                <Th>Reject</Th>
                             


                            </Tr>

                        </Thead>
                        {this.state.uploaded_file_list.length==null || this.state.uploaded_file_list.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available....</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.uploaded_file_list.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                    
                                        <Td>
                                        {this.getFileName(u)}
                                        </Td>
                                        <Td>
                                        {this.getCorporate(u.corporate)}
                                        </Td>
                                        <Td>
                                        {this.getScheduledTraining(u.scheduled_trainings)}
                                        </Td>
                                        <Td>
                                            {u.status}
                                        </Td>
                                        <Td>{this.cellButton(u)}</Td>
                                        <Td>{this.deleteButton(u)}</Td>
                                       

                                    </Tr>
                                )
                            )}
                        </Tbody>}
                    </Table>


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
          open={this.state.openDelete}

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
              <h3>{this.state.selected_file_name}</h3>
              <br />
              <br />
              <h4>Are you sure you want to approve this file</h4>



            </div>
            <div className="card-body text-center">
                            <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeDeleteDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.confirmApproval() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                                </div>


          </div>

        </Dialog>

        <Dialog
          open={this.state.openEnd}

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
              <Table style={{ textAlign: 'left' }} striped={true} bordered={true}>
                <tr>
                  <td><b>Payment reference</b></td>
                  <td>{this.state.trx_ref}</td>
                </tr>

                <tr>
                  <td><b>Payment mode</b></td>
                  <td>{this.state.payment_mode}</td>
                </tr>

                <tr>
                  <td><b>Amount paid (KES)</b></td>
                  <td>{this.state.confirmed_amount}</td>
                </tr>
                <tr>
                  <td><b>Date paid</b></td>
                  <td>{this.state.confirmed_date}</td>
                </tr>
                <tr>
                  <td><b>Confirmation status</b></td>
                  <td>{this.state.payment_confirmation_status}</td>
                </tr>

              </Table>



            </div>
            <Row>

              <div className="card-body text-center">
                <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeEndDialog() }}>Dismiss</button>
              </div>


            </Row>


          </div>

        </Dialog>

        <Dialog
          open={this.state.openFileList}
          onClose={this.closeFileList.bind(this)}


        >

          <div className="card">

            <div className="card-body text-center">
              SMS and emails will be sent to the below training participants upon approval
              <Table style={{ textAlign: 'left' }} striped={true} bordered={true}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Full Name</th>
                    <th>Email address</th>
                    <th>Phone number</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.file_contents.map(
                    (c, index) => (
                      <tr
                      >
                        <td>
                          {index + 1}
                        </td>
                        <td>
                          {c.full_names}
                        </td>
                        <td>
                          {c.email_address}
                        </td>
                        <td>
                          {c.phone_number}
                        </td>
                      </tr>

                    )
                  )}
                </tbody>
              </Table>


              <div className="card-body text-center">
                

                <IconButton onClick={() =>
                    this.closeFileList()
                }>
                    <CloseIcon style={{ color: "red" }} titleAccess='Dismiss' />
                </IconButton>
              </div>



            </div>


          </div>


        </Dialog>
        <Dialog
                    open={this.state.openReject}

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
                            <h3>{this.state.delete_dept_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to reject this file?</h4>



                       
                        <Table>
                                <Tbody>
                                    <Tr key={0}>
                                        <Td><IconButton onClick={() => { this.closeRejectDialog() }}>

                                            <FaTimes size={50} title='Cancel' color='green' />
                                        </IconButton></Td>
                                        <Td> <IconButton onClick={() => { this.rejectFile() }}>
                                            <FaSave color='red' size={50} title='Save' />
                                        </IconButton></Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                            </div>

                    </div>

                </Dialog>

      </Aux>

    );
  }
}

export default CorporateBooking;