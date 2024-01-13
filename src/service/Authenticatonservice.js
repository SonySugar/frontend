class AuthenticationService{



    setUser(user){
      this._setUser(user);
    }
  
    async getToken(){
      return this.getUser().jwtToken;
    }
  
    getUser(){
      return this._parseUser();
    }
    getUserId(){
      return (this.getUser().systemUser || {}).id;
    }
    checkIsLoggedIn(){
      const user  = this.getUser().systemUser || {};
      return this.getUser();
    }
    checkUserVerified(){
      const user  = this.getUser().systemUser || {};
      return user.lastLoginTime!=null;
    }
    logout(){
      sessionStorage.clear();
    }
  
    _setUser(data){
      const userData = data || {};
      sessionStorage.setItem('user',JSON.stringify(data));
    }
    _parseUser(){
      try{
        const data = sessionStorage.getItem('user');
        return JSON.parse(data) || {};
      }catch(e){
        return {};
      }
    }
    getRoles() {
      return this.getUser().roles;
    }
  
  
  }
  
  export default new AuthenticationService();