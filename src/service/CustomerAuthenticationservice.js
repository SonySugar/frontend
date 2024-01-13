class CustomerAuthenticationService{



    setCustomer(customer){
      this._setCustomer(customer);
    }
  
 
  
    async getToken(){
      return this.getCustomer().jwtToken;
    }
  
    getCustomer(){
      return this._parseCustomer();
    }
    getCustomerId(){
      return (this.getCustomer().customer || {}).id;
    }
    checkIsLoggedIn(){
      const customer  = this.getCustomer().customer || {};
      return this.getCustomer();
    }
    checkUserVerified(){
      const customer  = this.getCustomer().customer || {};
      return customer.lastLoginTime!=null;
    }
    logout(){
      sessionStorage.clear();
    }
  
    _setCustomer(data){
      const userData = data || {};
      sessionStorage.setItem('customer',JSON.stringify(data));
    }
    _parseCustomer(){
      try{
        const data = sessionStorage.getItem('customer');
        return JSON.parse(data) || {};
      }catch(e){
        return {};
      }
    }
  
  
  }
  
  export default new CustomerAuthenticationService();