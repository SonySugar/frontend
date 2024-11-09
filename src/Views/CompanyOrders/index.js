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
import CustomerAuthenticationservice from '../../service/CustomerAuthenticationservice';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import EditIcon from '@material-ui/icons/Edit';
import { Email, ShoppingCart, Visibility } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaDoorOpen } from 'react-icons/fa';
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

class CompanyOrders extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            orders: [],
            orders_temp: [],
            cart_items: [],
            report:[],
            dispatch_list: [],
            dispatch_instruction: '',
            orderstatus: '',
            reason:'',
            showpaidamount:false,
            amountpaid:0,
            wallet_balance:0,
            openReceiptUpload: false,
            requestid: '',
            file: null,
            lpos:[],
            receipts:[],
            pageNum: 0,
            pageCount: 1,
            total: 0,
            fullnames: '',
            email:'',
            phone: '',
            showreason: false,

        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getOrders(0);
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}' ) {
            this.logout();
        } 

    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getOrders(pagenum) {
        //call API

        let endpoint = "company/order/"+pagenum+"/3";
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest(endpoint);

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ orders: apiResponse, orders_temp: apiResponse });

        }
    }
    handleProductSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.orders.filter(s => {
            return s.orderstatus.includes(value);
        });
        this.setState({
            orders_temp: searchResult
        });

    }
    onClickOrderSelected(row) {
        let orderItems = row.files
        let items = [];
        orderItems.forEach((item, index) => {
            let orderItem = {
                productcode: item.product.productcode,
                productname: item.product.productname,
                unitofmeasure: item.product.unitofmeasure,
                quantity: item.quantity,
                price: item.product.price,
                total: parseFloat(item.quantity) * parseFloat(item.product.price)
            }
            items.push(orderItem);
        });
        let lpoFileData = [];
        let receiptData = [];
        let param = {}
        let receiptParam = {}
        if(row.lpo!=null){
            param["filename"] = row.lpofilename
            param["data"] = row.lpo
            lpoFileData.push(param)
        }

        if(row.receipt!=null){
            receiptParam["filename"] = row.receiptfilename
            receiptParam["data"] = row.receipt
            receiptData.push(receiptParam)
        }

        this.setState({ cart_items: items, requestid: row.id, fullnames: row.company.companyname, email:row.company.email, phone:row.company.phonenumber, lpos:lpoFileData, receipts:receiptData, dispatch_instruction:row.dispatch_instruction.description, orderstatus:row.orderstatus, wallet_balance:row.company.wallet.balance });

    }

    async updateOrder() {
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("approve_order")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to process customer request orders. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //map.set('orders', prodOrders);
        let endpoint = "approve/reject/order";
        let params = {};
        params["status"] = this.state.orderstatus
        params["type"] = "company"
        params["reason"] = this.state.reason
        params["id"] = this.state.requestid
        params["totalpaid"] = this.state.amountpaid

        let response = await APIService.makePostRequest(endpoint, params);
        if (response.success) {
          notification.addNotification({
            message: response.message,
            level: 'success',
            autoDismiss: 5,
            
          });
          this.setState({orderstatus:'',requestid:'',openReceiptUpload:false});
            await this.getOrders(0);
        } else {
          this.setState({ show_progress_status: false });
          notification.addNotification({
            message: response.message,
            level: 'error',
            autoDismiss: 5,
            
          });
        }
        this.setState({ show_progress_status: false });
    }
    
    }
    uploadFile = async e => {
        this.setState({
          file: e.target.files[0]
        });
        }

    cellButton(row) {
        return (

            <IconButton onClick={() =>
                this.onClickOrderSelected(row)
            }>
                <Visibility style={{ color: "green" }} titleAccess='View' />
            </IconButton>

        );
    }
    cellEditButton(row) {
        return (

            <IconButton onClick={() =>
                this.openDispatchDialog(row)
            }>
                <EditIcon style={{ color: "brown" }} titleAccess='Update' />
            </IconButton>

        );
    }
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
        await this.getOrders(add);
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
            await this.getOrders(add);
            this.setState({ show_progress_status: false });
        }
    }
    openDispatchDialog(row){
        this.onClickOrderSelected(row);
        this.setState({openReceiptUpload:true, requestid:row.id});
    }
    closeDispatchDialog(){
        this.setState({openReceiptUpload:false});
    }
    handleChange = (event, stateName) => {
        this.setState({
          [stateName]: event.target.value
        });
      };
    async handlerOrderStatus(e) {
        let status = e.target.value;
        if(status=='Order cancelled'){
            this.setState({showreason:true});
            this.setState({showpaidamount:false});
        }else if(status == 'Order dispatched'){
            this.setState({showreason:false});
            this.setState({showpaidamount:true});
        }else{
            this.setState({showreason:false});
            this.setState({showpaidamount:false});
        }

        this.setState({ orderstatus: status });
      }
        render() {

        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />


                <Card title='Company orders' isOption>
            
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
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Status" onChange={e => this.handleProductSearch(e)} />
                    </div>
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Order Id</Th>
                                <Th>Date created</Th>
                                <Th>Status</Th>
                                <Th>View details</Th>
                                <Th>Update</Th>

                            </Tr>

                        </Thead>
                        {this.state.orders_temp == null || this.state.orders_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.orders_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.id}
                                        </Td>
                                        <Td>{format(new Date(u.datecreated), "yyyy-MM-dd")}</Td>
                                        <Td>
                                            {u.orderstatus}
                                        </Td>
                                        <Td>{this.cellButton(u)}</Td>
                                        <Td>{this.cellEditButton(u)}</Td>
                                    </Tr>
                                )
                            )}
                        </Tbody>}
                    </Table>


                </Card>
                <Card title='Order details ' isOption>
                    <h3>Order details #{this.state.requestid}</h3>
                    <h6>{this.state.fullnames}</h6>
                    <h6>{this.state.email}</h6>
                    <h6>{this.state.phone}</h6>
                    <h6>Wallet balance: KES {this.state.wallet_balance}</h6>
                    <b>Dispatch instructions: </b><h6>{this.state.dispatch_instruction}</h6>
                <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Code</Th>
                                <Th>Name</Th>
                                <Th>Unit of measure</Th>
                                <Th>Price</Th>
                                <Th>Quantity</Th>
                                <Th>Subtotal</Th>

                            </Tr>

                        </Thead>
                        {this.state.cart_items == null || this.state.cart_items.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.cart_items.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.productcode}
                                        </Td>
                                        <Td>
                                            {u.productname}
                                        </Td>
                                        <Td>
                                            {u.unitofmeasure}
                                        </Td>
                                        <Td>
                                            {u.price}
                                        </Td>
                                        <Td>
                                            {u.quantity}
                                        </Td>
                                        <Td>
                                            {u.total}
                                        </Td>
                                    </Tr>
                                )
                            )}
                        </Tbody>}
                        <Tbody>

                            <Tr style={{ border: '1px solid' }}>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td><b>Net</b></Td>
                                <Td>{this.state.cart_items.reduce((a, b) => a + (b['total'] || 0), 0)}</Td>
                            </Tr>
                            <Tr style={{ border: '1px solid' }}>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td><b>Vat</b></Td>
                                <Td>{this.state.cart_items.reduce((a, b) => a + (b['total'] || 0) * 16/100, 0)}</Td>
                            </Tr>
                            <Tr style={{ border: '1px solid' }}>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td><b>Total</b></Td>
                                <Td>{this.state.cart_items.reduce((a, b) => a + (b['total'] || 0) + (b['total'] || 0) * 16/100, 0)}</Td>
                            </Tr>
                            
                        </Tbody>
                    </Table>

                    </Card>
                    <Card title='Attachments'>

                    {this.state.lpos.length>0?<div>
                    {this.state.lpos.map(
                                    f => (
                                        <div className="card-body text-center">
                                            <center>
                                                {f.filename.includes(".pdf") ? <embed src={`data:application/pdf;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpeg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : <img src={`data:image/png;base64,${f.data}`} height={500} width={800} />}
                                            </center>
                                        </div>
                                    )
                                )}</div>:<h3>No LPO available</h3>}
                    {this.state.receipts.length>0?<div>
                    {this.state.receipts.map(
                                    f => (
                                        <div className="card-body text-center">
                                            <center>
                                                {f.filename.includes(".pdf") ? <embed src={`data:application/pdf;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpeg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : <img src={`data:image/png;base64,${f.data}`} height={500} width={800} />}
                                            </center>
                                        </div>
                                    )
                                )}</div>:<h3>No receipt available</h3>}
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
          open={this.state.openReceiptUpload}
          onClose={this.closeDispatchDialog.bind(this)}
          fullWidth

        >
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
          <div className="card">

            <div className="card-body text-center">

                <h3>Order request {this.state.requestid}</h3>
             <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.orderstatus}
                                            onChange={this.handlerOrderStatus.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select status
                                            </option>
                                           <option value="Payment receipt required">Payment receipt required</option>
                                            <option value="Order dispatched">Order dispatched</option>
                                            <option value="Order cancelled">Order cancelled</option>
                                        </select>

                                    </div>

                                    {this.state.showreason?<div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter reason" value={this.state.reason} onChange={e => this.handleChange(e, "reason")} />
              </div>:null}
              {this.state.showpaidamount?<label>Enter total amount captured on the receipt</label>:null}
              {this.state.showpaidamount?<div className="input-group mb-3">
                
                <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Enter total amount captured on receipt" value={this.state.amountpaid} onChange={e => this.handleChange(e, "amountpaid")} />
              </div>:null}
              <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.updateOrder() }}>Save</button>
              {this.state.registering && (<img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />)}
            </div>
          </div>


        </Dialog>
                
            </Aux>
        );
    }
}

export default CompanyOrders;